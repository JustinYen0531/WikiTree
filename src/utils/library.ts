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

  const supported = files.filter(file => /\.(md|markdown|txt)$/i.test(file.name));
  const unsupported = files.filter(file => !supported.includes(file));
  if (!supported.length) throw new Error('這批內容沒有可收進的 Markdown 或純文字文件。');

  const totalBytes = supported.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > 15_000_000) throw new Error('這批文件超過 15 MB，請分次收進 WikiTree。');

  const prepared = await Promise.all(supported.map(async file => ({
    path: file.webkitRelativePath || file.name,
    content: await file.text(),
  })));

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
      ...unsupported.map(file => ({ path: file.webkitRelativePath || file.name, reason: '第一版只收進 Markdown 與純文字文件。' })),
      ...(data.skipped || []),
    ],
  };
}
