import { renderInlineMarkdown } from './markdownRenderer';

export const CALLOUT_PATTERN =
  /^>\s*\[!(NOTE|INFO|TIP|SUCCESS|IMPORTANT|WARNING|CAUTION|DANGER|ALERT)\](.*)/i;

const iconOnlyPattern = /^[\s\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]+$/u;

export interface ParsedCallout {
  type: string;
  className: string;
  icon: string;
  title: string;
  contentLines: string[];
}

function getCalloutIcon(type: string): string {
  if (type === 'INFO') return '\u2139\uFE0F';
  if (['TIP', 'SUCCESS'].includes(type)) return '\u2705';
  if (['IMPORTANT', 'WARNING', 'CAUTION'].includes(type)) return '\u26A0\uFE0F';
  if (['DANGER', 'ALERT'].includes(type)) return '\u26D4';
  return '\u{1F4A1}';
}

function getCalloutClass(type: string): string {
  if (['TIP', 'SUCCESS'].includes(type)) return 'success';
  if (['IMPORTANT', 'WARNING', 'CAUTION'].includes(type)) return 'warning';
  if (['DANGER', 'ALERT'].includes(type)) return 'danger';
  return 'note';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripBlockquoteMarker(line: string): string {
  return line.replace(/^>\s?/, '').trim();
}

export function parseCalloutBlock(raw: string): ParsedCallout | null {
  const lines = raw.split('\n');
  const firstLine = lines[0] ?? '';
  const match = firstLine.match(CALLOUT_PATTERN);

  if (!match) return null;

  const type = match[1].toUpperCase();
  const markerText = match[2].trim();
  const continuationLines = lines.slice(1).map(stripBlockquoteMarker);
  let icon = getCalloutIcon(type);
  let title = '';
  let contentLines = continuationLines;

  if (markerText) {
    if (iconOnlyPattern.test(markerText)) {
      icon = markerText;
    } else {
      title = markerText;
    }
  }

  contentLines = contentLines.filter((line, index, arr) => {
    const isEdgeBlank = line === '' && (index === 0 || index === arr.length - 1);
    return !isEdgeBlank;
  });

  return {
    type,
    className: getCalloutClass(type),
    icon,
    title,
    contentLines,
  };
}

export function buildCalloutHtml(callout: ParsedCallout): string {
  const titleHtml = callout.title
    ? `<strong>${renderInlineMarkdown(callout.title)}</strong>${callout.contentLines.length ? '<br/>' : ''}`
    : '';
  const bodyHtml = callout.contentLines.map(renderInlineMarkdown).join('<br/>');

  return `<div class="callout-block ${callout.className}"><span class="callout-icon">${escapeHtml(callout.icon)}</span><div class="callout-content">${titleHtml}${bodyHtml}</div></div>`;
}

export function renderCalloutBlock(raw: string): string | null {
  const callout = parseCalloutBlock(raw);
  return callout ? buildCalloutHtml(callout) : null;
}

export function preprocessCallouts(markdown: string): string {
  const lines = markdown.split('\n');
  const newLines: string[] = [];
  let currentLines: string[] = [];

  const flush = () => {
    if (!currentLines.length) return;
    const html = renderCalloutBlock(currentLines.join('\n'));
    newLines.push(html ?? currentLines.join('\n'));
    currentLines = [];
  };

  for (const line of lines) {
    if (CALLOUT_PATTERN.test(line)) {
      flush();
      currentLines = [line];
      continue;
    }

    if (currentLines.length && line.startsWith('>')) {
      currentLines.push(line);
      continue;
    }

    flush();
    newLines.push(line);
  }

  flush();
  return newLines.join('\n');
}
