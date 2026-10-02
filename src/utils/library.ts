import type { FileNode } from './fileSystem';

export type LibraryInfo = {
  id: string;
  name: string;
  version: number;
  path: string;
  created: boolean;
};

export type LibraryImportResult = {
  library: LibraryInfo;
  imported: string[];
  skipped: Array<{ path: string; reason: string }>;
};

const getCliUrl = () => localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080';

export const isLibraryNote = (name: string) => /\.(md|markdown|txt|html?)$/i.test(name);
export const isLectureAttachment = (name: string) => /\.(css|m?js|png|jpe?g|gif|webp|svg|ico|avif|woff2?|ttf|otf|mp3|wav|ogg|mp4|webm)$/i.test(name);
export const canImportLibraryFile = (file: File, files: File[]) => isLibraryNote(file.name) ||
  (files.some(item => /\.html?$/i.test(item.name)) && isLectureAttachment(file.name));

export async function getManagedLibrary(): Promise<LibraryInfo> {
  const response = await fetch(`${getCliUrl()}/api/library`, { headers: { Accept: 'application/json' } });
  const data = await response.json();
  if (!response.ok || !data.library?.path) throw new Error(data.error || '無法進入你的 WikiTree。');
  return data.library;
}

export function collectLibraryFolders(nodes: FileNode[]): Array<{ path: string; label: string }> {
  const folders: Array<{ path: string; label: string }> = [{ path: '', label: '我的 WikiTree（最外層）' }];
  const visit = (items: FileNode[]) => {
    for (const item of items) {
      if (item.kind !== 'directory') continue;
      folders.push({ path: item.path, label: item.path.split('/').join(' › ') });
      if (item.children) visit(item.children);
    }
  };
  visit(nodes);
  return folders;
}

export async function importFilesToLibrary(files: File[], destination: string): Promise<LibraryImportResult> {
  if (!files.length) throw new Error('請先選擇要收進 WikiTree 的文件。');
  if (files.length > 500) throw new Error('一次最多收進 500 個文件。');

  const supported = files.filter(file => canImportLibraryFile(file, files));
  const unsupported = files.filter(file => !supported.includes(file));
  if (!supported.length) throw new Error('這批內容沒有可收進的 HTML、Markdown 或純文字文件。');

  const totalBytes = supported.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > 15_000_000) throw new Error('這批文件超過 15 MB，請分次收進 WikiTree。');

  const prepared = await Promise.all(supported.map(async file => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
    return { path: file.webkitRelativePath || file.name, base64: btoa(binary) };
  }));

  const response = await fetch(`${getCliUrl()}/api/library/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-WikiTree-AI': '1' },
    body: JSON.stringify({ destination, files: prepared }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '文件還沒能收進 WikiTree。');
  return {
    ...data,
    skipped: [
      ...unsupported.map(file => ({ path: file.webkitRelativePath || file.name, reason: '只支援筆記與 HTML 講義附件。' })),
      ...(data.skipped || []),
    ],
  };
}
