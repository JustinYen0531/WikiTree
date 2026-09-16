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
  origin: '探索來源',
  exploration_task_id: '探索任務',
  exploration_run_id: '探索批次',
  source_ids: '參考來源',
};

const frontmatterIcons = new Set(['title', 'domain', 'branch', 'parent', 'tags', 'summary']);
const explorationFrontmatterKeys = new Set(['origin', 'exploration_task_id', 'exploration_run_id', 'source_ids']);
const explorationOriginLabels: Record<string, string> = {
  scheduled_ai_exploration: '每日排程探索',
  manual_ai_exploration: '手動 AI 探索',
  legacy_brew_import: 'Brew 歷史匯入',
};

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

export function extractFrontmatterBlockAt(lines: string[], startIndex: number): { raw: string; endIndex: number } | null {
  if (!/^---[\t ]*$/.test(lines[startIndex] || '')) return null;

  for (let endIndex = startIndex + 1; endIndex < lines.length; endIndex++) {
    if (!/^---[\t ]*$/.test(lines[endIndex])) continue;
    const raw = lines.slice(startIndex, endIndex + 1).join('\n');
    const parsed = extractFrontmatter(raw);
    if (parsed.fields.length > 0 && !parsed.body.trim()) return { raw, endIndex };
    return null;
  }

  return null;
}

function compactIdentifier(value: string): string {
  return value.length > 20 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value;
}

function renderExplorationValue(field: FrontmatterField): string {
  if (field.key === 'origin') {
    return field.values.map(value => {
      const label = explorationOriginLabels[value] || value;
      return `<span class="note-frontmatter-origin" title="${escapeHtml(value)}">${escapeHtml(label)}</span>`;
    }).join('');
  }

  return `<span class="note-frontmatter-identifiers">${field.values.map(value => (
    `<span class="note-frontmatter-identifier" title="完整識別碼：${escapeHtml(value)}" aria-label="${escapeHtml(value)}"><span aria-hidden="true">${escapeHtml(compactIdentifier(value))}</span></span>`
  )).join('')}</span>`;
}

function renderFrontmatter(fields: FrontmatterField[]): string {
  if (!fields.length) return '';
  const isExplorationNote = fields.some(field => (
    field.key === 'exploration_task_id'
    || field.key === 'exploration_run_id'
    || field.key === 'source_ids'
    || (field.key === 'origin' && field.values.some(value => value in explorationOriginLabels))
  ));
  const rows = fields.map(field => {
    const isExplorationField = isExplorationNote && explorationFrontmatterKeys.has(field.key);
    const icon = isExplorationField ? 'exploration' : (frontmatterIcons.has(field.key) ? field.key : 'generic');
    const label = frontmatterLabels[field.key] || field.key;
    const value = isExplorationField
      ? renderExplorationValue(field)
      : field.key === 'tags'
      ? `<span class="note-frontmatter-tags">${field.values.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</span>`
      : escapeHtml(field.values.join('、'));
    return `<div class="note-frontmatter-row note-frontmatter-row--${icon}" data-frontmatter-field="${escapeHtml(field.key)}"><dt title="${escapeHtml(label)}"><span class="note-frontmatter-icon-frame" aria-hidden="true"><span class="note-frontmatter-icon note-frontmatter-icon--${icon}"></span></span><span class="note-frontmatter-label">${escapeHtml(label)}</span><span class="note-frontmatter-separator" aria-hidden="true">:</span></dt><dd>${value}</dd></div>`;
  }).join('');
  const explorationClass = isExplorationNote ? ' note-frontmatter--exploration' : '';
  const ariaLabel = isExplorationNote ? '探索筆記資訊' : '筆記資訊';
  return `<section class="note-frontmatter${explorationClass}" aria-label="${ariaLabel}"><dl>${rows}</dl></section>`;
}

function renderEmbeddedExplorationFrontmatter(markdown: string): string {
  const lines = markdown.split('\n');
  const rendered: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    const block = extractFrontmatterBlockAt(lines, index);
    if (!block) {
      rendered.push(lines[index]);
      continue;
    }

    const parsed = extractFrontmatter(block.raw);
    const isExplorationBlock = parsed.fields.some(field => explorationFrontmatterKeys.has(field.key));
    if (!isExplorationBlock) {
      rendered.push(...lines.slice(index, block.endIndex + 1));
      index = block.endIndex;
      continue;
    }

    if (rendered.length > 0 && rendered[rendered.length - 1] !== '') rendered.push('');
    rendered.push(renderFrontmatter(parsed.fields), '');
    index = block.endIndex;
  }

  return rendered.join('\n');
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
  const bodyWithExplorationPanels = renderEmbeddedExplorationFrontmatter(body);
  return renderFrontmatter(fields) + noteMarkdown.parse(preprocessMath(bodyWithExplorationPanels), { async: false });
}

export async function renderMarkdown(markdown: string): Promise<string> {
  return renderMarkdownSync(markdown);
}

export function renderInlineMarkdown(markdown: string): string {
  return noteMarkdown.parseInline(preprocessMath(markdown), { async: false });
}
