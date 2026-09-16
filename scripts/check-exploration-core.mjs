import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ExplorationStore, workspaceId } = require('../exploration-store.cjs');
const { SOURCE_CATALOG, assertPublicUrl, canonicalUrl, collectSourceCandidates, normalizeCandidate, verifyCandidateUrls } = require('../exploration-sources.cjs');
const { importLegacyBrew } = require('../exploration-import.cjs');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wikitree-exploration-core-'));
const workspaceA = path.join(root, 'forest-a');
const workspaceB = path.join(root, 'forest-b');
fs.mkdirSync(workspaceA);
fs.mkdirSync(workspaceB);
let now = new Date('2026-09-13T01:00:00.000Z');
const store = new ExplorationStore({ root: path.join(root, 'store'), now: () => new Date(now) });

assert.notEqual(workspaceId(workspaceA), workspaceId(workspaceB));
const taskA = store.saveTask(workspaceA, { name: '陌生知識', topic: '探索可驗證的新學習方法', itemCount: 5, schedule: { kind: 'weekdays', localTime: '08:30' } });
store.saveTask(workspaceB, { name: '另一座森林', topic: '完全不同的主題' });
assert.equal(store.listTasks(workspaceA).length, 1);
assert.equal(store.listTasks(workspaceB).length, 1);
assert.deepEqual(taskA.schedule.daysOfWeek, [1, 2, 3, 4, 5]);
assert.equal(taskA.notificationEnabled, false);
console.log('PASS task validation and workspace isolation');

const candidate = normalizeCandidate({ title: '一筆素材', url: 'https://example.com/a?utm_source=test', publishedAt: '2026-09-12', description: '來源支持的短摘要' });
assert.equal(canonicalUrl(candidate.source.url), 'https://example.com/a');
const item = store.writeItem(workspaceA, { ...candidate, taskId: taskA.id, runId: 'run-1', summary: 'secret sk-proj-abcdefghijklmnop' });
assert.ok(!store.getItem(workspaceA, item.id).summary.includes('sk-proj-'));
assert.equal(store.getItem(workspaceB, item.id), null);
store.setBasket(workspaceA, [item.id]);
assert.equal(store.referenceSources(workspaceA, [item.id])[0].source.url, 'https://example.com/a');
assert.throws(() => store.setBasket(workspaceA, Array.from({ length: 11 }, (_, index) => String(index))), /最多/);
console.log('PASS atomic local storage, credential redaction, basket scoping and limit');

store.applyFeedback(workspaceA, item.id, 'saved');
assert.equal(store.listReviews(workspaceA)[0].dueOn, '2026-09-20');
now = new Date('2026-09-14T01:00:00.000Z');
store.applyFeedback(workspaceA, item.id, 'priority_saved');
assert.deepEqual(store.listReviews(workspaceA).map(review => review.intervalDays).sort((a, b) => a - b), [3, 14, 45]);
console.log('PASS saved and priority revisit rhythm');

const lookup = async () => [{ address: '93.184.216.34' }];
assert.equal(await assertPublicUrl('https://example.com/a', lookup), 'https://example.com/a');
await assert.rejects(() => assertPublicUrl('http://127.0.0.1/private', lookup), /私有網路/);
await assert.rejects(() => assertPublicUrl('file:///secret', lookup), /HTTP/);
const mockFetch = async url => {
  if (String(url).includes('api.github.com')) return { ok: true, status: 200, headers: { get: () => 'application/json' }, text: async () => JSON.stringify({ items: [{ title: '公開討論', html_url: 'https://github.com/example/repo/issues/1', updated_at: '2026-09-12T00:00:00Z', body: '具體做法', user: { login: 'author' } }] }) };
  if (String(url).includes('smithsonianmag.com')) return { ok: true, status: 200, headers: { get: () => 'application/rss+xml' }, text: async () => '<rss><channel><item><title>歷史中的知識保存</title><link>https://www.smithsonianmag.com/history/knowledge/</link><pubDate>Fri, 12 Sep 2026 00:00:00 GMT</pubDate><description>可驗證的歷史摘要</description></item></channel></rss>' };
  return { ok: true, status: 200, headers: { get: () => 'text/html' }, text: async () => '' };
};
const collection = await collectSourceCandidates({ topic: 'agent workflow', sources: { connectorIds: ['github', 'facebook'], customUrls: [], directUrls: [], excludedDomains: [] } }, '2026-09-13', { fetchImpl: mockFetch, lookup });
assert.equal(collection.candidates.length, 1);
assert.equal(collection.snapshot.connectors.find(record => record.id === 'facebook').status, 'unsupported');
const verified = await verifyCandidateUrls(collection.candidates, { fetchImpl: mockFetch, lookup });
assert.equal(verified.items.length, 1);
assert.equal(new Set(SOURCE_CATALOG.map(source => source.id)).size, SOURCE_CATALOG.length);
assert.ok(SOURCE_CATALOG.filter(source => source.kind === 'rss').every(source => source.feedUrl.startsWith('https://')));
const historyCollection = await collectSourceCandidates({ topic: '文明與知識保存', sources: { connectorIds: ['smithsonian'], customUrls: [], directUrls: [], excludedDomains: [] } }, '2026-09-13', { fetchImpl: mockFetch, lookup });
assert.equal(historyCollection.candidates.length, 1);
assert.equal(historyCollection.candidates[0].source.platform, 'Smithsonian Magazine');
console.log('PASS public-source guard, catalog RSS connectors, cutoff, dedupe and URL verification');

const brew = path.join(root, 'brew');
const daily = path.join(brew, 'outputs', 'vibe-coding-daily-brew', 'daily');
fs.mkdirSync(path.join(daily, 'generation-runs'), { recursive: true });
const legacy = { generated_at: '2026-09-12T06:00:00Z', items: [{ title: '舊素材', takeaway: '舊摘要', source_says: '舊來源支持內容', editorial_synthesis: '舊編輯整理', source: { url: 'https://example.com/legacy', platform: 'Example', author: 'A', published_at: '2026-09-11', evidence_excerpt: '證據' } }] };
fs.writeFileSync(path.join(daily, '2026-09-12.json'), JSON.stringify(legacy));
fs.writeFileSync(path.join(daily, 'latest.json'), JSON.stringify(legacy));
assert.deepEqual(importLegacyBrew(store, workspaceA, brew), { imported: 1, skipped: 0, runs: 1, taskId: store.listTasks(workspaceA, { includeArchived: true }).find(task => task.origin === 'legacy_brew_import').id });
const second = importLegacyBrew(store, workspaceA, brew);
assert.equal(second.imported, 0);
assert.equal(second.skipped, 1);
assert.equal(store.listItems(workspaceA, { archived: true }).filter(entry => entry.origin === 'legacy_brew_import').length, 1);
console.log('PASS legacy Brew import handles dated files, ignores latest and stays idempotent');

console.log('exploration core contract: OK');
