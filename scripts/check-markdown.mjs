import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
try {
  const { renderMarkdown, renderMarkdownSync, renderInlineMarkdown, preprocessMath, createMarkdownRenderer } = await server.ssrLoadModule('/src/utils/markdownRenderer.ts');
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
    ['agent emphasis with padding and CJK punctuation', () => {
      for (const [source, expected] of [
        ['**一句話定義**：不是工程師手寫規則', '<strong>一句話定義</strong>：'],
        ['讓演算法**「自己找出輸入與輸出之間的對應公式（權重）」 **。', '<strong>「自己找出輸入與輸出之間的對應公式（權重）」</strong>。'],
        ['**分類（Classification） **：二分法', '<strong>分類（Classification）</strong>：'],
        ['** 概念 **：每筆資料都有標籤', '<strong>概念</strong>：'],
        ['**\u3000主要任務\u00a0**', '<strong>主要任務</strong>'],
        ['中文**「重點」**接續', '中文<strong>「重點」</strong>接續'],
        ['**環境（Environment） **、**動作（Action） **與**獎懲分數（Reward） **。', '<strong>動作（Action）</strong>與<strong>獎懲分數（Reward）</strong>。'],
      ]) {
        for (const render of [renderMarkdownSync, renderInlineMarkdown]) {
          const html = render(source);
          assert.ok(html.includes(expected), `${source}: ${html}`);
          assert.ok(!html.includes('**'), html);
        }
      }
    }],
    ['emphasis in lists, tables, quotes and callouts', () => {
      for (const source of ['- **分類 **：預測', '1. **分類 **：預測', '> **分類 **：預測', '| 類型 |\n|---|\n| **分類 **：預測 |']) {
        assert.match(renderMarkdownSync(source), /<strong>分類<\/strong>：預測/);
      }
      assert.match(preprocessCallouts('> [!TIP]\n> **分類 **：預測'), /<strong>分類<\/strong>：預測/);
    }],
    ['literal and standard Markdown remains intact', async () => {
      const { marked } = await import('marked');
      for (const source of [
        '`**文字 **`', '``**文字 **``', '\\*\\*文字\\*\\*', '**尚未完成', '** **',
        '***粗斜體***', '**粗體與 *斜體* 組合**', '**含 `code` 的粗體**',
        '**含 `**` 的程式碼**', '    **縮排程式碼 **',
        '```md\n**文字 **\n```', '~~~md\n**文字 **\n~~~',
        '[連結](https://example.com/a**b**)', '<span title="**原文 **">內容</span>',
        '<pre>**原文 **</pre>', '~~刪除~~', '__粗體__', '*斜體*', '- [x] 完成',
      ]) {
        assert.equal(renderMarkdownSync(source).trim(), marked.parse(source, { gfm: true, breaks: true, renderer: createMarkdownRenderer() }).trim(), source);
      }
    }],
    ['bold keeps inline links and formulas', () => {
      assert.match(renderMarkdownSync('** [文件](https://example.com) **'), /<strong><a href="https:\/\/example.com">文件<\/a><\/strong>/);
      assert.match(renderMarkdownSync('**公式 $x^2$ **'), /<strong>公式 <span class="math-inline">/);
    }],
    ['pitfall guide uses valid emphasis without formulas', () => {
      for (const source of ['1. **過擬合（Overfitting）**：', '2. **GIGO（Garbage In, Garbage Out）**：', '3. **黑盒子問題（Black Box）**：']) {
        const html = renderInlineMarkdown(source);
        assert.match(html, /<strong>.+<\/strong>：/);
        assert.ok(!html.includes('**'));
      }
      for (const label of ['症狀', '解法']) {
        assert.equal(renderInlineMarkdown(`*${label}*：說明`), `<em>${label}</em>：說明`);
      }
    }],
    ['editor does not limit formatted display to math', async () => {
      const editor = await readFile(new URL('../src/components/Editor.tsx', import.meta.url), 'utf8');
      assert.doesNotMatch(editor, /hasInlineMath/);
      // List, task, and ordinary text all show source only while active or empty.
      assert.equal(editor.split('focusedBlockIndex === index || !getBlockDisplayValue(block).trim()').length - 1, 3);
      assert.equal(editor.split('onBlur={(event) => finishInlineEditing(index, event)}').length - 1, 3);
      assert.match(editor, /setFocusedBlockIndex\(current => current === index \? null : current\)/);
    }],
  ];
  for (const [name, check] of cases) { await check(); console.log(`PASS ${name}`); }
} finally { await server.close(); }
