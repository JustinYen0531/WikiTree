export interface AiSelection { provider: string; model: string }

export interface AiProviderModel {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface AiProviderState {
  status: 'connected' | 'disconnected' | 'pending' | 'unsupported' | 'error';
  message: string;
  authUrl?: string;
  models: AiProviderModel[];
}

export const AI_PROVIDER_OPTIONS = [
  { id: 'openai', name: 'OpenAI · Codex', shortName: 'OpenAI' },
] as const;
