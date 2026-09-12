const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const STORE_VERSION = 'exploration-v1';
const TASK_STATUSES = new Set(['active', 'paused', 'archived']);
const SCHEDULE_KINDS = new Set(['manual', 'daily', 'weekdays', 'weekly', 'monthly']);
const FEEDBACK_ACTIONS = new Set([
  'read', 'unread', 'saved', 'priority_saved', 'unsaved', 'want_more',
  'want_to_build', 'not_interested', 'exclude_source', 'archive', 'converted',
]);
const SECRET_KEY = /(api[_-]?key|access[_-]?token|refresh[_-]?token|authorization|password|secret|bearer)/i;
const SECRET_VALUES = [
  /\bsk-(?:or-v1-|ant-|proj-)?[A-Za-z0-9_-]{12,}/gi,
  /\bsb_secret_[A-Za-z0-9_-]{10,}/gi,
  /\bBearer\s+[A-Za-z0-9._-]{16,}/gi,
];

function defaultRoot() {
  const base = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  return path.join(base, 'WikiTree', STORE_VERSION);
}

function normalizeWorkspacePath(value) {
  return path.resolve(String(value || '')).replace(/[\\/]+$/, '').toLowerCase();
}

function workspaceId(value) {
  return crypto.createHash('sha256').update(normalizeWorkspacePath(value)).digest('hex').slice(0, 24);
}

function redactText(value, max = 12000) {
  let result = String(value || '');
  for (const pattern of SECRET_VALUES) result = result.replace(pattern, '[已移除敏感憑證]');
  return result.slice(0, max);
}

function sanitize(value, depth = 0) {
  if (depth > 7) return '[內容層級過深]';
  if (value === null || typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'string') return redactText(value);
  if (Array.isArray(value)) return value.slice(0, 100).map(item => sanitize(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).slice(0, 120).flatMap(([key, item]) => {
      if (SECRET_KEY.test(key)) return [];
      return [[String(key).slice(0, 100), sanitize(item, depth + 1)]];
    }));
  }
  return undefined;
}

function readJson(file, fallback) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function atomicWrite(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(sanitize(value), null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, file);
}

function text(value, max = 1000) {
  return redactText(typeof value === 'string' ? value.trim() : '', max);
}

function clampInteger(value, min, max, fallback) {
  const number = Number(value);
  return Number.isInteger(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function normalizeTime(value) {
  const raw = text(value, 5);
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(raw) ? raw : '09:00';
}

function normalizeSchedule(input = {}) {
  const kind = SCHEDULE_KINDS.has(input.kind) ? input.kind : 'manual';
  const rawDays = Array.isArray(input.daysOfWeek) ? input.daysOfWeek : [];
  const daysOfWeek = [...new Set(rawDays.map(Number).filter(day => Number.isInteger(day) && day >= 1 && day <= 7))].sort();
  return {
    kind,
    localTime: normalizeTime(input.localTime),
    daysOfWeek: kind === 'weekdays' ? (daysOfWeek.length ? daysOfWeek : [1, 2, 3, 4, 5]) : kind === 'weekly' ? [daysOfWeek[0] || 1] : [],
    dayOfMonth: kind === 'monthly' ? clampInteger(input.dayOfMonth, 1, 31, 1) : null,
  };
}

function normalizeUrlList(values, limit = 20) {
  return [...new Set((Array.isArray(values) ? values : []).map(value => text(value, 1000)).filter(Boolean))].slice(0, limit);
}

function normalizeTask(input = {}, previous = null, now = new Date()) {
  const createdAt = previous?.createdAt || now.toISOString();
  const topic = text(input.topic ?? previous?.topic, 2000);
  if (!topic) throw new Error('探索題目不能是空白。');
  const name = text(input.name ?? previous?.name, 120) || topic.slice(0, 32);
  const provider = ['agy', 'openai'].includes(input.provider ?? previous?.provider) ? (input.provider ?? previous?.provider) : 'agy';
  const status = TASK_STATUSES.has(input.status ?? previous?.status) ? (input.status ?? previous?.status) : 'active';
  const sources = input.sources || previous?.sources || {};
  return {
    schemaVersion: STORE_VERSION,
    id: previous?.id || crypto.randomUUID(),
    name,
    topic,
    instructions: text(input.instructions ?? previous?.instructions, 3000),
    provider,
    model: text(input.model ?? previous?.model, 160) || 'default',
    itemCount: clampInteger(input.itemCount ?? previous?.itemCount, 1, 10, 5),
    schedule: normalizeSchedule(input.schedule || previous?.schedule),
    notificationEnabled: Boolean(input.notificationEnabled ?? previous?.notificationEnabled ?? false),
    status,
    sources: {
      connectorIds: [...new Set((Array.isArray(sources.connectorIds) ? sources.connectorIds : ['github', 'hacker-news', 'reddit', 'devto']).map(value => text(value, 80)).filter(Boolean))].slice(0, 20),
      customUrls: normalizeUrlList(sources.customUrls),
      directUrls: normalizeUrlList(sources.directUrls, 10),
      excludedDomains: [...new Set((Array.isArray(sources.excludedDomains) ? sources.excludedDomains : []).map(value => text(value, 255).toLowerCase()).filter(Boolean))].slice(0, 50),
    },
    createdAt,
    updatedAt: now.toISOString(),
    archivedAt: status === 'archived' ? (previous?.archivedAt || now.toISOString()) : null,
  };
}

class ExplorationStore {
  constructor(options = {}) {
    this.root = path.resolve(options.root || defaultRoot());
    this.now = typeof options.now === 'function' ? options.now : () => new Date();
  }

  rootPath() { return this.root; }
  registryFile() { return path.join(this.root, 'registry.json'); }
  workspaceDir(workspace) { return path.join(this.root, 'workspaces', workspaceId(workspace)); }
  tasksFile(workspace) { return path.join(this.workspaceDir(workspace), 'tasks.json'); }
  basketFile(workspace) { return path.join(this.workspaceDir(workspace), 'basket.json'); }
  feedbackFile(workspace) { return path.join(this.workspaceDir(workspace), 'feedback.json'); }
  reviewsFile(workspace) { return path.join(this.workspaceDir(workspace), 'reviews.json'); }
  runsDir(workspace) { return path.join(this.workspaceDir(workspace), 'runs'); }
  itemsDir(workspace) { return path.join(this.workspaceDir(workspace), 'items'); }

  registerWorkspace(workspace) {
    const absolute = path.resolve(workspace);
    const id = workspaceId(absolute);
    const registry = readJson(this.registryFile(), { schemaVersion: STORE_VERSION, workspaces: [] });
    const current = Array.isArray(registry.workspaces) ? registry.workspaces.filter(item => item?.id !== id) : [];
    current.push({ id, path: absolute, lastSeenAt: this.now().toISOString() });
    atomicWrite(this.registryFile(), { schemaVersion: STORE_VERSION, workspaces: current });
    fs.mkdirSync(this.workspaceDir(absolute), { recursive: true });
    return { id, path: absolute };
  }

  listWorkspaces() {
    return readJson(this.registryFile(), { workspaces: [] }).workspaces || [];
  }

  listTasks(workspace, { includeArchived = false } = {}) {
    const tasks = readJson(this.tasksFile(workspace), []);
    return (Array.isArray(tasks) ? tasks : []).filter(task => includeArchived || task.status !== 'archived');
  }

  getTask(workspace, id) {
    return this.listTasks(workspace, { includeArchived: true }).find(task => task.id === id) || null;
  }

  saveTask(workspace, input) {
    this.registerWorkspace(workspace);
    const tasks = this.listTasks(workspace, { includeArchived: true });
    const index = input.id ? tasks.findIndex(task => task.id === input.id) : -1;
    if (input.id && index < 0) throw new Error('找不到這個探索任務。');
    const normalized = normalizeTask(input, index >= 0 ? tasks[index] : null, this.now());
    if (index >= 0) tasks[index] = normalized;
    else tasks.unshift(normalized);
    atomicWrite(this.tasksFile(workspace), tasks);
    return normalized;
  }

  archiveTask(workspace, id) {
    const task = this.getTask(workspace, id);
    if (!task) throw new Error('找不到這個探索任務。');
    return this.saveTask(workspace, { ...task, status: 'archived' });
  }

  writeRun(workspace, input) {
    this.registerWorkspace(workspace);
    const current = input.id ? this.getRun(workspace, input.id) : null;
    const run = {
      schemaVersion: STORE_VERSION,
      id: current?.id || input.id || crypto.randomUUID(),
      taskId: text(input.taskId ?? current?.taskId, 80),
      origin: text(input.origin ?? current?.origin, 80) || 'scheduled_ai_exploration',
      status: text(input.status ?? current?.status, 80) || 'pending',
      scheduledFor: input.scheduledFor ?? current?.scheduledFor ?? null,
      startedAt: input.startedAt ?? current?.startedAt ?? null,
      completedAt: input.completedAt ?? current?.completedAt ?? null,
      taskSnapshot: sanitize(input.taskSnapshot ?? current?.taskSnapshot ?? {}),
      attempts: sanitize(input.attempts ?? current?.attempts ?? []),
      sourceCollection: sanitize(input.sourceCollection ?? current?.sourceCollection ?? null),
      itemIds: [...new Set((input.itemIds ?? current?.itemIds ?? []).map(String))].slice(0, 100),
      requestedCount: clampInteger(input.requestedCount ?? current?.requestedCount, 1, 10, 5),
      shortfallReason: text(input.shortfallReason ?? current?.shortfallReason, 500),
      error: text(input.error ?? current?.error, 1000),
      createdAt: current?.createdAt || this.now().toISOString(),
      updatedAt: this.now().toISOString(),
    };
    atomicWrite(path.join(this.runsDir(workspace), `${run.id}.json`), run);
    return run;
  }

  getRun(workspace, id) {
    return readJson(path.join(this.runsDir(workspace), `${id}.json`), null);
  }

  listRuns(workspace, { taskId = '', limit = 100 } = {}) {
    let files = [];
    try { files = fs.readdirSync(this.runsDir(workspace)).filter(name => name.endsWith('.json')); } catch {}
    return files.map(name => readJson(path.join(this.runsDir(workspace), name), null)).filter(Boolean)
      .filter(run => !taskId || run.taskId === taskId)
      .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
      .slice(0, Math.min(500, Math.max(1, Number(limit) || 100)));
  }

  writeItem(workspace, input) {
    this.registerWorkspace(workspace);
    const id = input.id || crypto.randomUUID();
    const current = this.getItem(workspace, id);
    const item = {
      schemaVersion: STORE_VERSION,
      id,
      taskId: text(input.taskId ?? current?.taskId, 80),
      runId: text(input.runId ?? current?.runId, 80),
      origin: text(input.origin ?? current?.origin, 80) || 'scheduled_ai_exploration',
      title: text(input.title ?? current?.title, 300),
      summary: text(input.summary ?? current?.summary, 4000),
      sourceSupported: text(input.sourceSupported ?? current?.sourceSupported, 4000),
      editorialSynthesis: text(input.editorialSynthesis ?? current?.editorialSynthesis, 4000),
      source: sanitize(input.source ?? current?.source ?? {}),
      scores: sanitize(input.scores ?? current?.scores ?? {}),
      urlCheck: sanitize(input.urlCheck ?? current?.urlCheck ?? null),
      read: Boolean(input.read ?? current?.read ?? false),
      favoriteLevel: clampInteger(input.favoriteLevel ?? current?.favoriteLevel, 0, 2, 0),
      archived: Boolean(input.archived ?? current?.archived ?? false),
      converted: Boolean(input.converted ?? current?.converted ?? false),
      createdAt: current?.createdAt || input.createdAt || this.now().toISOString(),
      updatedAt: this.now().toISOString(),
    };
    if (!item.title || !item.source?.url) throw new Error('探索素材缺少標題或來源網址。');
    atomicWrite(path.join(this.itemsDir(workspace), `${id}.json`), item);
    return item;
  }

  getItem(workspace, id) {
    return readJson(path.join(this.itemsDir(workspace), `${id}.json`), null);
  }

  listItems(workspace, filters = {}) {
    let files = [];
    try { files = fs.readdirSync(this.itemsDir(workspace)).filter(name => name.endsWith('.json')); } catch {}
    return files.map(name => readJson(path.join(this.itemsDir(workspace), name), null)).filter(Boolean)
      .filter(item => !filters.taskId || item.taskId === filters.taskId)
      .filter(item => !filters.runId || item.runId === filters.runId)
      .filter(item => filters.archived === undefined || item.archived === filters.archived)
      .filter(item => filters.unread !== true || !item.read)
      .filter(item => filters.saved !== true || item.favoriteLevel > 0)
      .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
      .slice(0, Math.min(1000, Math.max(1, Number(filters.limit) || 300)));
  }

  findItemByCanonical(workspace, canonicalUrl, originDate = '') {
    return this.listItems(workspace, { limit: 1000 }).find(item => {
      const date = item.source?.publishedAt || item.source?.published_at || item.source?.date || '';
      return item.source?.canonicalUrl === canonicalUrl && (!originDate || date === originDate);
    }) || null;
  }

  updateItem(workspace, id, patch) {
    const item = this.getItem(workspace, id);
    if (!item) throw new Error('找不到這筆探索素材。');
    return this.writeItem(workspace, { ...item, ...patch, id });
  }

  applyFeedback(workspace, id, action) {
    if (!FEEDBACK_ACTIONS.has(action)) throw new Error('不支援這個素材動作。');
    const item = this.getItem(workspace, id);
    if (!item) throw new Error('找不到這筆探索素材。');
    const patch = {};
    if (action === 'read') patch.read = true;
    if (action === 'unread') patch.read = false;
    if (action === 'saved') patch.favoriteLevel = 1;
    if (action === 'priority_saved') patch.favoriteLevel = 2;
    if (action === 'unsaved' || action === 'not_interested') patch.favoriteLevel = 0;
    if (action === 'archive' || action === 'not_interested') patch.archived = true;
    if (action === 'converted') patch.converted = true;
    const updated = this.updateItem(workspace, id, patch);
    const feedback = readJson(this.feedbackFile(workspace), []);
    feedback.unshift({ id: crypto.randomUUID(), itemId: id, taskId: item.taskId, action, sourceDomain: item.source?.domain || '', createdAt: this.now().toISOString() });
    atomicWrite(this.feedbackFile(workspace), feedback.slice(0, 1000));
    let reviews = readJson(this.reviewsFile(workspace), []).filter(review => review.itemId !== id || review.status !== 'pending');
    const intervals = action === 'priority_saved' ? [3, 14, 45] : action === 'saved' ? [7] : [];
    for (const days of intervals) {
      const due = new Date(this.now());
      due.setDate(due.getDate() + days);
      reviews.push({ id: crypto.randomUUID(), itemId: id, dueOn: due.toISOString().slice(0, 10), intervalDays: days, status: 'pending' });
    }
    atomicWrite(this.reviewsFile(workspace), reviews);
    return updated;
  }

  listFeedback(workspace) { return readJson(this.feedbackFile(workspace), []); }
  listReviews(workspace) { return readJson(this.reviewsFile(workspace), []); }

  getBasket(workspace) {
    const ids = readJson(this.basketFile(workspace), []);
    return (Array.isArray(ids) ? ids : []).map(id => this.getItem(workspace, id)).filter(Boolean);
  }

  setBasket(workspace, ids) {
    const unique = [...new Set((Array.isArray(ids) ? ids : []).map(String))];
    if (unique.length > 10) throw new Error('來源籃一次最多放入 10 筆素材。');
    for (const id of unique) if (!this.getItem(workspace, id)) throw new Error('來源籃包含不屬於目前工作區的素材。');
    atomicWrite(this.basketFile(workspace), unique);
    return this.getBasket(workspace);
  }

  referenceSources(workspace, ids) {
    const unique = [...new Set((Array.isArray(ids) ? ids : []).map(String))];
    if (unique.length > 10) throw new Error('一次最多提供 10 筆參考來源。');
    return unique.map(id => this.getItem(workspace, id)).filter(Boolean).map(item => ({
      id: item.id,
      taskId: item.taskId,
      runId: item.runId,
      title: item.title,
      summary: item.summary,
      sourceSupported: item.sourceSupported,
      editorialSynthesis: item.editorialSynthesis,
      source: {
        url: item.source?.url || '',
        platform: item.source?.platform || '',
        author: item.source?.author || '',
        publishedAt: item.source?.publishedAt || '',
        evidenceExcerpt: item.source?.evidenceExcerpt || '',
      },
    }));
  }
}

module.exports = {
  ExplorationStore,
  FEEDBACK_ACTIONS,
  STORE_VERSION,
  atomicWrite,
  defaultRoot,
  normalizeSchedule,
  normalizeTask,
  normalizeWorkspacePath,
  readJson,
  redactText,
  sanitize,
  workspaceId,
};
