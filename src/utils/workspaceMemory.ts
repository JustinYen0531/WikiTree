import type { FileNode } from './fileSystem';

export interface WorkspaceFolder {
  id: string;
  name: string;
  handle: FileSystemDirectoryHandle | string;
  files?: FileNode[];
  error?: string;
}

export function workspaceId(path: string): string {
  const normalized = path.replace(/\\/g, '/').replace(/\/+$/, '');
  return `desktop:${/^[a-z]:/i.test(normalized) || normalized.startsWith('//') ? normalized.toLowerCase() : normalized}`;
}

const storageKey = () => `wikitree-folders-v1:${localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080'}`;

export function readWorkspaceMemory(): { folders: WorkspaceFolder[]; activeId: string | null } {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey()) || '{}');
    const folders: WorkspaceFolder[] = [];
    for (const entry of Array.isArray(saved.folders) ? saved.folders : []) {
      if (typeof entry.path !== 'string' || !entry.path.trim()) continue;
      const id = workspaceId(entry.path);
      if (!folders.some(folder => folder.id === id)) folders.push({ id, name: entry.path.split(/[\\/]/).filter(Boolean).pop() || entry.path, handle: entry.path });
    }
    return { folders, activeId: folders.some(folder => folder.id === saved.activeId) ? saved.activeId : folders[0]?.id || null };
  } catch { return { folders: [], activeId: null }; }
}

export function writeWorkspaceMemory(folders: WorkspaceFolder[], activeId: string | null): void {
  const desktopFolders = folders.filter(folder => typeof folder.handle === 'string');
  localStorage.setItem(storageKey(), JSON.stringify({
    folders: desktopFolders.map(folder => ({ path: folder.handle })),
    activeId: desktopFolders.some(folder => folder.id === activeId) ? activeId : desktopFolders[0]?.id || null,
  }));
}
