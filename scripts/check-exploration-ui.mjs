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

  const advancedStart = ui.indexOf('<details className="task-advanced-settings wide"');
  const advancedEnd = ui.indexOf('</details>', advancedStart);
  const supplementaryRequirements = ui.indexOf('<label className="wide">補充要求');
  const basicCount = ui.indexOf('<label>每次素材數');
  const basicRhythm = ui.indexOf('<label>節奏');
  const notification = ui.indexOf('完成時顯示 Windows 通知');
  assert.ok(advancedStart > 0 && advancedEnd > advancedStart, 'advanced settings must use a collapsible details region');
  for (const label of ['AiProviderPicker', '來源範圍', '指定網站／RSS', '硬性網址', '排除來源網域']) {
    const position = ui.indexOf(label, advancedStart);
    assert.ok(position > advancedStart && position < advancedEnd, `${label} must stay inside advanced settings`);
  }
  assert.ok(supplementaryRequirements < basicCount && basicCount < basicRhythm, 'supplementary requirements must stay before the visible material count and rhythm controls');
  assert.ok(basicCount < advancedStart && basicRhythm < advancedStart && notification < advancedStart, 'advanced settings must be the final form section after the core schedule and notification controls');
  assert.match(ui, /setAdvancedOpen\(false\)/);
  console.log('PASS advanced AI/source controls are collapsed at the bottom while core schedule stays visible');

  const presets = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'exploration-presets.json'), 'utf8'));
  assert.equal(presets.length, 20, 'the starter catalog must offer 20 interest domains');
  for (const preset of presets) {
    assert.equal(typeof preset.label, 'string');
    assert.ok(preset.topics.length >= 3 && preset.topics.length <= 4, `${preset.label} must have 3-4 refined topics`);
  }
  assert.match(ui, /挑興趣/);
  assert.match(ui, /挑題目/);
  assert.match(ui, /你對什麼有興趣？/);
  assert.match(ui, /setPresetPickerMode\(task \? null : 'name'\)/);
  console.log('PASS new tasks ask about interests and offer 20 domains with 3-4 refined topics each');

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
