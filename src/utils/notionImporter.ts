/**
 * Converts a Notion HTML export to Markdown.
 * Handles headings, paragraphs, lists, callouts, toggles, tables, code, images, etc.
 */

export function notionHtmlToMarkdown(html: string): { title: string; markdown: string } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract page title
  const pageTitle =
    doc.querySelector('h1.page-title')?.textContent?.trim() ||
    doc.querySelector('title')?.textContent?.trim() ||
    'Untitled';

  // Find main content container
  const body =
    doc.querySelector('div.page-body') ||
    doc.querySelector('article') ||
    doc.body;

  // Remove the page header (title, cover, icon) — already captured
  body.querySelector('header')?.remove();
  body.querySelector('h1.page-title')?.remove();
  body.querySelector('.page-cover-image')?.remove();
  body.querySelector('.page-header-icon')?.remove();
  body.querySelector('p.page-description')?.remove();

  const lines = convertChildren(body, 0);
  const markdown = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();

  return { title: pageTitle, markdown };
}

// ─── helpers ───────────────────────────────────────────────────────────────

function convertChildren(node: Element | Document, depth: number): string[] {
  const result: string[] = [];
  for (const child of Array.from(node.childNodes)) {
    const lines = convertNode(child as Element, depth);
    if (lines.length) result.push(...lines);
  }
  return result;
}

function convertNode(node: Node, depth: number): string[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent?.trim();
    return t ? [t] : [];
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return [];

  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  // Headings
  if (/^h[1-6]$/.test(tag)) {
    const level = parseInt(tag[1]);
    const text = inlineText(el);
    return text ? [`${'#'.repeat(level)} ${text}`, ''] : [];
  }

  // Paragraph
  if (tag === 'p') {
    const text = inlineText(el);
    return text ? [text, ''] : [];
  }

  // Horizontal rule
  if (tag === 'hr') return ['---', ''];

  // Blockquote
  if (tag === 'blockquote') {
    const inner = convertChildren(el, depth);
    return inner.map(l => `> ${l}`).concat(['']);
  }

  // Code block
  if (tag === 'pre') {
    const codeEl = el.querySelector('code');
    const lang = codeEl?.className?.match(/language-(\S+)/)?.[1] ?? '';
    const code = codeEl?.textContent ?? el.textContent ?? '';
    return ['```' + lang, code, '```', ''];
  }

  // Callout (Notion aside)
  if (tag === 'aside') {
    const iconEl = el.querySelector('span') || el.querySelector('[class*="icon"]');
    const icon = iconEl?.textContent?.trim() ?? '💡';
    iconEl?.remove();
    const content = el.textContent?.trim() ?? '';
    const calloutContent = content ? `\n> ${content}` : '';
    return [`> [!NOTE] ${icon}${calloutContent}`, ''];
  }

  // Toggle (details/summary)
  if (tag === 'details') {
    const summary = el.querySelector('summary');
    const summaryText = summary?.textContent?.trim() ?? 'Toggle';
    summary?.remove();
    const inner = convertChildren(el, depth);
    return [
      `> [!NOTE] ${summaryText}`,
      ...inner.map(l => `> ${l}`),
      '',
    ];
  }
  if (tag === 'summary') return []; // handled inside details

  // Unordered list
  if (tag === 'ul') {
    const isTodo = el.classList.contains('to-do-list') || el.querySelector('input[type="checkbox"]') !== null;
    const lines: string[] = [];
    for (const li of Array.from(el.querySelectorAll(':scope > li'))) {
      if (isTodo) {
        const checked =
          li.querySelector('.checkbox-on') !== null ||
          (li.querySelector('input[type="checkbox"]') as HTMLInputElement | null)?.checked;
        const textEl = li.cloneNode(true) as Element;
        textEl.querySelector('.checkbox-on, .checkbox-off, input[type="checkbox"]')?.remove();
        const text = inlineText(textEl);
        lines.push(`${'  '.repeat(depth)}- [${checked ? 'x' : ' '}] ${text}`);
      } else {
        const textEl = li.cloneNode(true) as Element;
        // Extract nested list separately before grabbing text
        const nested = textEl.querySelectorAll(':scope > ul, :scope > ol');
        const nestedHtml: string[] = [];
        nested.forEach(n => {
          nestedHtml.push(...convertNode(n, depth + 1));
          n.remove();
        });
        const text = inlineText(textEl);
        lines.push(`${'  '.repeat(depth)}- ${text}`);
        lines.push(...nestedHtml);
      }
    }
    lines.push('');
    return lines;
  }

  // Ordered list
  if (tag === 'ol') {
    const lines: string[] = [];
    let idx = 1;
    for (const li of Array.from(el.querySelectorAll(':scope > li'))) {
      const textEl = li.cloneNode(true) as Element;
      const nested = textEl.querySelectorAll(':scope > ul, :scope > ol');
      const nestedHtml: string[] = [];
      nested.forEach(n => {
        nestedHtml.push(...convertNode(n, depth + 1));
        n.remove();
      });
      const text = inlineText(textEl);
      lines.push(`${'  '.repeat(depth)}${idx}. ${text}`);
      lines.push(...nestedHtml);
      idx++;
    }
    lines.push('');
    return lines;
  }

  // Table
  if (tag === 'table') {
    return convertTable(el);
  }

  // Figure / image
  if (tag === 'figure') {
    const img = el.querySelector('img');
    const caption = el.querySelector('figcaption')?.textContent?.trim() ?? '';
    if (img) {
      const src = img.getAttribute('src') ?? '';
      const alt = img.getAttribute('alt') ?? caption;
      return [`![${alt}](${src})`, caption ? `*${caption}*` : '', ''];
    }
    // Equation figure
    const eq = el.querySelector('.equation-content, [class*="equation"]');
    if (eq) return ['$$', eq.textContent?.trim() ?? '', '$$', ''];
    return convertChildren(el, depth);
  }

  if (tag === 'img') {
    const src = el.getAttribute('src') ?? '';
    const alt = el.getAttribute('alt') ?? '';
    return src ? [`![${alt}](${src})`, ''] : [];
  }

  // Equation block
  if (el.classList.contains('equation') || el.getAttribute('data-math')) {
    const latex = el.textContent?.trim() ?? '';
    return ['$$', latex, '$$', ''];
  }

  // Generic block containers — recurse
  if (['div', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside'].includes(tag)) {
    if (tag === 'aside') {
      // already handled above, but aside can also appear here via class
    }
    return convertChildren(el, depth);
  }

  // Fallback: treat as inline text inside a paragraph
  const text = inlineText(el);
  return text ? [text, ''] : [];
}

function convertTable(table: Element): string[] {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (!rows.length) return [];

  const lines: string[] = [];
  rows.forEach((row, i) => {
    const cells = Array.from(row.querySelectorAll('th, td'));
    const rowText = '| ' + cells.map(c => inlineText(c).replace(/\|/g, '\\|')).join(' | ') + ' |';
    lines.push(rowText);
    if (i === 0) {
      lines.push('| ' + cells.map(() => '---').join(' | ') + ' |');
    }
  });
  lines.push('');
  return lines;
}

// Convert element to inline Markdown (bold, italic, code, links, etc.)
function inlineText(el: Element): string {
  let result = '';
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent ?? '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as Element;
      const tag = child.tagName.toLowerCase();
      const inner = inlineText(child);

      if (tag === 'strong' || tag === 'b') result += `**${inner}**`;
      else if (tag === 'em' || tag === 'i') result += `*${inner}*`;
      else if (tag === 's' || tag === 'del') result += `~~${inner}~~`;
      else if (tag === 'mark') result += `==${inner}==`;
      else if (tag === 'code') result += `\`${inner}\``;
      else if (tag === 'a') {
        const href = child.getAttribute('href') ?? '';
        result += href ? `[${inner}](${href})` : inner;
      }
      else if (tag === 'br') result += '  \n';
      else if (tag === 'span') {
        // Notion uses spans for color/annotations — just grab text
        result += inner;
      }
      else result += inner;
    }
  }
  return result.trim();
}
