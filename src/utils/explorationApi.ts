import { cliWorkspaceHeaders } from './cliWorkspace';
import type { ExplorationItem, ExplorationRun, ExplorationTask } from '../types/exploration';

const baseUrl = () => localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080';

async function request<T>(workspace: string, route: string, init: RequestInit = {}): Promise<T> {
  if (!workspace) throw new Error('探索苗圃需要先連接本機知識森林。');
  const response = await fetch(`${baseUrl()}${route}`, {
    ...init,
    headers: { ...cliWorkspaceHeaders(workspace), 'X-WikiTree-AI': '1', ...(init.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `探索苗圃暫時無法使用（${response.status}）。`);
  return payload as T;
}

export const explorationApi = {
  tasks: (workspace: string) => request<{ tasks: ExplorationTask[] }>(workspace, '/api/exploration/tasks'),
  saveTask: (workspace: string, value: Partial<ExplorationTask>) => request<{ task: ExplorationTask }>(workspace, '/api/exploration/tasks', { method: value.id ? 'PATCH' : 'POST', body: JSON.stringify(value) }),
  archiveTask: (workspace: string, id: string) => request<{ task: ExplorationTask }>(workspace, '/api/exploration/tasks', { method: 'DELETE', body: JSON.stringify({ id }) }),
  runTask: (workspace: string, id: string) => request<{ runId: string; status: string }>(workspace, `/api/exploration/tasks/${encodeURIComponent(id)}/run`, { method: 'POST', body: '{}' }),
  runs: (workspace: string) => request<{ runs: ExplorationRun[] }>(workspace, '/api/exploration/runs?limit=200'),
  items: (workspace: string) => request<{ items: ExplorationItem[] }>(workspace, '/api/exploration/items?limit=1000'),
  feedback: (workspace: string, id: string, action: string) => request<{ item: ExplorationItem }>(workspace, '/api/exploration/items', { method: 'PATCH', body: JSON.stringify({ id, action }) }),
  deleteItem: (workspace: string, id: string) => request<{ success: boolean }>(workspace, '/api/exploration/items', { method: 'DELETE', body: JSON.stringify({ id, confirm: 'DELETE' }) }),
  basket: (workspace: string) => request<{ items: ExplorationItem[] }>(workspace, '/api/exploration/basket'),
  setBasket: (workspace: string, ids: string[]) => request<{ items: ExplorationItem[] }>(workspace, '/api/exploration/basket', { method: 'PUT', body: JSON.stringify({ ids }) }),
  reviews: (workspace: string) => request<{ reviews: Array<{ id: string; itemId: string; dueOn: string; intervalDays: number; status: string }> }>(workspace, '/api/exploration/reviews'),
  scheduler: (workspace: string) => request<{ supported: boolean; installed: boolean; status: string; error: string }>(workspace, '/api/exploration/scheduler'),
  schedulerAction: (workspace: string, action: 'install' | 'remove') => request<{ supported: boolean; installed: boolean; status: string; error: string }>(workspace, '/api/exploration/scheduler', { method: 'POST', body: JSON.stringify({ action }) }),
  importBrew: (workspace: string, brewRoot: string) => request<{ imported: number; skipped: number; runs: number }>(workspace, '/api/exploration/import', { method: 'POST', body: JSON.stringify({ brewRoot }) }),
};
