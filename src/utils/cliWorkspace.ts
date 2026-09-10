// Bind every desktop request to its own folder, including delayed saves.
export function cliWorkspaceHeaders(workspace?: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(workspace ? { 'X-WikiTree-Workspace': encodeURIComponent(workspace) } : {}),
  };
}
