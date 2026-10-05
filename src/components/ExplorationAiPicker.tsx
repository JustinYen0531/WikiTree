import { useEffect, useState } from 'react';
import type { AiSelection } from '../utils/aiProviderOptions';

interface ExplorationAiState {
  status: 'connected' | 'disconnected' | 'error';
  message: string;
  models: Array<{ id: string; name: string; isDefault?: boolean }>;
}

export function ExplorationAiPicker({ url, selection, onChange, onReadyChange, disabled }: {
  url: string; selection: AiSelection; onChange: (value: AiSelection) => void;
  onReadyChange: (ready: boolean) => void; disabled: boolean;
}) {
  const [state, setState] = useState<ExplorationAiState | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    onReadyChange(false);
    void fetch(`${url}/api/exploration/ai`, { headers: { 'X-WikiTree-AI': '1' }, signal: controller.signal })
      .then(async response => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || '無法讀取 OpenAI API 狀態。');
        return payload as ExplorationAiState;
      })
      .then(next => {
        if (cancelled) return;
        setState(next);
        if (next.status !== 'connected' || !next.models.length) return;
        const model = next.models.find(item => item.id === selection.model)
          || next.models.find(item => item.isDefault)
          || next.models[0];
        if (model.id !== selection.model) onChange({ provider: 'openai', model: model.id });
        else onReadyChange(true);
      })
      .catch(failure => {
        if (!cancelled) setError(failure instanceof Error ? failure.message : '無法連線至本機服務。');
      });
    return () => { cancelled = true; controller.abort(); };
  }, [url, selection.model, revision, onChange, onReadyChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', marginTop: '2px', borderTop: '1px solid var(--border-color)' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
        OpenAI Platform 模型
        <select className="form-input" value={selection.model} disabled={disabled || state?.status !== 'connected'}
          onChange={event => { onReadyChange(false); onChange({ provider: 'openai', model: event.target.value }); }} style={{ fontSize: '14px', width: '100%' }}>
          {!state?.models.length && <option value="">設定 API key 後載入模型</option>}
          {state?.models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
        </select>
      </label>
      <div role="status" style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {error || state?.message || '確認 OpenAI API 設定中…'}
      </div>
      <button type="button" className="btn" disabled={disabled} onClick={() => { setError(''); setRevision(value => value + 1); }}>重新確認 API key</button>
    </div>
  );
}
