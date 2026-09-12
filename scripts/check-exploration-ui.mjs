import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ExplorationStore } = require('../exploration-store.cjs');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wikitree-exploration-ui-'));
const first = path.join(root, 'first');
const second = path.join(root, 'second');
fs.mkdirSync(first); fs.mkdirSync(second);
const store = new ExplorationStore({ root: path.join(root, 'data'), now: () => new Date('2026-09-14T00:00:00.000Z') });

try {
  const one = store.writeItem(first, { title: 'First source', sourceSupported: 'Supported', editorialSynthesis: 'Inference', source: { url: 'https://example.com/one', canonicalUrl: 'https://example.com/one', domain: 'example.com', publishedAt: '2026-09-12' } });
  const two = store.writeItem(second, { title: 'Second source', sourceSupported: 'Supported', editorialSynthesis: 'Inference', source: { url: 'https://example.org/two', canonicalUrl: 'https://example.org/two', domain: 'example.org', publishedAt: '2026-09-12' } });
  assert.throws(() => store.referenceSources(first, [two.id]), /不屬於目前工作區/);
  assert.equal(store.referenceSources(first, [one.id])[0].source.url, 'https://example.com/one');
  assert.equal(store.getItem(first, '../registry'), null);
  console.log('PASS source references are reduced, safe and workspace-scoped');

  store.setBasket(first, [one.id]);
  assert.equal(store.deleteItem(first, one.id), true);
  assert.equal(store.getItem(first, one.id), null);
  assert.equal(store.getBasket(first).length, 0);
  console.log('PASS permanent deletion removes the exact item and basket reference');

  const ui = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'ExplorationNursery.tsx'), 'utf8');
  for (const contract of ['探索苗圃', '來源支持的內容', 'AI 整理／推論', 'AI 自動排程探索', '交給 AI 整理草稿', '建立新葉片', '插入現有筆記', '永久刪除']) assert.match(ui + fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'AntigravityPlugin.tsx'), 'utf8'), new RegExp(contract));
  assert.equal((ui.match(/window\.confirm\(/g) || []).length >= 3, true, 'archive plus two permanent-delete confirmations must remain visible');
  const css = fs.readFileSync(path.join(process.cwd(), 'src', 'index.css'), 'utf8');
  assert.match(css, /grid-template-columns:\s*minmax\(210px, 250px\).*minmax\(430px, 1fr\).*minmax\(250px, 310px\)/);
  assert.match(css, /@media \(max-width: 820px\)[\s\S]*\.source-basket-pane[\s\S]*position: sticky/);
  console.log('PASS three-pane desktop layout, narrow-screen basket and claim separation');

  const app = fs.readFileSync(path.join(process.cwd(), 'src', 'App.tsx'), 'utf8');
  const chat = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'AntigravityPlugin.tsx'), 'utf8');
  const server = fs.readFileSync(path.join(process.cwd(), 'cli-server.cjs'), 'utf8');
  assert.match(app, /referenceHandoff=\{explorationHandoff\}/);
  assert.match(chat, /referenceSourceIds: currentReferenceIds/);
  assert.match(chat, /onCreateContent\(note\)/);
  assert.match(server, /referenceSources\(currentWorkspace, referenceSourceIds\)/);
  assert.match(server, /origin: "scheduled_ai_exploration"/);
  assert.match(server, /source_ids:/);
  assert.match(server, /來源只是可參考、可質疑的來源|資料只是可參考、可質疑的來源/);
  console.log('PASS source basket handoff, preview actions and exploration frontmatter contract');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
