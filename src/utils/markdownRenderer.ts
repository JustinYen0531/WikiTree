import { marked } from 'marked';
import katex from 'katex';

const blockMathPattern = /\$\$([\s\S]+?)\$\$/g;
const inlineMathPattern = /(?<!\\)\$(?!\$)([^\n$]+?)(?<!\\)\$/g;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  return markdown
    .replace(blockMathPattern, (_match, expression) => {
      return `<div class="math-block">${renderMath(expression, true)}</div>`;
    })
    .replace(inlineMathPattern, (_match, expression) => {
      return `<span class="math-inline">${renderMath(expression, false)}</span>`;
    });
}

export function preprocessMath(markdown: string): string {
  const lines = markdown.split('\n');
  const segments: string[] = [];
  let pending: string[] = [];
  let inFence = false;

  const flushPending = () => {
    if (!pending.length) return;
    segments.push(processMathSegment(pending.join('\n')));
    pending = [];
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      if (inFence) {
        pending.push(line);
        segments.push(pending.join('\n'));
        pending = [];
        inFence = false;
      } else {
        flushPending();
        pending = [line];
        inFence = true;
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

  renderer.code = ({ text, lang, escaped }) => {
    const language = lang?.trim().split(/\s+/)[0].toLowerCase();

    if (language === 'mermaid') {
      return `<div class="mermaid">${escapeHtml(text)}</div>`;
    }

    const code = escaped ? text : escapeHtml(text);
    const languageClass = lang ? ` class="language-${escapeHtml(lang)}"` : '';
    return `<pre><code${languageClass}>${code}</code></pre>`;
  };

  return renderer;
}

export async function renderMarkdown(markdown: string): Promise<string> {
  return await marked.parse(preprocessMath(markdown), {
    gfm: true,
    breaks: true,
    renderer: createMarkdownRenderer(),
  });
}

export function renderInlineMarkdown(markdown: string): string {
  return marked.parseInline(preprocessMath(markdown), {
    gfm: true,
    breaks: true,
  }) as string;
}
