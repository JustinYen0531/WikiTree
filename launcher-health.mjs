import path from 'node:path';

export const REQUIRED_CLI_CAPABILITIES = ['managedLibrary', 'libraryImport'];

export function sameWorkspace(status, workspaceRoot) {
  if (!status?.workspace || !workspaceRoot) return false;
  return path.resolve(status.workspace).toLowerCase() === path.resolve(workspaceRoot).toLowerCase();
}

export function isCompatibleCliStatus(status, workspaceRoot) {
  return Boolean(
    status?.status === 'connected'
      && sameWorkspace(status, workspaceRoot)
      && REQUIRED_CLI_CAPABILITIES.every(capability => status[capability] === true)
  );
}

export async function readCliStatus(fetchImpl = fetch, timeoutMs = 1500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl('http://127.0.0.1:18080/api/status', {
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
