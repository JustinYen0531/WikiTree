import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
try {
  const { renderMarkdown, renderMarkdownSync, renderInlineMarkdown, preprocessMath, createMarkdownRenderer, extractFrontmatter, extractFrontmatterBlockAt } = await server.ssrLoadModule('/src/utils/markdownRenderer.ts');
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
    ['frontmatter renders as CSS icon:value metadata instead of raw YAML', () => {
      const source = `---\ntitle: "歡迎來到 WikiTree"\ndomain: "WikiTree"\nbranch: "起點"\nparent: "root"\ntags: ["開始", "WikiTree"]\nsummary: "這裡是由 WikiTree 管理、屬於你的知識天地。"\n---\n\n# 第一片葉`;
      const html = renderMarkdownSync(source);
      for (const field of ['title', 'domain', 'branch', 'parent', 'tags', 'summary']) {
        assert.match(html, new RegExp(`note-frontmatter-icon--${field}`));
      }
      assert.equal(html.match(/note-frontmatter-icon-frame/g)?.length, 6);
      assert.match(html, /note-frontmatter-separator[^>]*>:</);
      assert.match(html, /note-frontmatter-tags/);
      assert.match(html, />開始<\/span>/);
      assert.match(html, /<h1>第一片葉<\/h1>/);
      assert.doesNotMatch(html, /title:|domain:|tags: \[/);
    }],
    ['frontmatter supports block tag lists, preserves colons, and ignores absent fences', () => {
      const parsed = extractFrontmatter(`---\ntags:\n  - 研究\n  - 方法\nsummary: "問題：答案"\n---\n本文`);
      assert.deepEqual(parsed.fields.find(field => field.key === 'tags')?.values, ['研究', '方法']);
      assert.equal(parsed.fields.find(field => field.key === 'summary')?.values[0], '問題：答案');
      assert.equal(parsed.body, '本文');
      assert.deepEqual(extractFrontmatter('title: 普通段落').fields, []);
    }],
    ['exploration frontmatter uses one CSS icon and compact readable provenance', () => {
      const source = `---\norigin: "scheduled_ai_exploration"\nexploration_task_id: "6d187207-f7d9-47fa-a5bb-e44f0b925ed9"\nexploration_run_id: "773b1a16-71d8-4aae-aaa4-00c28bb27e8b"\nsource_ids: ["88a10010-c52d-4624-a2d5-f1129773283e"]\n---\n\n# 探索草稿`;
      const html = renderMarkdownSync(source);
      assert.match(html, /note-frontmatter--exploration/);
      assert.equal(html.match(/note-frontmatter-icon--exploration/g)?.length, 4);
      assert.match(html, /探索筆記資訊/);
      assert.match(html, />每日排程探索</);
      assert.match(html, />6d187207…925ed9</);
      assert.match(html, />773b1a16…b27e8b</);
      assert.match(html, />88a10010…73283e</);
      assert.match(html, /aria-label="6d187207-f7d9-47fa-a5bb-e44f0b925ed9"/);
      for (const field of ['origin', 'exploration_task_id', 'exploration_run_id', 'source_ids']) {
        assert.match(html, new RegExp(`data-frontmatter-field="${field}"`));
      }
    }],
    ['editor and mid-note preview recognize exploration metadata as one panel', async () => {
      const lines = ['前一段筆記', '---', 'origin: "scheduled_ai_exploration"', 'exploration_task_id: "6d187207-f7d9-47fa-a5bb-e44f0b925ed9"', 'source_ids: ["88a10010-c52d-4624-a2d5-f1129773283e"]', '---', '後一段筆記'];
      const block = extractFrontmatterBlockAt(lines, 1);
      assert.ok(block);
      assert.equal(block.endIndex, 5);
      assert.match(renderMarkdownSync(block.raw), /note-frontmatter--exploration/);

      const midNoteHtml = renderMarkdownSync(lines.join('\n'));
      assert.match(midNoteHtml, /<p>前一段筆記<\/p>[\s\S]*note-frontmatter--exploration[\s\S]*<p>後一段筆記<\/p>/);
      assert.doesNotMatch(midNoteHtml, /origin: &quot;scheduled_ai_exploration&quot;/);

      const editor = await readFile(new URL('../src/components/Editor.tsx', import.meta.url), 'utf8');
      assert.match(editor, /type: 'frontmatter'/);
      assert.match(editor, /extractFrontmatterBlockAt\(lines, i\)/);
      assert.match(editor, /block\.type === 'frontmatter'/);
      assert.match(editor, /renderMarkdownSync\(block\.raw\)/);
    }],
    ['frontmatter icons are CSS-only in the app and published reader', async () => {
      const appCss = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');
      const publisher = await readFile(new URL('../src/utils/publisher.ts', import.meta.url), 'utf8');
      for (const icon of ['title', 'domain', 'branch', 'parent', 'tags', 'summary', 'exploration']) {
        assert.match(appCss, new RegExp(`note-frontmatter-icon--${icon}`));
        assert.match(publisher, new RegExp(`note-frontmatter-icon--${icon}`));
      }
      const iconCss = appCss.slice(appCss.indexOf('.note-frontmatter-icon'), appCss.indexOf('@media (max-width: 640px)'));
      assert.doesNotMatch(iconCss, /url\(|data:image|[\u{1F300}-\u{1FAFF}]/u);
      assert.match(appCss, /\.note-frontmatter-icon-frame[\s\S]*width: 28px;[\s\S]*border-radius: 7px;/);
      assert.match(appCss, /\.note-frontmatter-row--summary[\s\S]*border-top: 1px solid var\(--border-color\)/);
      assert.match(publisher, /\.note-frontmatter-icon-frame/);
    }],
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
      // Lists, tasks, and ordinary text show source only while active or empty; frontmatter also returns to its card on blur.
      assert.equal(editor.split('focusedBlockIndex === index || !getBlockDisplayValue(block).trim()').length - 1, 3);
      assert.equal(editor.split('onBlur={(event) => finishInlineEditing(index, event)}').length - 1, 4);
      assert.match(editor, /setFocusedBlockIndex\(current => current === index \? null : current\)/);
    }],
  ];
  for (const [name, check] of cases) { await check(); console.log(`PASS ${name}`); }
} finally { await server.close(); }
