import type { CSSProperties } from 'react';
import { getTheme, type ThemeId } from './themes';

export type HtmlPalette = { background: string; foreground: string; accent: string };
export type HtmlColorSample = { background?: string; foreground?: string; accent?: string; weight: number };
export const HTML_FALLBACK_PALETTE: HtmlPalette = { background: '#faf8f3', foreground: '#263b37', accent: '#27675b' };

type RGB = [number, number, number];

// Accept color values only, never arbitrary CSS from a lecture message.
export function parseHtmlColor(value: unknown): RGB | null {
  if (typeof value !== 'string') return null;
  const hex = value.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map(char => char + char).join('') : hex[1];
    return [0, 2, 4].map(offset => parseInt(digits.slice(offset, offset + 2), 16)) as RGB;
  }
  const rgb = value.trim().match(/^rgba?\(\s*([\d.]+)(%)?[,\s]+([\d.]+)(%)?[,\s]+([\d.]+)(%)?(?:\s*[,/]\s*([\d.]+)(%)?)?\s*\)$/i);
  if (!rgb) return null;
  const alpha = rgb[7] === undefined ? 1 : Number(rgb[7]) / (rgb[8] ? 100 : 1);
  if (!Number.isFinite(alpha) || alpha < .95 || alpha > 1) return null;
  const channels = [1, 3, 5].map(index => rgb[index + 1] ? Number(rgb[index]) / 100 * 255 : Number(rgb[index]));
  return channels.every(channel => Number.isFinite(channel) && channel >= 0 && channel <= 255.001)
    ? channels.map(channel => Math.round(channel)) as RGB : null;
}

const hexColor = (rgb: RGB) => '#' + rgb.map(channel => channel.toString(16).padStart(2, '0')).join('');
const mix = (first: RGB, second: RGB, amount: number): RGB => first.map((channel, index) => Math.round(channel * (1 - amount) + second[index] * amount)) as RGB;
const luminance = (rgb: RGB) => rgb.map(channel => channel / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
export const htmlColorContrast = (first: string, second: string) => {
  const a = luminance(parseHtmlColor(first)!); const b = luminance(parseHtmlColor(second)!);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
};
const readableInk = (background: string) => htmlColorContrast(background, '#202b29') >= 4.5 ? '#202b29' : '#f7faf9';

export function discoverHtmlPalette(samples: unknown): HtmlPalette {
  if (!Array.isArray(samples)) return HTML_FALLBACK_PALETTE;
  const backgrounds = new Map<string, number>(), foregrounds = new Map<string, number>(), accents = new Map<string, number>();
  for (const sample of samples.slice(0, 400)) {
    if (!sample || !Number.isFinite(sample.weight) || sample.weight <= 0) continue;
    for (const [key, votes] of [['background', backgrounds], ['foreground', foregrounds], ['accent', accents]] as const) {
      const rgb = parseHtmlColor(sample[key]);
      if (!rgb) continue;
      const color = hexColor(rgb);
      const chroma = (Math.max(...rgb) - Math.min(...rgb)) / 255;
      if (key === 'accent' && chroma < .12) continue;
      const weight = Math.min(sample.weight, 100) * (key === 'accent' ? chroma : 1);
      votes.set(color, (votes.get(color) || 0) + weight);
    }
  }
  if (!backgrounds.size && !foregrounds.size && !accents.size) return HTML_FALLBACK_PALETTE;
  const ranked = (votes: Map<string, number>) => [...votes].sort((a, b) => b[1] - a[1]).map(([color]) => color);
  const background = ranked(backgrounds)[0] || HTML_FALLBACK_PALETTE.background;
  const foreground = ranked(foregrounds).find(color => htmlColorContrast(background, color) >= 4.5) || readableInk(background);
  let accent = ranked(accents)[0] || HTML_FALLBACK_PALETTE.accent;
  if (htmlColorContrast(background, accent) < 4.5) {
    const original = parseHtmlColor(accent)!, ink = parseHtmlColor(foreground)!;
    for (let amount = .1; amount <= 1.01; amount += .1) {
      accent = hexColor(mix(original, ink, Math.min(amount, 1)));
      if (htmlColorContrast(background, accent) >= 4.5) break;
    }
  }
  return { background, foreground, accent };
}

// Scoped to the app container; removing these tokens restores the saved Markdown theme.
export function readingAppearance(theme: ThemeId, htmlVisible: boolean, palette = HTML_FALLBACK_PALETTE): { mode: string; style?: CSSProperties } {
  if (!htmlVisible) return { mode: 'markdown', style: { colorScheme: getTheme(theme).mode } };
  const bg = parseHtmlColor(palette.background)!, fg = parseHtmlColor(palette.foreground)!, accent = parseHtmlColor(palette.accent)!;
  const tint = (amount: number) => hexColor(mix(bg, fg, amount));
  const textTint = (amount: number) => {
    let color = tint(amount);
    while (htmlColorContrast(palette.background, color) < 4.5 && amount < 1) {
      amount = Math.min(1, amount + .05); color = tint(amount);
    }
    return color;
  };
  const tokens = {
    '--bg-primary': palette.background, '--bg-secondary': tint(.025), '--bg-sidebar': tint(.04), '--bg-tertiary': tint(.065),
    '--text-primary': palette.foreground, '--text-secondary': textTint(.72), '--text-muted': textTint(.60),
    '--accent': palette.accent, '--accent-hover': hexColor(mix(accent, fg, .22)), '--accent-bg': hexColor(mix(bg, accent, .09)),
    '--border-color': tint(.18), '--surface-translucent': tint(.025), '--surface-strong': tint(.04), '--surface-hover': tint(.07), '--surface-active': tint(.12),
    '--input-bg': tint(.015), '--header-sheen': tint(.025), '--ambient-primary': 'transparent', '--ambient-secondary': 'transparent', '--ambient-edge': 'transparent',
    '--highlight': hexColor(mix(bg, accent, .2)), '--highlight-text': palette.foreground, '--code-bg': tint(.06), '--code-border': tint(.18),
    '--quote-border': palette.accent, '--tag-bg': hexColor(mix(bg, accent, .09)), '--graph-node': palette.accent,
    '--success': palette.accent, '--success-bg': tint(.06), '--success-border': tint(.2), '--warning': palette.foreground, '--warning-bg': tint(.06),
    '--danger': palette.foreground, '--danger-bg': tint(.08), '--grid-line': tint(.04), '--overlay': 'rgba(0, 0, 0, .55)',
    backgroundColor: palette.background, color: palette.foreground,
    colorScheme: luminance(bg) > .179 ? 'light' : 'dark',
  };
  // Reading never changes theme identity or local storage.
  return { mode: 'html-adaptive', style: tokens as CSSProperties };
}

// This read-only function runs inside the isolated lecture, where computed CSS
// includes variables, linked stylesheets and media queries. It has no note API access.
export function reportHtmlColors() {
  let scheduled = false;
  const report = () => {
    scheduled = false;
    const samples: HtmlColorSample[] = [];
    const width = window.innerWidth, height = window.innerHeight;
    if (!width || !height || !document.body) return;
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const color = (value: string) => {
      if (!context || !CSS.supports('color', value)) return value;
      context.clearRect(0, 0, 1, 1); context.fillStyle = value; context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      return `rgba(${r},${g},${b},${a / 255})`;
    };
    // Sample visible coverage rather than counting CSS declarations or tiny badges.
    for (let row = 0; row < 5; row++) for (let column = 0; column < 5; column++) {
      const element = document.elementFromPoint((column + .5) * width / 5, (row + .5) * height / 5);
      if (!element) continue;
      const foreground = color(getComputedStyle(element).color);
      let background: string | undefined;
      for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        // Gradients and images cannot be represented faithfully by one solid color.
        if (style.backgroundImage !== 'none') break;
        const candidate = color(style.backgroundColor);
        const alpha = candidate.match(/^rgba\([^)]*,\s*([\d.]+)\)$/i);
        if (candidate !== 'transparent' && (!alpha || Number(alpha[1]) >= .95)) { background = candidate; break; }
      }
      samples.push({ background, foreground, weight: 1 });
    }
    const candidates = document.querySelectorAll('h1,h2,h3,a,button,header,main,article,section,[class]');
    for (const element of Array.from(candidates).slice(0, 160)) {
      const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
      const visibleWidth = Math.max(0, Math.min(rect.right, width) - Math.max(rect.left, 0));
      const visibleHeight = Math.max(0, Math.min(rect.bottom, height) - Math.max(rect.top, 0));
      if (!visibleWidth || !visibleHeight || style.visibility !== 'visible' || style.display === 'none' || Number(style.opacity) < .95) continue;
      const weight = Math.min(5, Math.max(.1, visibleWidth * visibleHeight / (width * height) * 10));
      samples.push({ accent: color(style.color), weight: /^(H[1-3]|A|BUTTON|HEADER)$/.test(element.tagName) ? weight * 2 : weight });
      if (style.backgroundImage === 'none') samples.push({ accent: color(style.backgroundColor), weight });
    }
    parent.postMessage({ type: 'wikitree-html-colors', samples }, '*');
  };
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(report); } };
  document.addEventListener('DOMContentLoaded', schedule, { once: true });
  window.addEventListener('load', schedule, { once: true });
  window.addEventListener('resize', schedule);
  // Follow a lecture's own light/dark toggle without changing its behavior.
  new MutationObserver(schedule).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['class', 'style'], childList: true });
  if (document.readyState !== 'loading') schedule();
}

export const htmlColorBridgeScript = () => `(${reportHtmlColors.toString()})();`;
