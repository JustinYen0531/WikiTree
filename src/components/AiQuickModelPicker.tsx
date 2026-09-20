import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Cpu } from 'lucide-react';
import {
  AI_PROVIDER_OPTIONS,
  type AiProviderState,
  type AiSelection,
} from '../utils/aiProviderOptions';

const headers = { 'X-WikiTree-AI': '1' };

function unavailableLabel(state?: AiProviderState) {
  if (!state) return '讀取模型中…';
  if (state.status === 'pending') return '等待登入完成…';
  if (state.status === 'disconnected') return '尚未連線，請先至設定連線';
  if (state.status === 'unsupported') return '目前尚未支援';
  if (state.status === 'error') return state.message || '無法讀取模型';
  return '目前沒有可用模型';
}

export function AiQuickModelPicker({ url, selection, onChange, onReadyChange, disabled }: {
  url: string;
  selection: AiSelection;
  onChange: (value: AiSelection) => void;
  onReadyChange: (ready: boolean) => void;
  disabled: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [states, setStates] = useState<Record<string, AiProviderState>>({});

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    const controller = new AbortController();
    const providerIds = open
      ? AI_PROVIDER_OPTIONS.map(provider => provider.id)
      : [selection.provider];

    const load = async () => {
      const entries = await Promise.all(providerIds.map(async providerId => {
        try {
          const response = await fetch(`${url}/api/ai/state?provider=${encodeURIComponent(providerId)}`, {
            headers,
            signal: controller.signal,
          });
          if (!response.ok) throw new Error('無法讀取模型');
          return [providerId, await response.json() as AiProviderState] as const;
        } catch (error) {
          if (controller.signal.aborted) return null;
          return [providerId, {
            status: 'error',
            message: error instanceof Error ? error.message : '無法讀取模型',
            models: [],
          } satisfies AiProviderState] as const;
        }
      }));
      if (controller.signal.aborted) return;

      const loaded = entries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
      setStates(previous => ({ ...previous, ...Object.fromEntries(loaded) }));
      const selectedState = loaded.find(([providerId]) => providerId === selection.provider)?.[1];
      if (!selectedState) return;
      if (selectedState.status !== 'connected' || selectedState.models.length === 0) {
        onReadyChange(false);
        return;
      }
      const selectedModel = selectedState.models.find(model => model.id === selection.model)
        || selectedState.models.find(model => model.isDefault)
        || selectedState.models[0];
      if (selectedModel.id !== selection.model) {
        onChange({ provider: selection.provider, model: selectedModel.id });
      } else {
        onReadyChange(true);
      }
    };

    void load();
    return () => controller.abort();
  }, [url, open, selection.provider, selection.model, onChange, onReadyChange]);

  const currentProvider = AI_PROVIDER_OPTIONS.find(provider => provider.id === selection.provider)
    || AI_PROVIDER_OPTIONS[0];
  const currentModel = states[selection.provider]?.models.find(model => model.id === selection.model);
  const currentLabel = `${currentProvider.shortName} · ${currentModel?.name || selection.model || '讀取中'}`;

  const chooseModel = (provider: string, model: string) => {
    onReadyChange(true);
    onChange({ provider, model });
    setOpen(false);
  };

  return (
    <div className="arborist-model-picker" ref={rootRef}>
      <button
        type="button"
        className="arborist-model-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        title={`目前模型：${currentLabel}`}
        onClick={() => setOpen(value => !value)}
        disabled={disabled}
      >
        <Cpu size={12} aria-hidden="true" />
        <span>{currentLabel}</span>
        <ChevronDown size={11} className={open ? 'is-open' : ''} aria-hidden="true" />
      </button>

      {open && (
        <div className="arborist-model-menu" role="listbox" aria-label="快速切換 AI 模型">
          {AI_PROVIDER_OPTIONS.map(provider => {
            const state = states[provider.id];
            return (
              <section className="arborist-model-provider" role="group" aria-label={provider.name} key={provider.id}>
                <div className="arborist-model-provider-name">
                  <span>{provider.name}</span>
                  <span>{state?.status === 'connected' ? `${state.models.length} 個模型` : '未就緒'}</span>
                </div>
                {state?.status === 'connected' && state.models.length > 0 ? state.models.map(model => {
                  const selected = selection.provider === provider.id && selection.model === model.id;
                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={selected ? 'active' : ''}
                      key={`${provider.id}:${model.id}`}
                      onClick={() => chooseModel(provider.id, model.id)}
                    >
                      <span>{model.name}</span>
                      {selected && <Check size={12} aria-hidden="true" />}
                    </button>
                  );
                }) : (
                  <div className="arborist-model-unavailable">{unavailableLabel(state)}</div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
