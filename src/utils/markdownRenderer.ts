import { Marked, marked } from 'marked';
import katex from 'katex';

const blockMathPattern = /\$\$([\s\S]+?)\$\$/g;
const inlineMathPattern = /(?<!\\)\$(?!\$)([^\n$]+?)(?<!\\)\$/g;
const blockBracketMathPattern = /\\\[([\s\S]+?)\\\]/g;
const inlineParenMathPattern = /\\\((.+?)\\\)/g;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type FrontmatterField = {
  key: string;
  values: string[];
};

const frontmatterLabels: Record<string, string> = {
  title: '標題',
  domain: '領域',
  branch: '分支',
  parent: '父節點',
  tags: '標籤',
  summary: '摘要',
};

const frontmatterIcons = new Set(['title', 'domain', 'branch', 'parent', 'tags', 'summary']);

function parseFrontmatterScalar(rawValue: string): string {
  const value = rawValue.trim();
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    try { return JSON.parse(value); } catch { return value.slice(1, -1); }
  }
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  return value;
}

function parseFrontmatterValues(rawValue: string): string[] {
  const value = rawValue.trim();
  if (!value.startsWith('[') || !value.endsWith(']')) {
    const scalar = parseFrontmatterScalar(value);
    return scalar ? [scalar] : [];
  }

  const values: string[] = [];
  const source = value.slice(1, -1);
  const itemPattern = /"(?:\\.|[^"\\])*"|'(?:''|[^'])*'|[^,]+/g;
  for (const match of source.matchAll(itemPattern)) {
    const item = parseFrontmatterScalar(match[0]);
    if (item) values.push(item);
  }
  return values;
}

export function extractFrontmatter(markdown: string): { fields: FrontmatterField[]; body: string } {
  const normalized = markdown.replace(/^\uFEFF/, '');
  const match = /^---[\t ]*\r?\n([\s\S]*?)\r?\n---[\t ]*(?:\r?\n|$)/.exec(normalized);
  if (!match) return { fields: [], body: markdown };

  const fields: FrontmatterField[] = [];
  let current: FrontmatterField | null = null;

  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const pair = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (pair) {
      current = { key: pair[1].toLowerCase(), values: parseFrontmatterValues(pair[2]) };
      fields.push(current);
      continue;
    }

    const listItem = /^\s+-\s+(.+)$/.exec(line);
    if (listItem && current) {
      const item = parseFrontmatterScalar(listItem[1]);
      if (item) current.values.push(item);
      continue;
    }

    if (/^\s+/.test(line) && current && line.trim()) {
      const continuation = parseFrontmatterScalar(line);
      if (continuation) {
        const lastIndex = current.values.length - 1;
        if (lastIndex >= 0) current.values[lastIndex] += ` ${continuation}`;
        else current.values.push(continuation);
      }
    }
  }

  return { fields: fields.filter(field => field.values.length), body: normalized.slice(match[0].length) };
}

function renderFrontmatter(fields: FrontmatterField[]): string {
  if (!fields.length) return '';
  const rows = fields.map(field => {
    const icon = frontmatterIcons.has(field.key) ? field.key : 'generic';
    const label = frontmatterLabels[field.key] || field.key;
    const value = field.key === 'tags'
      ? `<span class="note-frontmatter-tags">${field.values.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</span>`
      : escapeHtml(field.values.join('、'));
    return `<div class="note-frontmatter-row note-frontmatter-row--${icon}" data-frontmatter-field="${escapeHtml(field.key)}"><dt title="${escapeHtml(label)}"><span class="note-frontmatter-icon-frame" aria-hidden="true"><span class="note-frontmatter-icon note-frontmatter-icon--${icon}"></span></span><span class="note-frontmatter-label">${escapeHtml(label)}</span><span class="note-frontmatter-separator" aria-hidden="true">:</span></dt><dd>${value}</dd></div>`;
  }).join('');
  return `<section class="note-frontmatter" aria-label="筆記資訊"><dl>${rows}</dl></section>`;
}

function renderMath(value: string, displayMode: boolean): string {
  try {
    return katex.renderToString(value.trim(), {
      displayMode,
      throwOnError: false,
      strict: false,
      output: 'html',
    });
  } catch {
    const delimiter = displayMode ? '$$' : '$';
    return `${delimiter}${escapeHtml(value)}${delimiter}`;
  }
}

function processMathSegment(markdown: string): string {
  const codeSpans: string[] = [];
  const protectedMarkdown = markdown.replace(/(`+)([^`]|(?!\1)`)*?\1/g, value => {
    const index = codeSpans.push(value) - 1;
    return `WIKITREECODESPAN${index}END`;
  });
  return protectedMarkdown
    .replace(blockMathPattern, (_match, expression) => {
      return `<div class="math-block">${renderMath(expression, true)}</div>`;
    })
    .replace(blockBracketMathPattern, (_match, expression) => {
      return `<div class="math-block">${renderMath(expression, true)}</div>`;
    })
    .replace(inlineMathPattern, (_match, expression) => {
      return `<span class="math-inline">${renderMath(expression, false)}</span>`;
    })
    .replace(inlineParenMathPattern, (_match, expression) => {
      return `<span class="math-inline">${renderMath(expression, false)}</span>`;
    })
    .replace(/WIKITREECODESPAN(\d+)END/g, (_, index) => codeSpans[Number(index)]);
}

export function preprocessMath(markdown: string): string {
  const lines = markdown.split('\n');
  const segments: string[] = [];
  let pending: string[] = [];
  let inFence = false;
  let fenceMarker = '';

  const flushPending = () => {
    if (!pending.length) return;
    segments.push(processMathSegment(pending.join('\n')));
    pending = [];
  };

  for (const line of lines) {
    const fence = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (fence && (!inFence || (fence[1][0] === fenceMarker[0] && fence[1].length >= fenceMarker.length && !fence[2].trim()))) {
      if (inFence) {
        pending.push(line);
        segments.push(pending.join('\n'));
        pending = [];
        inFence = false;
      } else {
        flushPending();
        pending = [line];
        inFence = true;
        fenceMarker = fence[1];
      }
      continue;
    }

    pending.push(line);
  }

  if (inFence) {
    segments.push(pending.join('\n'));
  } else {
    flushPending();
  }

  return segments.join('\n');
}

export function createMarkdownRenderer() {
  const renderer = new marked.Renderer();

  renderer.code = (({ text, lang, escaped }: any) => {
    const language = lang?.trim().split(/\s+/)[0].toLowerCase();

    if (language === 'mermaid') {
      return `<div class="mermaid">${escapeHtml(text)}</div>`;
    }

    const code = escaped ? text : escapeHtml(text);
    const languageClass = lang ? ` class="language-${escapeHtml(lang)}"` : '';
    return `<pre><code${languageClass}>${code}</code></pre>`;
  }) as any;

  return renderer;
}

// Keep note rendering isolated from integrations that configure global marked.
const noteMarkdown = new Marked({
  gfm: true,
  breaks: true,
  renderer: createMarkdownRenderer(),
  extensions: [{
    name: 'agentStrong',
    level: 'inline',
    start(source) { return source.indexOf('**'); },
    tokenizer(source) {
      if (this.lexer.state.inRawBlock) return;
      // Agent prose often pads the markers or places CJK punctuation directly
      // beside them. Parse inline tokens, never replace HTML or saved Markdown.
      // Leave triple markers and complex nested emphasis to the standard parser.
      const match = /^\*\*(?!\*)((?:(`+)(?:[^`\n]|(?!\2)`)*?\2|\\[^\n]|[^*`\\\n])+?)\*\*(?!\*)/.exec(source);
      if (!match || !match[1].trim()) return;
      const text = match[1].trim();
      return { type: 'agentStrong', raw: match[0], tokens: this.lexer.inlineTokens(text) };
    },
    renderer(token) { return `<strong>${this.parser.parseInline(token.tokens ?? [])}</strong>`; },
  }],
});

export function renderMarkdownSync(markdown: string): string {
  const { fields, body } = extractFrontmatter(markdown);
  return renderFrontmatter(fields) + noteMarkdown.parse(preprocessMath(body), { async: false });
}

export async function renderMarkdown(markdown: string): Promise<string> {
  return renderMarkdownSync(markdown);
}

export function renderInlineMarkdown(markdown: string): string {
  return noteMarkdown.parseInline(preprocessMath(markdown), { async: false });
}
