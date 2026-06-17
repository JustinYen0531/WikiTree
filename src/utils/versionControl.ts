import {
  getDirectoryHandleByPath,
  createFile,
  writeFileContent,
  readFileContent,
  getFilesRecursively,
  deleteEntry,
  FileNode
} from './fileSystem';

export interface SnapshotChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
}

export interface Snapshot {
  id: string; // e.g. "snapshot-1718600000000"
  timestamp: number;
  message: string;
  changes: SnapshotChange[];
}

const getCliUrl = () => localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080';

/**
 * Gets the .notes_history directory handle, creating it if it doesn't exist.
 */
async function getHistoryDir(rootHandle: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle> {
  return await rootHandle.getDirectoryHandle('.notes_history', { create: true });
}

/**
 * Gets the snapshots directory handle, creating it if it doesn't exist.
 */
async function getSnapshotsDir(historyDir: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle> {
  return await historyDir.getDirectoryHandle('snapshots', { create: true });
}

/**
 * Reads all snapshots metadata from .notes_history/snapshots.json
 */
export async function loadSnapshots(rootHandle: FileSystemDirectoryHandle | string): Promise<Snapshot[]> {
  if (typeof rootHandle === 'string') {
    try {
      const response = await fetch(`${getCliUrl()}/api/workspace/snapshots/load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        return await response.json() as Snapshot[];
      }
    } catch (e) {
      console.error('Failed to load snapshots from CLI server', e);
    }
    return [];
  }

  try {
    const historyDir = await rootHandle.getDirectoryHandle('.notes_history');
    const fileHandle = await historyDir.getFileHandle('snapshots.json');
    const content = await readFileContent(fileHandle);
    return JSON.parse(content) as Snapshot[];
  } catch (e) {
    return [];
  }
}

/**
 * Saves the snapshots list back to .notes_history/snapshots.json
 */
async function saveSnapshotsList(rootHandle: FileSystemDirectoryHandle, snapshots: Snapshot[]): Promise<void> {
  const historyDir = await getHistoryDir(rootHandle);
  const fileHandle = await historyDir.getFileHandle('snapshots.json', { create: true });
  await writeFileContent(fileHandle, JSON.stringify(snapshots, null, 2));
}

/**
 * Flattens the file tree into an array of path & content for comparison.
 */
export async function getFlatFileState(
  rootHandle: FileSystemDirectoryHandle | string,
  nodeList: FileNode[]
): Promise<Map<string, string>> {
  const flatState = new Map<string, string>();

  async function traverse(nodes: FileNode[]) {
    for (const node of nodes) {
      if (node.kind === 'file') {
        try {
          const content = await readFileContent(node.handle);
          flatState.set(node.path, content);
        } catch (e) {
          console.error(`Error reading file for state comparison: ${node.path}`, e);
        }
      } else if (node.kind === 'directory' && node.children) {
        await traverse(node.children);
      }
    }
  }

  await traverse(nodeList);
  return flatState;
}

/**
 * Reconstructs the file state map at a specific snapshot ID by playing back all changes up to that snapshot.
 */
export async function getFileStateAtSnapshot(
  rootHandle: FileSystemDirectoryHandle | string,
  snapshots: Snapshot[],
  targetSnapshotId: string
): Promise<Map<string, { snapshotId: string; type: 'added' | 'modified' }>> {
  const state = new Map<string, { snapshotId: string; type: 'added' | 'modified' }>();
  
  const targetIndex = snapshots.findIndex(s => s.id === targetSnapshotId);
  if (targetIndex === -1) return state;

  for (let i = 0; i <= targetIndex; i++) {
    const snap = snapshots[i];
    for (const change of snap.changes) {
      if (change.type === 'deleted') {
        state.delete(change.path);
      } else {
        state.set(change.path, { snapshotId: snap.id, type: change.type });
      }
    }
  }

  return state;
}

/**
 * Reads a file's content from a specific snapshot storage folder.
 */
export async function getSnapshotFileContent(
  rootHandle: FileSystemDirectoryHandle | string,
  snapshotId: string,
  filePath: string
): Promise<string> {
  if (typeof rootHandle === 'string') {
    const response = await fetch(`${getCliUrl()}/api/workspace/snapshots/read-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshotId, path: filePath })
    });
    if (response.ok) {
      const data = await response.json();
      return data.content;
    }
    throw new Error('Failed to read snapshot file from CLI server');
  }

  const historyDir = await getHistoryDir(rootHandle);
  const snapshotsDir = await getSnapshotsDir(historyDir);
  const snapFolder = await snapshotsDir.getDirectoryHandle(snapshotId);
  
  const parts = filePath.split('/');
  const fileName = parts.pop()!;
  const subDirPath = parts.join('/');
  
  const fileDir = await getDirectoryHandleByPath(snapFolder, subDirPath);
  const fileHandle = await fileDir.getFileHandle(fileName);
  return await readFileContent(fileHandle);
}

/**
 * Computes changes between the current files and the latest snapshot.
 */
export async function computePendingChanges(
  rootHandle: FileSystemDirectoryHandle | string,
  currentFiles: FileNode[]
): Promise<SnapshotChange[]> {
  const snapshots = await loadSnapshots(rootHandle);
  const currentFlat = await getFlatFileState(rootHandle, currentFiles);
  
  if (snapshots.length === 0) {
    const changes: SnapshotChange[] = [];
    for (const path of currentFlat.keys()) {
      changes.push({ path, type: 'added' });
    }
    return changes;
  }

  const latestSnap = snapshots[snapshots.length - 1];
  const latestState = await getFileStateAtSnapshot(rootHandle, snapshots, latestSnap.id);
  const changes: SnapshotChange[] = [];

  for (const [path, currentContent] of currentFlat.entries()) {
    const snapRecord = latestState.get(path);
    if (!snapRecord) {
      changes.push({ path, type: 'added' });
    } else {
      try {
        const snapContent = await getSnapshotFileContent(rootHandle, snapRecord.snapshotId, path);
        if (snapContent !== currentContent) {
          changes.push({ path, type: 'modified' });
        }
      } catch (e) {
        changes.push({ path, type: 'modified' });
      }
    }
  }

  for (const path of latestState.keys()) {
    if (!currentFlat.has(path)) {
      changes.push({ path, type: 'deleted' });
    }
  }

  return changes;
}

/**
 * Creates a new snapshot with the current file state.
 */
export async function createSnapshot(
  rootHandle: FileSystemDirectoryHandle | string,
  currentFiles: FileNode[],
  message: string
): Promise<Snapshot | null> {
  const changes = await computePendingChanges(rootHandle, currentFiles);
  if (changes.length === 0) {
    return null; // No changes to commit
  }

  const snapshots = await loadSnapshots(rootHandle);
  const timestamp = Date.now();
  const snapshotId = `snap-${timestamp}`;

  const newSnapshot: Snapshot = {
    id: snapshotId,
    timestamp,
    message: message.trim() || `Snapshot at ${new Date(timestamp).toLocaleString()}`,
    changes
  };

  snapshots.push(newSnapshot);

  if (typeof rootHandle === 'string') {
    const currentFlat = await getFlatFileState(rootHandle, currentFiles);
    const filesToSave: Record<string, string> = {};
    for (const change of changes) {
      if (change.type === 'deleted') continue;
      filesToSave[change.path] = currentFlat.get(change.path) || '';
    }

    const response = await fetch(`${getCliUrl()}/api/workspace/snapshots/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        snapshotId,
        snapshot: newSnapshot,
        filesToSave,
        snapshotsList: snapshots
      })
    });
    if (!response.ok) {
      throw new Error('Failed to save snapshot to CLI server');
    }
    return newSnapshot;
  }

  const historyDir = await getHistoryDir(rootHandle);
  const snapshotsDir = await getSnapshotsDir(historyDir);
  const snapFolder = await snapshotsDir.getDirectoryHandle(snapshotId, { create: true });

  const currentFlat = await getFlatFileState(rootHandle, currentFiles);

  for (const change of changes) {
    if (change.type === 'deleted') continue;

    const content = currentFlat.get(change.path) || '';
    const parts = change.path.split('/');
    const fileName = parts.pop()!;
    const subDirPath = parts.join('/');

    const fileDir = await getDirectoryHandleByPath(snapFolder, subDirPath, { create: true });
    const fileHandle = await fileDir.getFileHandle(fileName, { create: true });
    await writeFileContent(fileHandle, content);
  }

  await saveSnapshotsList(rootHandle, snapshots);

  return newSnapshot;
}

/**
 * Restores a specific snapshot. Overwrites local files to match the snapshot's state.
 */
export async function restoreSnapshot(
  rootHandle: FileSystemDirectoryHandle | string,
  snapshotId: string,
  currentFiles: FileNode[]
): Promise<void> {
  const snapshots = await loadSnapshots(rootHandle);
  const targetState = await getFileStateAtSnapshot(rootHandle, snapshots, snapshotId);
  const currentFlat = await getFlatFileState(rootHandle, currentFiles);

  // 1. Delete files that are in current state but NOT in the target snapshot state
  for (const path of currentFlat.keys()) {
    if (!targetState.has(path)) {
      const parts = path.split('/');
      const name = parts.pop()!;
      const parentPath = parts.join('/');
      const parentDir = await getDirectoryHandleByPath(rootHandle, parentPath);
      await deleteEntry(parentDir, name);
    }
  }

  // 2. Add or modify files to match the target snapshot state
  for (const [path, record] of targetState.entries()) {
    const snapContent = await getSnapshotFileContent(rootHandle, record.snapshotId, path);
    const currentContent = currentFlat.get(path);

    if (currentContent !== snapContent) {
      const parts = path.split('/');
      const name = parts.pop()!;
      const parentPath = parts.join('/');
      const parentDir = await getDirectoryHandleByPath(rootHandle, parentPath, { create: true });
      
      let fileHandle;
      if (typeof rootHandle === 'string') {
        fileHandle = await createFile(parentDir, name);
      } else {
        fileHandle = await (parentDir as FileSystemDirectoryHandle).getFileHandle(name, { create: true });
      }
      
      await writeFileContent(fileHandle, snapContent);
    }
  }
}
