import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { DOMParser } from 'linkedom';
import { createServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import ts from 'typescript';

// Node-only tests with synthetic styles and geometry. No browser or lecture script execution.
globalThis.DOMParser = DOMParser;
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
try {
  const { discoverHtmlPalette, parseHtmlColor, htmlColorContrast, readingAppearance, HTML_FALLBACK_PALETTE } = await vite.ssrLoadModule('/src/utils/htmlTheme.ts');
  const { prepareHtmlLecture } = await vite.ssrLoadModule('/src/utils/htmlReader.ts');
  const { THEMES, DEFAULT_THEME, THEME_STORAGE_KEY, THEME_DEFAULT_MIGRATION_KEY, readSavedTheme } = await vite.ssrLoadModule('/src/utils/themes.ts');
  const { StyleStudio } = await vite.ssrLoadModule('/src/components/StyleStudio.tsx');

  assert.deepEqual(parseHtmlColor('#abc'), [170, 187, 204]);
  assert.deepEqual(parseHtmlColor('rgb(100% 0% 50%)'), [255, 0, 128]);
  assert.deepEqual(parseHtmlColor('rgba(20, 40, 60, 1)'), [20, 40, 60]);
  for (const value of ['transparent', 'rgba(255,255,255,0.1)', 'rgb(999,0,0)', '#fff; background:url(https://example.com)', 'url(secret)', {}, null]) assert.equal(parseHtmlColor(value), null);
  assert.deepEqual(discoverHtmlPalette(null), HTML_FALLBACK_PALETTE);
  assert.deepEqual(discoverHtmlPalette([{ background: 'linear-gradient(red,blue)', foreground: 'garbage', weight: 1 }]), HTML_FALLBACK_PALETTE);

  const warm = discoverHtmlPalette([
    { background: '#faf8f3', foreground: '#263b37', weight: 20 },
    { background: '#e800ff', foreground: '#ffffff', weight: .1 },
    { accent: '#27675b', weight: 5 },
    { accent: '#ff00ff', weight: .1 },
    { accent: '#808080', weight: 100 },
    { background: '#000000', weight: Infinity },
  ]);
  assert.deepEqual(warm, { background: '#faf8f3', foreground: '#263b37', accent: '#27675b' });
  const dark = discoverHtmlPalette([{ background: '#101c27', foreground: '#e8eff5', accent: '#82c4dd', weight: 25 }]);
  assert.deepEqual(dark, { background: '#101c27', foreground: '#e8eff5', accent: '#82c4dd' });
  const unreadable = discoverHtmlPalette([{ background: '#f8f8f8', foreground: '#eeeeee', accent: '#ffee88', weight: 25 }]);
  assert.ok(htmlColorContrast(unreadable.background, unreadable.foreground) >= 4.5);
  assert.ok(htmlColorContrast(unreadable.background, unreadable.accent) >= 4.5);
  const readableShell = readingAppearance(DEFAULT_THEME, true, unreadable);
  for (const token of ['--text-primary', '--text-secondary', '--text-muted', '--accent']) assert.ok(htmlColorContrast(unreadable.background, readableShell.style[token]) >= 4.5);
  console.log('PASS dominant backgrounds, representative colors, light/dark palettes, readable contrast, safe color parsing and stable fallback');

  // Exercise the actual injected reporter with a synthetic document. Its computed
  // colors represent already-resolved CSS variables, linked CSS and media queries.
  const html = '<html><head><style>:root{--paper:#faf8f3;--ink:#263b37;--accent:#27675b}body{background:var(--paper);color:var(--ink)}h1{color:var(--accent)}</style></head><body><main><h1>原標題</h1><details><summary>問題</summary>回答</details></main><script>throw Error("lecture scripts must not execute in these tests")</script></body></html>';
  const prepared = await prepareHtmlLecture(html, '講義/index.html', async () => { throw Error('no assets'); });
  const original = new DOMParser().parseFromString(html, 'text/html');
  const doc = new DOMParser().parseFromString(prepared.srcDoc, 'text/html');
  assert.equal(doc.querySelector('style').textContent, original.querySelector('style').textContent);
  assert.equal(doc.querySelector('main').outerHTML, original.querySelector('main').outerHTML);
  const reporter = doc.querySelector('[data-wikitree-color-bridge]');
  assert.ok(reporter);
  let reporterScript = reporter.textContent;
  if (process.argv.includes('--built')) {
    // Function serialization must also work after production minification.
    const assetDirectory = new URL('../dist/assets/', import.meta.url);
    const bundleName = fs.readdirSync(assetDirectory).find(name => /^index-.*\.js$/.test(name) && fs.readFileSync(new URL(name, assetDirectory), 'utf8').includes('wikitree-html-colors'));
    assert.ok(bundleName, 'Build the project before checking its production color reporter.');
    const bundle = fs.readFileSync(new URL(bundleName, assetDirectory), 'utf8');
    const source = ts.createSourceFile(bundleName, bundle, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const candidates = [];
    const visit = node => {
      if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
        const text = node.getText(source);
        if (text.includes('wikitree-html-colors') && text.includes('MutationObserver') && text.includes('elementFromPoint')) candidates.push(text);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    const compiledReporter = candidates.sort((a, b) => a.length - b.length)[0];
    assert.ok(compiledReporter, 'The production reporter must remain self-contained.');
    reporterScript = `(${compiledReporter})();`;
  }
  const main = doc.querySelector('main'), heading = doc.querySelector('h1');
  const visibleRect = { left: 0, top: 0, right: 900, bottom: 600 };
  main.getBoundingClientRect = () => visibleRect;
  heading.getBoundingClientRect = () => ({ ...visibleRect, right: 700, bottom: 100 });
  doc.elementFromPoint = () => main;
  Object.defineProperty(doc, 'readyState', { value: 'complete' });
  const originalCreateElement = doc.createElement.bind(doc);
  doc.createElement = tag => {
    const element = originalCreateElement(tag);
    if (tag === 'canvas') element.getContext = () => null; // RGB fixtures need no color conversion.
    return element;
  };
  let reported, mutationCallback;
  const windowListeners = new Map(), frameCallbacks = [];
  let gradient = false;
  const computedStyle = element => ({
    backgroundColor: element === doc.body ? 'rgb(250,248,243)' : 'rgba(0,0,0,0)',
    backgroundImage: gradient && element === main ? 'linear-gradient(red,blue)' : 'none',
    color: element === heading ? 'rgb(39,103,91)' : 'rgb(38,59,55)',
    display: 'block', visibility: 'visible', opacity: '1',
  });
  vm.runInNewContext(reporterScript, {
    document: doc,
    window: { innerWidth: 900, innerHeight: 600, addEventListener: (type, callback) => windowListeners.set(type, callback) },
    parent: { postMessage: message => { reported = message; } },
    getComputedStyle: computedStyle,
    requestAnimationFrame: callback => frameCallbacks.push(callback),
    MutationObserver: class { constructor(callback) { mutationCallback = callback; } observe() {} },
    CSS: { supports: () => true },
  });
  assert.equal(frameCallbacks.length, 1);
  frameCallbacks.shift()();
  assert.equal(reported.type, 'wikitree-html-colors');
  assert.deepEqual(discoverHtmlPalette(reported.samples), warm);
  assert.equal(doc.querySelector('main').outerHTML, original.querySelector('main').outerHTML);
  assert.equal(main.hasAttribute('style'), false);
  windowListeners.get('load')();
  windowListeners.get('resize')();
  mutationCallback();
  assert.equal(frameCallbacks.length, 1, 'Repeated signals should coalesce into one reading.');
  frameCallbacks.shift()();
  gradient = true;
  mutationCallback(); frameCallbacks.shift()();
  assert.equal(discoverHtmlPalette(reported.samples).background, HTML_FALLBACK_PALETTE.background);
  console.log('PASS isolated computed-color reporter, transparent ancestors, gradient fallback, stylesheet/load updates and read-only lecture content');
  if (process.argv.includes('--built')) console.log('PASS production-minified color reporter runs independently inside the synthetic isolated frame');

  const values = new Map([[THEME_STORAGE_KEY, 'cold-focus'], [THEME_DEFAULT_MIGRATION_KEY, '1']]);
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(readSavedTheme(), 'cold-focus');
  const savedBefore = JSON.stringify([...values]);
  for (const theme of THEMES) {
    const adapted = readingAppearance(theme.id, true, warm);
    assert.equal(adapted.mode, 'html-adaptive');
    assert.equal(adapted.style['--bg-primary'], warm.background);
    assert.equal(adapted.style['--text-primary'], warm.foreground);
    assert.equal(adapted.style['--accent'], warm.accent);
    assert.equal(adapted.style.colorScheme, 'light');
    const restored = readingAppearance(theme.id, false, dark);
    assert.equal(restored.mode, 'markdown');
    assert.deepEqual(restored.style, { colorScheme: theme.mode });
    assert.equal(JSON.stringify([...values]), savedBefore);
  }
  assert.equal(readingAppearance(DEFAULT_THEME, true, dark).style.colorScheme, 'dark');
  assert.equal(readingAppearance(DEFAULT_THEME, true).style['--bg-primary'], HTML_FALLBACK_PALETTE.background);
  assert.equal(readSavedTheme(), 'cold-focus');
  assert.equal(DEFAULT_THEME, 'wikitree-original');
  console.log('PASS all seven Markdown themes restore without HTML tokens or storage changes; HTML defaults automatically and follows each lecture');

  const markdownStudio = renderToStaticMarkup(createElement(StyleStudio, { theme: DEFAULT_THEME, onThemeChange() {} }));
  const htmlStudio = renderToStaticMarkup(createElement(StyleStudio, { theme: 'cold-focus', initialFormat: 'html', onThemeChange() { throw Error('HTML must not select a Markdown theme'); } }));
  const markdownDoc = new DOMParser().parseFromString(markdownStudio, 'text/html');
  const htmlDoc = new DOMParser().parseFromString(htmlStudio, 'text/html');
  assert.equal(markdownDoc.querySelectorAll('button.theme-card').length, 7);
  assert.equal(htmlDoc.querySelectorAll('button.theme-card').length, 0);
  assert.equal(htmlDoc.querySelectorAll('.html-adaptive-card').length, 1);
  assert.match(htmlStudio, /自適應/);
  assert.match(htmlStudio, /自動啟用/);
  assert.match(markdownStudio, /WikiTree Original/);
  assert.equal(markdownDoc.querySelectorAll('.style-format-switch button').length, 2);
  assert.equal(htmlDoc.querySelector('.style-format-switch button[aria-pressed="true"]').textContent, 'HTML 自適應');

  const app = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const reader = fs.readFileSync(new URL('../src/components/HtmlNoteReader.tsx', import.meta.url), 'utf8');
  assert.match(app, /data-reading-style=\{appearance.mode\} style=\{appearance.style\}/);
  assert.match(app, /htmlAppearance\?\.path === activeFile\?\.path/);
  assert.match(app, /htmlAppearance\?\.content === content/);
  assert.match(app, /htmlAppearance\?\.root === rootHandle/);
  assert.match(app, /!\['explore', 'skills', 'exploration', 'style'\]\.includes\(sidebarTab\)/);
  assert.match(reader, /!frame.current \|\| event.source !== frame.current.contentWindow/);
  assert.match(reader, /onPaletteChange\(discoverHtmlPalette\(event.data.samples\)\)/);
  assert.doesNotMatch(reader, /allow-same-origin/);
  console.log('PASS rendered Markdown/HTML categories, one automatic HTML style, scoped shell application, stale-palette guards and frame message isolation');
} finally {
  await vite.close();
  delete globalThis.localStorage;
}
