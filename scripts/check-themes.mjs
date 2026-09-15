import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [themeSource, css, app, sidebar, studio] = await Promise.all([
  readFile(new URL('../src/utils/themes.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/index.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/App.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/Sidebar.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/StyleStudio.tsx', import.meta.url), 'utf8'),
]);

const expectedThemes = [
  'rose-terminal',
  'warm-paper',
  'soft-pastel',
  'cold-focus',
  'midnight-ide',
  'paper-light',
];

const declaredThemes = [...themeSource.matchAll(/\bid: '([^']+)'/g)].map(match => match[1]);
assert.deepEqual(declaredThemes, expectedThemes, 'Theme catalog must contain the six first-release themes in display order.');

for (const id of expectedThemes) {
  assert.match(css, new RegExp(`\\[data-theme="${id}"\\]`), `Missing CSS palette for ${id}.`);
  assert.match(studio, new RegExp(`THEMES\\.map`), 'Style Studio must render the shared theme catalog.');
}

for (const token of [
  '--bg-primary',
  '--bg-secondary',
  '--bg-sidebar',
  '--text-primary',
  '--text-secondary',
  '--text-muted',
  '--accent',
  '--highlight',
  '--highlight-text',
  '--code-bg',
  '--quote-border',
  '--tag-bg',
  '--graph-node',
]) {
  assert.match(css, new RegExp(token), `Missing theme token ${token}.`);
}

assert.match(css, /\.rendered-markdown mark\s*\{[^}]*var\(--highlight\)/s, 'Markdown highlights must use the selected palette.');

const nurseryPosition = sidebar.indexOf("activeTab === 'exploration'");
const stylePosition = sidebar.indexOf("activeTab === 'style'", nurseryPosition);
assert.ok(nurseryPosition >= 0 && stylePosition > nurseryPosition, '風格 must appear after 探索苗圃 in the Orbit navigation.');
assert.match(sidebar, /<strong>風格<\/strong><small>打造你的森林樣貌<\/small>/, 'Style navigation label is missing.');
assert.match(app, /<StyleStudio theme=\{theme\} onThemeChange=\{setTheme\} \/>/, 'Style Studio is not connected to the app theme state.');
assert.match(app, /localStorage\.setItem\(THEME_STORAGE_KEY, theme\)/, 'Theme selection must persist locally.');
assert.doesNotMatch(app, /setTheme\(theme === 'dark'/, 'The legacy binary theme toggle must not remain.');
assert.match(studio, /個人封面、苗圃裝飾/, 'The future personal-space direction must remain visible.');

console.log(`Theme checks passed: ${expectedThemes.length} palettes, persistent selection, Style Studio navigation, and future profile direction.`);
