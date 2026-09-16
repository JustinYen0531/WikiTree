const dns = require('dns').promises;
const net = require('net');
const SOURCE_CATALOG = require('./src/data/exploration-source-catalog.json');

const SOURCE_BY_ID = new Map(SOURCE_CATALOG.map(source => [source.id, source]));
const CONNECTOR_IDS = new Set(SOURCE_BY_ID.keys());
const UNSUPPORTED_IDS = new Set(['facebook', 'line', 'roboco']);

function compact(value, max = 1200) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function canonicalUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) return '';
    url.username = '';
    url.password = '';
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|ref$)/i.test(key)) url.searchParams.delete(key);
    }
    return url.href.replace(/\/$/, '');
  } catch { return ''; }
}

function dateOnly(value) {
  const parsed = new Date(value || '');
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
}

function isPrivateIp(address) {
  if (net.isIP(address) === 4) {
    const parts = address.split('.').map(Number);
    return parts[0] === 10 || parts[0] === 127 || parts[0] === 0 ||
      (parts[0] === 169 && parts[1] === 254) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) || parts[0] >= 224;
  }
  if (net.isIP(address) === 6) {
    const normalized = address.toLowerCase();
    return normalized === '::1' || normalized === '::' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb');
  }
  return true;
}

async function assertPublicUrl(value, lookup = dns.lookup) {
  const canonical = canonicalUrl(value);
  if (!canonical) throw new Error('來源網址必須是公開的 HTTP 或 HTTPS 網址。');
  const url = new URL(canonical);
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('來源網址不能指向本機或內部網路。');
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new Error('來源網址不能指向私有網路。');
  } else {
    const records = await lookup(host, { all: true });
    if (!records.length || records.some(record => isPrivateIp(record.address))) throw new Error('來源網址解析到私有網路。');
  }
  return canonical;
}

function decodeEntities(value) {
  return compact(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}

function firstMatch(block, patterns) {
  for (const pattern of patterns) {
    const match = block.match(pattern);
    if (match?.[1]) return decodeEntities(match[1]);
  }
  return '';
}

function normalizeCandidate(input = {}) {
  const url = canonicalUrl(input.url);
  const title = compact(input.title, 300);
  const publishedAt = dateOnly(input.publishedAt || input.date);
  const evidenceExcerpt = compact(input.evidenceExcerpt || input.description || input.summary || title);
  if (!url || !title || !publishedAt || !evidenceExcerpt) return null;
  return {
    title,
    summary: compact(input.summary || evidenceExcerpt, 2000),
    sourceSupported: evidenceExcerpt,
    editorialSynthesis: compact(input.editorialSynthesis, 2000),
    source: {
      url,
      canonicalUrl: url.toLowerCase(),
      domain: new URL(url).hostname.toLowerCase(),
      platform: compact(input.platform || new URL(url).hostname, 120),
      author: compact(input.author, 160),
      publishedAt,
      evidenceExcerpt,
    },
    scores: input.scores || { relevance: 3, importance: 3, freshness: 3, confidence: 0.5 },
  };
}

function parseFeed(xml, platform) {
  const blocks = [...String(xml || '').matchAll(/<(?:item|entry)\b[^>]*>[\s\S]*?<\/(?:item|entry)>/gi)].map(match => match[0]);
  return blocks.flatMap(block => {
    const candidate = normalizeCandidate({
      title: firstMatch(block, [/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i, /<title[^>]*>([\s\S]*?)<\/title>/i]),
      url: firstMatch(block, [/<link[^>]+href=["']([^"']+)["']/i, /<link[^>]*>([\s\S]*?)<\/link>/i]),
      publishedAt: firstMatch(block, [/<published[^>]*>([\s\S]*?)<\/published>/i, /<updated[^>]*>([\s\S]*?)<\/updated>/i, /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i]),
      description: firstMatch(block, [/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i, /<description[^>]*>([\s\S]*?)<\/description>/i, /<summary[^>]*>([\s\S]*?)<\/summary>/i, /<content[^>]*>([\s\S]*?)<\/content>/i]),
      platform,
    });
    return candidate ? [candidate] : [];
  });
}

async function fetchText(url, options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new Error('目前環境無法讀取網路來源。');
  const safeUrl = await assertPublicUrl(url, options.lookup || dns.lookup);
  const response = await fetchImpl(safeUrl, {
    method: options.method || 'GET',
    redirect: 'follow',
    headers: { Accept: 'application/json, application/rss+xml, application/xml, text/xml, text/html;q=0.8', 'User-Agent': 'WikiTreeExploration/1.0' },
    signal: AbortSignal.timeout(options.timeoutMs || 7000),
  });
  const body = options.method === 'HEAD' ? '' : await response.text();
  if (!response.ok) throw new Error(`來源回應 ${response.status}`);
  return { response, body, url: safeUrl };
}

async function collectConnector(id, task, options) {
  const query = encodeURIComponent(task.topic.slice(0, 240));
  if (id === 'github') {
    const { body } = await fetchText(`https://api.github.com/search/issues?q=${query}+is:public&sort=updated&order=desc&per_page=10`, options);
    return (JSON.parse(body).items || []).map(item => normalizeCandidate({ title: item.title, url: item.html_url, publishedAt: item.updated_at || item.created_at, description: item.body || item.title, platform: 'GitHub', author: item.user?.login })).filter(Boolean);
  }
  if (id === 'hacker-news') {
    const { body } = await fetchText(`https://hn.algolia.com/api/v1/search_by_date?query=${query}&tags=story&hitsPerPage=10`, options);
    return (JSON.parse(body).hits || []).map(item => normalizeCandidate({ title: item.title || item.story_title, url: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`, publishedAt: item.created_at, description: item.story_text || item.title, platform: 'Hacker News', author: item.author })).filter(Boolean);
  }
  if (id === 'reddit') {
    const { body } = await fetchText(`https://www.reddit.com/search.rss?q=${query}&sort=new&limit=10`, options);
    return parseFeed(body, 'Reddit');
  }
  if (id === 'devto') {
    const tag = encodeURIComponent(task.topic.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'ai');
    const { body } = await fetchText(`https://dev.to/api/articles?tag=${tag}&per_page=10`, options);
    return (JSON.parse(body) || []).map(item => normalizeCandidate({ title: item.title, url: item.url, publishedAt: item.published_at || item.created_at, description: item.description || item.title, platform: 'DEV.to', author: item.user?.name })).filter(Boolean);
  }
  const source = SOURCE_BY_ID.get(id);
  if (source?.kind === 'rss' && source.feedUrl) {
    const { body } = await fetchText(source.feedUrl, options);
    return parseFeed(body, source.label);
  }
  return [];
}

async function collectCustom(url, options) {
  const { response, body } = await fetchText(url, options);
  const type = response.headers?.get?.('content-type') || '';
  if (/xml|rss|atom/i.test(type) || /^\s*<(?:rss|feed|\?xml)/i.test(body)) return parseFeed(body, new URL(url).hostname);
  return [normalizeCandidate({
    title: firstMatch(body, [/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i, /<title[^>]*>([\s\S]*?)<\/title>/i]),
    url,
    publishedAt: firstMatch(body, [/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i, /<time[^>]+datetime=["']([^"']+)["']/i]) || response.headers?.get?.('last-modified'),
    description: firstMatch(body, [/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i]),
    platform: new URL(url).hostname,
  })].filter(Boolean);
}

async function collectSourceCandidates(task, asOfDate, options = {}) {
  const connectorIds = task.sources?.directUrls?.length ? [] : (task.sources?.connectorIds || []);
  const urls = task.sources?.directUrls?.length ? task.sources.directUrls : (task.sources?.customUrls || []);
  const records = [];
  const candidates = [];
  for (const id of connectorIds) {
    const source = SOURCE_BY_ID.get(id);
    if (UNSUPPORTED_IDS.has(id)) {
      records.push({ id, label: id, status: 'unsupported', count: 0, note: '需要官方 API、合法授權或手動匯入；未進行爬取。' });
      continue;
    }
    if (!CONNECTOR_IDS.has(id)) {
      records.push({ id, label: id, status: 'unavailable', count: 0 });
      continue;
    }
    try {
      const found = await collectConnector(id, task, options);
      candidates.push(...found);
      records.push({ id, label: source?.label || id, status: found.length ? 'ok' : 'empty', count: found.length });
    } catch (error) {
      records.push({ id, label: source?.label || id, status: 'error', count: 0, error: compact(error.message, 200) });
    }
  }
  for (const url of urls) {
    try {
      const found = await collectCustom(url, options);
      candidates.push(...found);
      records.push({ id: `url:${canonicalUrl(url)}`, status: found.length ? 'ok' : 'empty', count: found.length });
    } catch (error) {
      records.push({ id: `url:${canonicalUrl(url)}`, status: 'error', count: 0, error: compact(error.message, 200) });
    }
  }
  const excluded = new Set(task.sources?.excludedDomains || []);
  const seen = new Set();
  const accepted = candidates.filter(item => {
    const canonical = item.source.canonicalUrl;
    if (!canonical || seen.has(canonical)) return false;
    if (excluded.has(item.source.domain)) return false;
    if (asOfDate && item.source.publishedAt > asOfDate) return false;
    seen.add(canonical);
    return true;
  }).slice(0, 100);
  return { candidates: accepted, snapshot: { version: 'exploration-source-v1', asOfDate, connectors: records, candidateCount: accepted.length, policy: '只使用公開介面、RSS、指定網址或合法授權；無法讀取時明確標記。' } };
}

async function verifyCandidateUrls(items, options = {}) {
  const results = [];
  for (const item of items) {
    try {
      const safeUrl = await assertPublicUrl(item.source?.url, options.lookup || dns.lookup);
      let response = await (options.fetchImpl || globalThis.fetch)(safeUrl, { method: 'HEAD', redirect: 'follow', headers: { 'User-Agent': 'WikiTreeExploration/1.0' }, signal: AbortSignal.timeout(options.timeoutMs || 5000) });
      if ([403, 405, 406, 429, 500, 501].includes(response.status)) response = await (options.fetchImpl || globalThis.fetch)(safeUrl, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'WikiTreeExploration/1.0', Range: 'bytes=0-2048' }, signal: AbortSignal.timeout(options.timeoutMs || 5000) });
      results.push({ item: { ...item, urlCheck: { accessible: response.status >= 200 && response.status < 400, status: response.status } }, accepted: response.status >= 200 && response.status < 400 });
    } catch (error) {
      results.push({ item: { ...item, urlCheck: { accessible: false, status: 0, reason: compact(error.message, 200) } }, accepted: false });
    }
  }
  return { items: results.filter(result => result.accepted).map(result => result.item), checks: results.map(result => ({ url: result.item.source?.url, ...result.item.urlCheck })) };
}

module.exports = { SOURCE_CATALOG, CONNECTOR_IDS, UNSUPPORTED_IDS, assertPublicUrl, canonicalUrl, collectSourceCandidates, normalizeCandidate, parseFeed, verifyCandidateUrls };
