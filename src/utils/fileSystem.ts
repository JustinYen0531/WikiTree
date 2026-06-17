export interface FileNode {
  name: string;
  path: string; // Relative path from root
  kind: 'file' | 'directory';
  handle: any; // Can be native handle or a custom object in CLI mode
  children?: FileNode[];
}

const getCliUrl = () => localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080';

/**
 * Verify read/write permissions for a FileSystemHandle.
 * In CLI mode, permissions are bypassed (handled by the local server).
 */
export async function verifyPermission(
  fileHandle: any,
  readWrite: boolean = false
): Promise<boolean> {
  if (typeof fileHandle === 'string' || (fileHandle && fileHandle.isCli)) {
    return true;
  }

  const options: { mode: 'readwrite' | 'read' } = {
    mode: readWrite ? 'readwrite' : 'read',
  };

  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }

  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }

  return false;
}

/**
 * Recursively list all files and folders in a directory handle.
 * Bypassed via a single API call if in CLI mode.
 */
export async function getFilesRecursively(
  dirHandle: FileSystemDirectoryHandle | string,
  relativeParentPath: string = ''
): Promise<FileNode[]> {
  if (typeof dirHandle === 'string') {
    try {
      const response = await fetch(`${getCliUrl()}/api/workspace/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (response.ok) {
        const data = await response.json();
        
        // Enrich the files recursively to make sure they all have isCli handles
        const enrichFiles = (nodes: any[]): FileNode[] => {
          return nodes.map(node => ({
            ...node,
            handle: { path: node.path, isCli: true, name: node.name, kind: node.kind },
            children: node.children ? enrichFiles(node.children) : undefined
          }));
        };

        return enrichFiles(data.files || []);
      } else {
        throw new Error('Server error listing files');
      }
    } catch (e) {
      console.error('Failed to list files from CLI server', e);
      throw e;
    }
  }

  const nodes: FileNode[] = [];

  for await (const entry of dirHandle.values()) {
    // Ignore hidden files/folders (starting with .)
    if (entry.name.startsWith('.')) {
      continue;
    }

    const currentPath = relativeParentPath
      ? `${relativeParentPath}/${entry.name}`
      : entry.name;

    if (entry.kind === 'file') {
      nodes.push({
        name: entry.name,
        path: currentPath,
        kind: 'file',
        handle: entry as FileSystemFileHandle,
      });
    } else if (entry.kind === 'directory') {
      // Ignore output folders
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'out') {
        continue;
      }
      
      const children = await getFilesRecursively(
        entry as FileSystemDirectoryHandle,
        currentPath
      );

      nodes.push({
        name: entry.name,
        path: currentPath,
        kind: 'directory',
        handle: entry as FileSystemDirectoryHandle,
        children: children.sort((a, b) => {
          if (a.kind !== b.kind) {
            return a.kind === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        }),
      });
    }
  }

  return nodes.sort((a, b) => {
    if (a.kind !== b.kind) {
      return a.kind === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Read text content from a file handle.
 */
export async function readFileContent(fileHandle: FileSystemFileHandle | any): Promise<string> {
  if (fileHandle && (typeof fileHandle === 'string' || fileHandle.isCli)) {
    const filePath = typeof fileHandle === 'string' ? fileHandle : fileHandle.path;
    const response = await fetch(`${getCliUrl()}/api/workspace/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath })
    });
    if (response.ok) {
      const data = await response.json();
      return data.content;
    }
    throw new Error('Failed to read file from CLI server');
  }

  const file = await fileHandle.getFile();
  return await file.text();
}

/**
 * Write text content to a file handle.
 */
export async function writeFileContent(
  fileHandle: FileSystemFileHandle | any,
  content: string
): Promise<void> {
  if (fileHandle && (typeof fileHandle === 'string' || fileHandle.isCli)) {
    const filePath = typeof fileHandle === 'string' ? fileHandle : fileHandle.path;
    const response = await fetch(`${getCliUrl()}/api/workspace/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, content })
    });
    if (!response.ok) {
      throw new Error('Failed to write file to CLI server');
    }
    return;
  }

  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

/**
 * Find or create a sub-directory path relative to a root directory handle.
 */
export async function getDirectoryHandleByPath(
  rootHandle: FileSystemDirectoryHandle | string,
  path: string,
  options: { create?: boolean } = {}
): Promise<any> {
  if (typeof rootHandle === 'string') {
    const cleanPath = path.split('/').filter(Boolean).join('/');
    if (options.create && cleanPath) {
      const response = await fetch(`${getCliUrl()}/api/workspace/create-directory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: cleanPath })
      });
      if (!response.ok) {
        throw new Error('Failed to create directory on CLI server');
      }
    }
    return { path: cleanPath, isCli: true, kind: 'directory' };
  }

  if (!path || path === '/') {
    return rootHandle;
  }

  const parts = path.split('/').filter(Boolean);
  let currentHandle = rootHandle;

  for (const part of parts) {
    currentHandle = await currentHandle.getDirectoryHandle(part, options);
  }

  return currentHandle;
}

/**
 * Create a new file within a parent directory handle.
 */
export async function createFile(
  parentDirHandle: FileSystemDirectoryHandle | any,
  name: string
): Promise<any> {
  if (parentDirHandle && parentDirHandle.isCli) {
    const parentPath = parentDirHandle.path;
    const response = await fetch(`${getCliUrl()}/api/workspace/create-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: parentPath, name })
    });
    if (!response.ok) {
      throw new Error('Failed to create file on CLI server');
    }
    const relativePath = parentPath ? `${parentPath}/${name}` : name;
    return { path: relativePath, isCli: true, kind: 'file' };
  }

  return await parentDirHandle.getFileHandle(name, { create: true });
}

/**
 * Create a new sub-directory within a parent directory handle.
 */
export async function createDirectory(
  parentDirHandle: FileSystemDirectoryHandle | any,
  name: string
): Promise<any> {
  if (parentDirHandle && parentDirHandle.isCli) {
    const parentPath = parentDirHandle.path;
    const relativePath = parentPath ? `${parentPath}/${name}` : name;
    const response = await fetch(`${getCliUrl()}/api/workspace/create-directory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: relativePath })
    });
    if (!response.ok) {
      throw new Error('Failed to create directory on CLI server');
    }
    return { path: relativePath, isCli: true, kind: 'directory' };
  }

  return await parentDirHandle.getDirectoryHandle(name, { create: true });
}

/**
 * Delete an entry (file or folder) in a parent directory.
 */
export async function deleteEntry(
  parentDirHandle: FileSystemDirectoryHandle | any,
  name: string,
  recursive = true
): Promise<void> {
  if (parentDirHandle && parentDirHandle.isCli) {
    const parentPath = parentDirHandle.path;
    const relativePath = parentPath ? `${parentPath}/${name}` : name;
    const response = await fetch(`${getCliUrl()}/api/workspace/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: relativePath })
    });
    if (!response.ok) {
      throw new Error('Failed to delete entry on CLI server');
    }
    return;
  }

  await parentDirHandle.removeEntry(name, { recursive });
}

/**
 * Rename an entry (file or folder).
 */
export async function renameEntry(
  parentDirHandle: FileSystemDirectoryHandle | any,
  oldName: string,
  newName: string,
  kind: 'file' | 'directory'
): Promise<void> {
  if (parentDirHandle && parentDirHandle.isCli) {
    const parentPath = parentDirHandle.path;
    const relativePath = parentPath ? `${parentPath}/${oldName}` : oldName;
    const response = await fetch(`${getCliUrl()}/api/workspace/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: relativePath, newName })
    });
    if (!response.ok) {
      throw new Error('Failed to rename entry on CLI server');
    }
    return;
  }

  const handle = kind === 'file' 
    ? await parentDirHandle.getFileHandle(oldName)
    : await parentDirHandle.getDirectoryHandle(oldName);

  if (typeof (handle as any).move === 'function') {
    await (handle as any).move(newName);
    return;
  }

  if (kind === 'file') {
    const fileHandle = handle as FileSystemFileHandle;
    const content = await readFileContent(fileHandle);
    const newFileHandle = await parentDirHandle.getFileHandle(newName, { create: true });
    await writeFileContent(newFileHandle, content);
    await parentDirHandle.removeEntry(oldName);
  } else {
    throw new Error('Renaming directories is not supported in this browser version.');
  }
}
