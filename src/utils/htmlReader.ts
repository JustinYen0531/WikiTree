import { cliWorkspaceHeaders } from './cliWorkspace';

const LOCAL_BASE = 'https://wikitree-lecture.invalid/';
const ASSET_EXTENSIONS = /\.(css|m?js|png|jpe?g|gif|webp|svg|ico|avif|woff2?|ttf|otf|mp3|wav|ogg|mp4|webm)$/i;

export const HTML_READER_POLICY = [
  "default-src 'none'",
  "script-src 'unsafe-inline' 'unsafe-eval' https: blob: data:",
  "style-src 'unsafe-inline' https: blob: data:",
  'img-src https: blob: data:', 'font-src https: blob: data:',
  'media-src https: blob: data:', 'frame-src https:',
  "connect-src 'none'", "object-src 'none'", "base-uri 'none'", "form-action 'none'",
].join('; ');

export function resolveLecturePath(reference: string, fromPath: string): string | null {
  const value = reference.trim();
  if (!value || value.startsWith('#') || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return null;
  try {
    const resolved = new URL(value.replace(/\\/g, '/'), new URL(fromPath, LOCAL_BASE));
    if (resolved.origin !== new URL(LOCAL_BASE).origin) return null;
    const path = decodeURIComponent(resolved.pathname.slice(1));
    if (path.split('/').some(part => !part || part.startsWith('.') || part.includes(':'))) return null;
    return path;
  } catch { return null; }
}

async function replaceAsync(text: string, pattern: RegExp, transform: (match: RegExpExecArray) => Promise<string>) {
  const matches = Array.from(text.matchAll(pattern));
  // Read in order to avoid duplicate recursive CSS requests.
  let output = '', last = 0;
  for (const match of matches) {
    output += text.slice(last, match.index) + await transform(match);
    last = match.index! + match[0].length;
  }
  return output + text.slice(last);
}

export async function prepareHtmlLecture(
  html: string,
  notePath: string,
  readAsset: (path: string) => Promise<Blob>,
  createUrl: (blob: Blob) => string = URL.createObjectURL,
) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const urls: string[] = [], missing = new Set<string>();
  const cache = new Map<string, string>();

  const css = async (text: string, from: string, ancestors: Set<string>): Promise<string> => {
    const imports = await replaceAsync(text, /@import\s+(['"])([^'"]+)\1/g, async match =>
      `@import url("${await resource(match[2], from, ancestors)}")`);
    return replaceAsync(imports, /url\(\s*(['"]?)([^)'"\n]+)\1\s*\)/g, async match =>
      `url("${await resource(match[2].trim(), from, ancestors)}")`);
  };

  const resource = async (value: string, from: string, ancestors = new Set<string>()): Promise<string> => {
    const path = resolveLecturePath(value, from);
    if (!path) {
      if (!value || value.startsWith('#') || /^(https:|data:|blob:)/i.test(value)) return value;
      missing.add(value);
      return 'about:blank';
    }
    if (!ASSET_EXTENSIONS.test(path) || ancestors.has(path) || ancestors.size > 12) {
      missing.add(path);
      return 'about:blank';
    }
    if (cache.has(path)) return cache.get(path)! + (value.includes('#') ? `#${value.split('#')[1]}` : '');
    try {
      let blob = await readAsset(path);
      if (/\.css$/i.test(path)) {
        blob = new Blob([await css(await blob.text(), path, new Set([...ancestors, path]))], { type: 'text/css' });
      }
      const url = createUrl(blob);
      urls.push(url);
      cache.set(path, url);
      return url + (value.includes('#') ? `#${value.split('#')[1]}` : '');
    } catch {
      missing.add(path);
      return 'about:blank';
    }
  };

  // Rendering changes apply only to this in-memory copy. Nothing is written back.
  doc.querySelectorAll('base').forEach(element => element.remove());
  for (const element of doc.querySelectorAll('[src], [poster], link[href], image[href], use[href]')) {
    for (const attr of ['src', 'poster', 'href']) {
      if (!element.hasAttribute(attr)) continue;
      if (element.tagName === 'IFRAME') continue;
      element.setAttribute(attr, await resource(element.getAttribute(attr)!, notePath));
    }
  }
  for (const element of doc.querySelectorAll('[srcset]')) {
    // Data URLs may contain commas; leave them intact.
    const value = element.getAttribute('srcset')!;
    if (!value.includes('data:')) {
      const entries: string[] = [];
      for (const entry of value.split(',')) {
        const [url, ...descriptor] = entry.trim().split(/\s+/);
        entries.push([await resource(url, notePath), ...descriptor].join(' '));
      }
      element.setAttribute('srcset', entries.join(', '));
    }
  }
  for (const element of doc.querySelectorAll('style')) element.textContent = await css(element.textContent || '', notePath, new Set());
  for (const element of doc.querySelectorAll('[style]')) element.setAttribute('style', await css(element.getAttribute('style')!, notePath, new Set()));
  for (const anchor of doc.querySelectorAll('a[href]')) {
    const href = anchor.getAttribute('href')!;
    if (/^https?:\/\//i.test(href)) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    } else if (!href.startsWith('#') && !/^javascript:/i.test(href)) {
      // Local page navigation is routed through the parent, never to its API.
      const path = resolveLecturePath(href, notePath);
      anchor.setAttribute('data-wikitree-note', path && /\.html?$/i.test(path) ? path : '');
      anchor.setAttribute('href', '#');
    }
  }
  const policy = doc.createElement('meta');
  policy.httpEquiv = 'Content-Security-Policy';
  policy.content = HTML_READER_POLICY;
  doc.head.prepend(policy);
  const bridge = doc.createElement('script');
  bridge.textContent = `document.addEventListener('click', function(event) {
    const anchor = event.target.closest && event.target.closest('a[href]');
    if (!anchor) return;
    if (anchor.hasAttribute('data-wikitree-note')) {
      event.preventDefault();
      const path = anchor.getAttribute('data-wikitree-note');
      if (path) parent.postMessage({ type: 'wikitree-html-navigation', path: path }, '*');
    } else if (anchor.getAttribute('href').startsWith('#')) {
      event.preventDefault();
      const id = decodeURIComponent(anchor.getAttribute('href').slice(1));
      const target = document.getElementById(id);
      if (target) target.scrollIntoView();
    }
  });`;
  doc.head.append(bridge);
  return { srcDoc: '<!DOCTYPE html>\n' + doc.documentElement.outerHTML, urls, missing: [...missing] };
}

export async function readLectureAsset(root: FileSystemDirectoryHandle | string, path: string): Promise<Blob> {
  if (typeof root === 'string') {
    const cliUrl = localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080';
    const response = await fetch(`${cliUrl}/api/workspace/html-asset`, {
      method: 'POST', headers: cliWorkspaceHeaders(root), body: JSON.stringify({ path }),
    });
    if (!response.ok) throw new Error('附件無法讀取。');
    return response.blob();
  }
  const parts = path.split('/');
  const name = parts.pop()!;
  let directory = root;
  for (const part of parts) directory = await directory.getDirectoryHandle(part);
  return (await directory.getFileHandle(name)).getFile();
}
