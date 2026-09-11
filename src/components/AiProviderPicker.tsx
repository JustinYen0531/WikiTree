import { useEffect, useState } from 'react';

export interface AiSelection { provider: string; model: string }
interface ProviderState {
  status: 'connected' | 'disconnected' | 'pending' | 'unsupported' | 'error';
  message: string;
  authUrl?: string;
  models: { id: string; name: string; isDefault?: boolean }[];
}
const providers = [
  ['agy', 'Antigravity（原有服務）'], ['google', 'Google · Gemini'],
  ['openai', 'OpenAI · Codex'], ['claude', 'Anthropic · Claude'],
];
const headers = { 'X-WikiTree-AI': '1' };

export function AiProviderPicker({ url, selection, onChange, onReadyChange, disabled }: {
  url: string; selection: AiSelection; onChange: (value: AiSelection) => void;
  onReadyChange: (ready: boolean) => void; disabled: boolean;
}) {
  const [state, setState] = useState<ProviderState | null>(null);
  const [working, setWorking] = useState(false);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    setState(null);
    setError('');
    onReadyChange(false);
    const load = async () => {
      try {
        const response = await fetch(`${url}/api/ai/state?provider=${encodeURIComponent(selection.provider)}`, { headers, signal: controller.signal });
        if (!response.ok) throw new Error('請重新啟動本機服務，啟用廠商選擇與登入。');
        const next: ProviderState = await response.json();
        if (cancelled) return;
        setState(next);
        if (next.status === 'connected' && next.models.length) {
          const model = next.models.find(item => item.id === selection.model) || next.models.find(item => item.isDefault) || next.models[0];
          if (model.id !== selection.model) onChange({ provider: selection.provider, model: model.id });
          else onReadyChange(true);
        }
        if (next.status === 'pending') timer = setTimeout(load, 2000);
      } catch (failure) {
        if (!cancelled) setError(failure instanceof Error ? failure.message : '無法連線，請確認本機服務。');
      }
    };
    void load();
    return () => { cancelled = true; controller.abort(); clearTimeout(timer); };
  }, [url, selection.provider, selection.model, revision, onChange, onReadyChange]);

  const action = async (name: 'login' | 'disconnect') => {
    setWorking(true);
    setError('');
    onReadyChange(false);
    try {
      const response = await fetch(`${url}/api/ai/${name}?provider=${encodeURIComponent(selection.provider)}`, { method: 'POST', headers });
      const next = await response.json();
      if (!response.ok) throw new Error(next.error || '連線未完成，請重試。');
      setState(next);
      setRevision(value => value + 1);
    } catch (failure) { setError(failure instanceof Error ? failure.message : '連線未完成。'); }
    finally { setWorking(false); }
  };

  let authUrl: string | undefined;
  try {
    const target = new URL(state?.authUrl || '');
    if (target.protocol === 'https:' && ['auth.openai.com', 'auth0.openai.com', 'chatgpt.com'].includes(target.hostname)) authUrl = target.href;
  } catch { /* No login URL while disconnected. */ }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
        AI 廠商
        <select className="form-input" value={selection.provider} disabled={disabled || working}
          onChange={event => { onReadyChange(false); onChange({ provider: event.target.value, model: '' }); }} style={{ fontSize: '14px', width: '100%' }}>
          {providers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
        模型
        <select className="form-input" value={selection.model} disabled={disabled || working || state?.status !== 'connected'}
          onChange={event => { onReadyChange(false); onChange({ ...selection, model: event.target.value }); }} style={{ fontSize: '14px', width: '100%' }}>
          {!state?.models.length && <option value="">{state?.status === 'unsupported' ? '尚未支援' : '連線後載入可用模型'}</option>}
          {state?.models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
        </select>
      </label>
      <div role="status" style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {error || state?.message || '確認連線中…'}
      </div>
      {authUrl && state?.status === 'pending' && <a href={authUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">開啟官方登入頁面</a>}
      {selection.provider !== 'agy' && state?.status !== 'unsupported' && selection.provider !== 'claude' && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {state?.status !== 'pending' && <button type="button" className="btn" disabled={disabled || working} onClick={() => void action('login')}>
            {working ? '連線中…' : state?.status === 'connected' ? '重新登入' : '登入／重新連線'}
          </button>}
          {(state?.status === 'pending' || state?.status === 'connected') && <button type="button" className="btn" disabled={disabled || working} onClick={() => void action('disconnect')}>
            {state.status === 'pending' ? '取消登入' : '中斷連線'}
          </button>}
          <button type="button" className="btn" disabled={disabled || working} onClick={() => setRevision(value => value + 1)}>重新確認</button>
        </div>
      )}
    </div>
  );
}
