export type ExplorationProvider = 'agy' | 'openai';
export type ExplorationTaskStatus = 'active' | 'paused' | 'archived';
export type ExplorationScheduleKind = 'manual' | 'daily' | 'weekdays' | 'weekly' | 'monthly';
export type ExplorationRunStatus = 'pending' | 'running' | 'complete' | 'complete_with_shortfall' | 'failed' | 'skipped';

export interface ExplorationSchedule {
  kind: ExplorationScheduleKind;
  localTime: string;
  daysOfWeek: number[];
  dayOfMonth: number | null;
}

export interface ExplorationTask {
  schemaVersion: 'exploration-v1';
  id: string;
  name: string;
  topic: string;
  instructions: string;
  provider: ExplorationProvider;
  model: string;
  itemCount: number;
  schedule: ExplorationSchedule;
  notificationEnabled: boolean;
  status: ExplorationTaskStatus;
  sources: { connectorIds: string[]; customUrls: string[]; directUrls: string[]; excludedDomains: string[] };
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface ExplorationRun {
  id: string;
  taskId: string;
  origin: 'scheduled_ai_exploration' | 'manual_ai_exploration' | 'legacy_brew_import';
  status: ExplorationRunStatus;
  scheduledFor: string | null;
  startedAt: string | null;
  completedAt: string | null;
  taskSnapshot: ExplorationTask | Record<string, unknown>;
  attempts: Array<Record<string, unknown>>;
  sourceCollection: Record<string, unknown> | null;
  itemIds: string[];
  requestedCount: number;
  shortfallReason: string;
  error: string;
}

export interface ExplorationSource {
  url: string;
  canonicalUrl: string;
  domain: string;
  platform: string;
  author: string;
  publishedAt: string;
  evidenceExcerpt: string;
}

export interface ExplorationItem {
  id: string;
  taskId: string;
  runId: string;
  origin: 'scheduled_ai_exploration' | 'legacy_brew_import';
  title: string;
  summary: string;
  sourceSupported: string;
  editorialSynthesis: string;
  source: ExplorationSource;
  scores: Record<string, number>;
  urlCheck: { accessible: boolean; status: number; reason?: string } | null;
  read: boolean;
  favoriteLevel: 0 | 1 | 2;
  archived: boolean;
  converted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReferenceSource {
  id: string;
  taskId: string;
  runId: string;
  title: string;
  summary: string;
  sourceSupported: string;
  editorialSynthesis: string;
  source: Pick<ExplorationSource, 'url' | 'platform' | 'author' | 'publishedAt' | 'evidenceExcerpt'>;
}
