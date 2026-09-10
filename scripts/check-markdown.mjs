import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
try {
  const { renderMarkdown, preprocessMath } = await server.ssrLoadModule('/src/utils/markdownRenderer.ts');
  const { preprocessCallouts } = await server.ssrLoadModule('/src/utils/callouts.ts');
  const cases = [
    ['headings and emphasis', async () => assert.match(await renderMarkdown('# 標題\n\n**重點**'), /<strong>重點<\/strong>/)],
    ['inline formula', async () => assert.match(await renderMarkdown('$x^2$'), /class="katex"/)],
    ['display formula', async () => assert.match(await renderMarkdown('$$\nx^2 + y^2\n$$'), /katex-display/)],
    ['diagram source', async () => assert.match(await renderMarkdown('```mermaid\ngraph TD\nA-->B\n```'), /class="mermaid"/)],
    ['inline code stays literal', () => assert.equal(preprocessMath('`$x$`'), '`$x$`')],
    ['code fences stay literal', () => { for (const fence of ['```', '~~~', '````']) { const code = `${fence}text\n$x$\n> [!TIP]\n${fence}`; assert.equal(preprocessMath(code), code); assert.equal(preprocessCallouts(code), code); } }],
    ['callout emphasis', () => assert.match(preprocessCallouts('> [!TIP]\n> **重點**'), /<strong>重點<\/strong>/)],
    ['table rendering', async () => assert.match(await renderMarkdown('| A | B |\n|---|---|\n| 1 | 2 |'), /<table>/)],
  ];
  for (const [name, check] of cases) { await check(); console.log(`PASS ${name}`); }
} finally { await server.close(); }
