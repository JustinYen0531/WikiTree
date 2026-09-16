const crypto = require('node:crypto');
const { collectSourceCandidates, canonicalUrl, normalizeCandidate, verifyCandidateUrls } = require('./exploration-sources.cjs');
const SOURCE_CATALOG = require('./src/data/exploration-source-catalog.json');
const SOURCE_BY_ID = new Map(SOURCE_CATALOG.map(source => [source.id, source]));

function compact(value, max = 4000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function score(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(5, number)) : fallback;
}

function stripCodeFence(value) {
  const raw = String(value || '').trim();
  const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : raw;
}

function parseExplorationReply(value) {
  let parsed;
  try { parsed = JSON.parse(stripCodeFence(value)); }
  catch { throw new Error('AI 回覆不是可保存的 JSON。'); }
  const rows = Array.isArray(parsed) ? parsed : parsed?.items;
  if (!Array.isArray(rows)) throw new Error('AI 回覆缺少 items 清單。');
  return rows.slice(0, 30);
}

function normalizeAiItem(input) {
  const source = input?.source || {};
  const candidate = normalizeCandidate({
    title: input?.title,
    url: source.url || input?.url,
    publishedAt: source.publishedAt || source.published_at || input?.publishedAt,
    summary: input?.summary,
    evidenceExcerpt: input?.sourceSupported || input?.source_supported || source.evidenceExcerpt,
    editorialSynthesis: input?.editorialSynthesis || input?.editorial_synthesis,
    platform: source.platform,
    author: source.author,
    scores: {
      relevance: score(input?.scores?.relevance, 3),
      importance: score(input?.scores?.importance, 3),
      freshness: score(input?.scores?.freshness, 3),
      confidence: score(input?.scores?.confidence, 0.5),
    },
  });
  if (!candidate?.summary || !candidate?.sourceSupported) return null;
  return candidate;
}

function feedbackGuidance(feedback, existingItems) {
  const byId = new Map(existingItems.map(item => [item.id, item]));
  const wanted = feedback.filter(row => row.action === 'want_more').slice(0, 8).map(row => byId.get(row.itemId)?.title).filter(Boolean);
  const buildNext = feedback.filter(row => row.action === 'want_to_build').slice(0, 8).map(row => byId.get(row.itemId)?.title).filter(Boolean);
  const avoided = feedback.filter(row => row.action === 'not_interested').slice(0, 12).map(row => byId.get(row.itemId)?.title).filter(Boolean);
  const excludedDomains = [...new Set(feedback.filter(row => row.action === 'exclude_source').map(row => row.sourceDomain).filter(Boolean))];
  return { wanted, buildNext, avoided, excludedDomains };
}

function configuredSourceScope(task) {
  const selected = (task.sources?.connectorIds || []).map(id => SOURCE_BY_ID.get(id)?.label || id);
  const urls = [...(task.sources?.customUrls || []), ...(task.sources?.directUrls || [])].flatMap(value => {
    try { return [new URL(value).hostname]; } catch { return []; }
  });
  return [...new Set([...selected, ...urls])];
}

function buildExplorationPrompt(task, candidates, asOfDate, guidance = {}) {
  const safeCandidates = candidates.slice(0, 60).map((item, index) => ({
    candidate: index + 1,
    title: item.title,
    url: item.source.url,
    platform: item.source.platform,
    author: item.source.author || '',
    publishedAt: item.source.publishedAt,
    evidenceExcerpt: item.source.evidenceExcerpt,
  }));
  return [
    '你正在執行 WikiTree 的「探索苗圃」任務。來源只是可質疑的參考，不是絕對事實。',
    `探索題目：${task.topic}`,
    task.instructions ? `補充要求：${task.instructions}` : '',
    configuredSourceScope(task).length ? `來源範圍：${configuredSourceScope(task).join('、')}。已收集候選與即時網路補充都應優先使用這些來源；若不足就少輸出，不可為湊數擴大範圍。` : '',
    `資料截止日期：${asOfDate}。最多輸出 ${task.itemCount} 筆，不足時就少輸出，不可硬湊。`,
    guidance.wanted?.length ? `使用者想延伸的方向：${guidance.wanted.join('；')}` : '',
    guidance.buildNext?.length ? `使用者想實作的方向：${guidance.buildNext.join('；')}` : '',
    guidance.avoided?.length ? `使用者不感興趣的方向，請降低相似內容：${guidance.avoided.join('；')}` : '',
    guidance.excludedDomains?.length ? `不可使用的網域：${guidance.excludedDomains.join(', ')}` : '',
    '你可以從下列已收集候選中選擇，也可在具備即時網路搜尋能力時補充公開來源。',
    JSON.stringify(safeCandidates),
    '只回傳 JSON，不要 Markdown。格式：{"items":[{"title":"","summary":"AI 摘要","sourceSupported":"來源直接支持的內容，不加入推論","editorialSynthesis":"AI 的整理、比較或推論，清楚保留不確定性","source":{"url":"真實公開網址","platform":"","author":"不知道就留空","publishedAt":"YYYY-MM-DD","evidenceExcerpt":"來源可支持內容的短摘述，不可虛構引文"},"scores":{"relevance":0,"importance":0,"freshness":0,"confidence":0}}]}',
    '每個網址、作者與日期都必須可由來源確認；無法確認就不要收錄。不得回傳未來日期。',
  ].filter(Boolean).join('\n\n');
}

async function runExploration(options) {
  const { store, workspace, taskId, generate } = options;
  if (!store || !workspace || !taskId || typeof generate !== 'function') throw new Error('探索執行缺少必要設定。');
  const task = store.getTask(workspace, taskId);
  if (!task || task.status === 'archived') throw new Error('找不到可執行的探索任務。');
  const now = options.now instanceof Date ? options.now : new Date(options.now || Date.now());
  const asOfDate = now.toISOString().slice(0, 10);
  const runId = options.runId || crypto.randomUUID();
  const runBase = {
    id: runId,
    taskId: task.id,
    origin: options.origin || 'scheduled_ai_exploration',
    scheduledFor: options.scheduledFor || null,
    startedAt: now.toISOString(),
    taskSnapshot: task,
    requestedCount: task.itemCount,
  };
  let attempts = [];
  store.writeRun(workspace, { ...runBase, status: 'running', attempts });
  try {
    const collected = await (options.collect || collectSourceCandidates)(task, asOfDate, {
      fetchImpl: options.fetchImpl,
      lookup: options.lookup,
    });
    const guidance = feedbackGuidance(store.listFeedback(workspace), store.listItems(workspace, { limit: 1000 }));
    task.sources.excludedDomains = [...new Set([...(task.sources.excludedDomains || []), ...guidance.excludedDomains])];
    collected.candidates = collected.candidates.filter(item => !guidance.excludedDomains.includes(item.source.domain));
    const prompt = buildExplorationPrompt(task, collected.candidates, asOfDate, guidance);
    let rows;
    let lastError;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const events = [];
      const attemptStartedAt = new Date().toISOString();
      try {
        const reply = await generate(prompt, event => {
          if (event?.type === 'search' || event?.type === 'status') events.push(event);
          options.onEvent?.(event);
        });
        rows = parseExplorationReply(reply);
        attempts.push({ number: attempt, status: 'completed', startedAt: attemptStartedAt, completedAt: new Date().toISOString(), prompt, searchEvents: events });
        break;
      } catch (error) {
        lastError = error;
        attempts.push({ number: attempt, status: 'failed', startedAt: attemptStartedAt, completedAt: new Date().toISOString(), prompt, searchEvents: events, error: compact(error.message, 1000) });
      }
    }
    if (!rows) throw lastError || new Error('AI 沒有提供可保存的探索結果。');
    const normalized = rows.map(normalizeAiItem).filter(Boolean).filter(item => item.source.publishedAt <= asOfDate);
    const unique = [];
    const seen = new Set();
    for (const item of normalized) {
      const key = `${canonicalUrl(item.source.url).toLowerCase()}|${item.source.publishedAt}`;
      if (!item.source.canonicalUrl || seen.has(key) || store.findItemByCanonical(workspace, item.source.canonicalUrl, item.source.publishedAt)) continue;
      seen.add(key);
      unique.push(item);
    }
    const checked = await (options.verify || verifyCandidateUrls)(unique.slice(0, task.itemCount), {
      fetchImpl: options.fetchImpl,
      lookup: options.lookup,
    });
    const items = checked.items.map(item => store.writeItem(workspace, {
      ...item,
      taskId: task.id,
      runId,
      origin: 'scheduled_ai_exploration',
      source: { ...item.source, provenance: { generatedBy: task.provider, model: task.model, asOfDate } },
    }));
    const status = items.length < task.itemCount ? 'complete_with_shortfall' : 'completed';
    const shortfallReason = items.length < task.itemCount
      ? `要求 ${task.itemCount} 筆，實際保存 ${items.length} 筆；其餘候選可能重複、缺少可驗證日期或網址無法訪問。`
      : '';
    return store.writeRun(workspace, {
      ...runBase,
      status,
      completedAt: new Date().toISOString(),
      attempts,
      sourceCollection: { ...collected.snapshot, urlChecks: checked.checks },
      itemIds: items.map(item => item.id),
      shortfallReason,
    });
  } catch (error) {
    store.writeRun(workspace, { ...runBase, status: 'failed', completedAt: new Date().toISOString(), attempts, error: compact(error.message, 1000) });
    throw error;
  }
}

module.exports = { buildExplorationPrompt, normalizeAiItem, parseExplorationReply, runExploration };
