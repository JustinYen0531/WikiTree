import { get, set, del } from 'idb-keyval';

const HANDLE_KEY = 'nccu_hub_workspace_handle';
const LAST_FILE_KEY = 'nccu_hub_last_file_path';

export async function saveWorkspaceHandle(handle: FileSystemDirectoryHandle) {
  await set(HANDLE_KEY, handle);
}

export async function loadWorkspaceHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await get<FileSystemDirectoryHandle>(HANDLE_KEY);
    return handle ?? null;
  } catch {
    return null;
  }
}

export async function clearWorkspaceHandle() {
  await del(HANDLE_KEY);
}

export function saveLastFilePath(path: string) {
  localStorage.setItem(LAST_FILE_KEY, path);
}

export function loadLastFilePath(): string | null {
  return localStorage.getItem(LAST_FILE_KEY);
}

export function clearLastFilePath() {
  localStorage.removeItem(LAST_FILE_KEY);
}
