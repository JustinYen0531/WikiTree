import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Languages,
  Lightbulb,
  ListChecks,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  Settings,
  Sparkles,
} from 'lucide-react';

interface AntigravityPluginProps {
  currentNotePath: string;
  currentNoteContent: string;
}

type CliStatus = 'connected' | 'disconnected' | 'testing';

interface Notice {
  kind: 'success' | 'error' | 'info';
  text: string;
}

const DEFAULT_CLI_URL = 'http://localhost:18080';

export const AntigravityPlugin: React.FC<AntigravityPluginProps> = ({
  currentNotePath,
  currentNoteContent,
}) => {
  const [cliUrl, setCliUrl] = useState(() => localStorage.getItem('antigravity_cli_url') || DEFAULT_CLI_URL);
  const [status, setStatus] = useState<CliStatus>('disconnected');
  const [workspace, setWorkspace] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [launching, setLaunching] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [messageInput, setMessageInput] = useState('');

  const noticeTimer = useRef<number | null>(null);

  const testConnection = async (urlToCheck = cliUrl): Promise<boolean> => {
    setStatus('testing');
    try {
      const controller = new AbortController();
      const id = window.setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${urlToCheck}/api/status`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      window.clearTimeout(id);
      if (response.ok) {
        const data = await response.json();
        setStatus('connected');
        setWorkspace(data.workspace || '');
        localStorage.setItem('antigravity_cli_url', urlToCheck);
        return true;
      }
    } catch {
      // Offline; the status badge says enough.
    }
    setStatus('disconnected');
    setWorkspace('');
    return false;
  };

  useEffect(() => {
    testConnection();
  }, []);

  // Auto-reconnect while offline so the panel hooks up by itself once the
  // daemon (started by `npm run dev`) comes online.
  useEffect(() => {
    if (status === 'connected') return;
    const timer = window.setInterval(() => {
      if (launching === null) testConnection(cliUrl);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [status, cliUrl, launching]);

  const flash = (n: Notice, ms = 6000) => {
    setNotice(n);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), ms);
  };

  // Opens a real terminal window with agy running. Optionally seeds it with a
  // first question so a single click gets the user straight into a useful chat.
  const openTerminal = async (opts: { id: string; initialPrompt?: string }) => {
    if (launching) return;
    setLaunching(opts.id);

    const connected = status === 'connected' || (await testConnection(cliUrl));
    if (!connected) {
      flash({
        kind: 'error',
        text: 'AI 服務尚未啟動。請在專案資料夾執行 npm run dev，再回到這裡（會自動連線）。',
      }, 9000);
      setLaunching(null);
      return;
    }

    try {
      const response = await fetch(`${cliUrl}/api/open-terminal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialPrompt: opts.initialPrompt || '' }),
      });
      if (response.ok) {
        flash({ kind: 'success', text: '已開啟 AI 對話視窗！請看新跳出來的終端機視窗，直接在裡面打字就能跟 AI 聊。' }, 9000);
      } else {
        const data = await response.json().catch(() => ({}));
        flash({ kind: 'error', text: data.error || '開啟終端機失敗，請再試一次。' });
      }
    } catch (e: any) {
      setStatus('disconnected');
      flash({ kind: 'error', text: `連線失敗：${e.message}` });
    } finally {
      setLaunching(null);
    }
  };

  // Free-text message: opens agy in a terminal seeded with whatever the user typed.
  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    const text = messageInput.trim();
    if (!text || busy) return;
    const prompt = currentNotePath
      ? `關於筆記「${currentNotePath}」：${text}`
      : text;
    openTerminal({ id: 'message', initialPrompt: prompt });
    setMessageInput('');
  };

  // Note-aware quick starts. Each opens agy with a ready-made first question.
  const notePresets = [
    { id: 'outline', icon: ListChecks, label: '整理重點', prompt: (p: string) => `請閱讀筆記檔案「${p}」，並把內容整理成清楚的條列式重點，用繁體中文。` },
    { id: 'summary', icon: FileText, label: '一段話摘要', prompt: (p: string) => `請閱讀筆記檔案「${p}」，用三句話以繁體中文摘要它的核心內容。` },
    { id: 'translate', icon: Languages, label: '翻成英文', prompt: (p: string) => `請閱讀筆記檔案「${p}」，並把內容翻譯成自然流暢的英文。` },
    { id: 'quiz', icon: Lightbulb, label: '出練習題', prompt: (p: string) => `請閱讀筆記檔案「${p}」，根據內容出三題練習題並附上參考答案，用繁體中文。` },
  ];

  const statusColor =
    status === 'connected' ? 'var(--success)' : status === 'testing' ? 'var(--warning)' : 'var(--danger)';
  const statusLabel =
    status === 'connected' ? 'AI 已連線' : status === 'testing' ? '連線中…' : 'AI 未連線';
  const busy = launching !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontSize: '13px', minHeight: 0 }}>
      {/* Status header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor, flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700 }}>{statusLabel}</div>
            <div
              style={{ color: 'var(--text-secondary)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}
              title={workspace || cliUrl}
            >
              {status === 'connected' ? workspace || cliUrl : '請先執行 npm run dev'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="theme-toggle-btn" title="設定" onClick={() => setShowSettings((v) => !v)} style={{ padding: '3px' }}>
            <Settings size={14} />
          </button>
          <button className="theme-toggle-btn" title="重新連線" onClick={() => testConnection()} style={{ padding: '3px' }}>
            <RefreshCw size={14} className={status === 'testing' ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div
          style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-sidebar)', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}
        >
          <div className="form-group">
            <label className="form-label">AI 服務位置</label>
            <input
              type="text"
              className="form-input"
              value={cliUrl}
              onChange={(event) => setCliUrl(event.target.value)}
              placeholder={DEFAULT_CLI_URL}
              style={{ fontSize: '12px', padding: '6px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <button className="btn btn-primary" onClick={() => { testConnection(cliUrl); setShowSettings(false); }} style={{ flex: 1, padding: '4px' }}>
              連線
            </button>
            <button className="btn" onClick={() => setShowSettings(false)} style={{ padding: '4px' }}>
              關閉
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.5 }}>
          <Sparkles size={15} style={{ flexShrink: 0, marginTop: '1px', color: 'var(--success)' }} />
          <span>點下面的按鈕，就會自動跳出一個 AI 對話視窗（終端機），你直接在那個視窗裡用中文打字，就能跟 AI 聊天。</span>
        </div>

        {/* Main launch button */}
        <button
          className="btn btn-primary"
          onClick={() => openTerminal({ id: 'open' })}
          disabled={busy}
          style={{ padding: '14px', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '10px' }}
        >
          {launching === 'open' ? <Loader2 size={18} className="spin" /> : <MessageSquare size={18} />}
          開啟 AI 對話視窗
        </button>

        {/* Type a message -> opens agy in a terminal with that message */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
            或，先打好訊息再開（會帶進對話視窗）
          </label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="text"
              className="form-input"
              placeholder="例如：幫我解釋什麼是遞迴…"
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
              style={{ flex: 1, padding: '8px 12px', height: '36px', fontSize: '13px' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!messageInput.trim() || busy}
              title="送出並開啟對話視窗"
              style={{ padding: '8px 12px', height: '36px' }}
            >
              {launching === 'message' ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
            </button>
          </div>
        </form>

        {/* Note-aware quick starts */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
            針對目前筆記，一鍵開始
          </div>
          {!currentNotePath && (
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              （先開啟一則筆記，下面的按鈕就會幫你把問題準備好）
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {notePresets.map((preset) => {
              const Icon = preset.icon;
              const disabled = !currentNotePath || busy;
              return (
                <button
                  key={preset.id}
                  onClick={() => openTerminal({ id: preset.id, initialPrompt: preset.prompt(currentNotePath) })}
                  disabled={disabled}
                  title={currentNotePath ? `針對「${currentNotePath}」${preset.label}` : '請先開啟一則筆記'}
                  style={{
                    textAlign: 'left',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '10px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: !currentNotePath ? 0.55 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                  }}
                >
                  {launching === preset.id ? <Loader2 size={15} className="spin" /> : <Icon size={15} />}
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notice */}
        {notice && (
          <div
            style={{
              border: `1px solid ${notice.kind === 'error' ? 'var(--danger)' : 'var(--success)'}`,
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12px',
              lineHeight: 1.5,
              color: notice.kind === 'error' ? 'var(--danger)' : 'var(--text-primary)',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            {notice.text}
          </div>
        )}

        {/* CLI Agent Setup Guide */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          <button
            onClick={() => setShowGuide(v => !v)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <span>如何自己裝一個 CLI Agent？</span>
            {showGuide ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {showGuide && (
            <div style={{ marginTop: '10px', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              <p style={{ margin: '0 0 6px 0', color: 'var(--text-primary)', fontWeight: 600 }}>
                用 Claude Code CLI 在終端機直接編輯筆記
              </p>
              <ol style={{ margin: '0', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>
                  <strong>安裝 Node.js</strong>（如果還沒裝）<br />
                  前往 <span style={{ fontFamily: 'monospace', backgroundColor: 'var(--bg-secondary)', padding: '1px 4px', borderRadius: '3px' }}>nodejs.org</span> 下載安裝
                </li>
                <li>
                  <strong>安裝 Claude Code CLI</strong><br />
                  打開終端機（cmd / PowerShell），輸入：<br />
                  <code style={{ display: 'block', marginTop: '4px', backgroundColor: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--accent)' }}>
                    npm install -g @anthropic-ai/claude-code
                  </code>
                </li>
                <li>
                  <strong>取得 Claude API Key</strong><br />
                  前往 <span style={{ fontFamily: 'monospace', backgroundColor: 'var(--bg-secondary)', padding: '1px 4px', borderRadius: '3px' }}>console.anthropic.com</span> 建立帳號，在 API Keys 頁面產生一組 Key
                </li>
                <li>
                  <strong>設定 API Key</strong><br />
                  在終端機輸入：<br />
                  <code style={{ display: 'block', marginTop: '4px', backgroundColor: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--accent)' }}>
                    export ANTHROPIC_API_KEY=sk-ant-你的key
                  </code>
                  （Windows PowerShell 用 <span style={{ fontFamily: 'monospace' }}>$env:ANTHROPIC_API_KEY="sk-ant-你的key"</span>）
                </li>
                <li>
                  <strong>進入你的筆記資料夾</strong><br />
                  <code style={{ display: 'block', marginTop: '4px', backgroundColor: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--accent)' }}>
                    cd 你的筆記資料夾路徑
                  </code>
                </li>
                <li>
                  <strong>啟動 Claude，開始用中文下指令</strong><br />
                  <code style={{ display: 'block', marginTop: '4px', backgroundColor: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--accent)' }}>
                    claude
                  </code>
                  例如輸入：<em>「幫我修改 筆記.md 的第二段，讓它更簡短」</em><br />
                  NCCU Hub 會在 3 秒內自動同步顯示修改後的內容。
                </li>
              </ol>
              <p style={{ margin: '10px 0 0 0', padding: '6px 8px', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', fontSize: '11px' }}>
                💡 Claude Code 是 Anthropic 官方出品的 CLI，比 agy 更強大，支援多檔案編輯、讀取整個專案結構。
              </p>
            </div>
          )}
        </div>

        {/* How-to */}
        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>小提醒</div>
          • 第一次用 agy 會請你用 Google 帳號登入一次。<br />
          • 在對話視窗裡直接打中文問問題，按 Enter 送出。<br />
          • 想結束時，在那個視窗按 Ctrl + C，或直接關掉視窗。
        </div>
      </div>

      {currentNotePath && (
        <div
          style={{ padding: '8px 12px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}
          title={currentNoteContent ? currentNotePath : undefined}
        >
          目前筆記：{currentNotePath}
        </div>
      )}
    </div>
  );
};
