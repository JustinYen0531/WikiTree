const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { canonicalUrl, normalizeCandidate } = require('./exploration-sources.cjs');

function legacyDate(item, fallback) {
  const value = item?.source?.published_at || item?.date || fallback;
  const parsed = new Date(value || '');
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString().slice(0, 10);
}

function normalizeLegacyItem(item, fallbackDate) {
  return normalizeCandidate({
    title: item.title,
    url: item.source?.url || item.url,
    publishedAt: legacyDate(item, fallbackDate),
    platform: item.source?.platform || item.sourceType || item.source,
    author: item.source?.author || '',
    summary: item.takeaway || item.summary || item.evidence,
    evidenceExcerpt: item.source?.evidence_excerpt || item.source_says || item.evidence,
    editorialSynthesis: item.editorial_synthesis || item.principle || '',
    scores: item.scores || { relevance: 3, importance: item.importance || 3, freshness: item.heat || 2, confidence: 0.5 },
  });
}

function importLegacyBrew(store, workspace, brewRoot) {
  const dailyDir = path.join(path.resolve(brewRoot), 'outputs', 'vibe-coding-daily-brew', 'daily');
  if (!fs.existsSync(dailyDir)) throw new Error('找不到舊 Brew 的 daily 資料夾。');
  let task = store.listTasks(workspace, { includeArchived: true }).find(item => item.origin === 'legacy_brew_import');
  if (!task) {
    task = store.saveTask(workspace, { name: '舊 Brew 歷史', topic: '從舊 Brew 匯入的探索歷史', status: 'archived', schedule: { kind: 'manual' }, provider: 'openai', model: 'imported' });
    const tasks = store.listTasks(workspace, { includeArchived: true });
    const index = tasks.findIndex(item => item.id === task.id);
    tasks[index].origin = 'legacy_brew_import';
    const { atomicWrite } = require('./exploration-store.cjs');
    atomicWrite(store.tasksFile(workspace), tasks);
    task = tasks[index];
  }
  const files = fs.readdirSync(dailyDir).filter(name => /^\d{4}-\d{2}-\d{2}\.json$/.test(name)).sort();
  let imported = 0;
  let skipped = 0;
  const runIds = [];
  for (const file of files) {
    const runDate = file.slice(0, 10);
    let payload;
    try { payload = JSON.parse(fs.readFileSync(path.join(dailyDir, file), 'utf8')); }
    catch { skipped += 1; continue; }
    const candidates = (Array.isArray(payload.items) ? payload.items : []).map(item => normalizeLegacyItem(item, runDate)).filter(Boolean);
    const runId = crypto.createHash('sha256').update(`legacy-brew:${runDate}`).digest('hex').slice(0, 32);
    const itemIds = [];
    for (const candidate of candidates) {
      const existing = store.findItemByCanonical(workspace, canonicalUrl(candidate.source.url).toLowerCase(), candidate.source.publishedAt);
      if (existing) { skipped += 1; itemIds.push(existing.id); continue; }
      const item = store.writeItem(workspace, { ...candidate, taskId: task.id, runId, origin: 'legacy_brew_import', read: true, archived: true, createdAt: payload.generated_at || `${runDate}T00:00:00.000Z` });
      itemIds.push(item.id);
      imported += 1;
    }
    store.writeRun(workspace, { id: runId, taskId: task.id, origin: 'legacy_brew_import', status: itemIds.length ? 'complete' : 'complete_with_shortfall', scheduledFor: `${runDate}T00:00:00.000Z`, startedAt: payload.generated_at || `${runDate}T00:00:00.000Z`, completedAt: payload.generated_at || `${runDate}T00:00:00.000Z`, requestedCount: Math.min(10, Math.max(1, Number(payload.requested_count) || itemIds.length || 1)), itemIds, taskSnapshot: { importedFile: file, originalProvider: payload.provider || '', originalModel: payload.model || '' }, shortfallReason: itemIds.length ? '' : '舊檔沒有可匯入的有效來源。' });
    runIds.push(runId);
  }
  return { imported, skipped, runs: runIds.length, taskId: task.id };
}

module.exports = { importLegacyBrew, normalizeLegacyItem };
