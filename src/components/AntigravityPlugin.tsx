import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileText,
  GitBranch,
  HelpCircle,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Sparkles,
  Terminal,
  Trash2,
} from 'lucide-react';
import { marked } from 'marked';

export interface AntigravityPluginProps {
  currentNotePath: string;
  currentNoteContent: string;
  onApplyContent?: (content: string) => void;
  onAppendContent?: (content: string) => void;
}

type CliStatus = 'connected' | 'disconnected' | 'testing';

interface Notice {
  kind: 'success' | 'error' | 'info';
  text: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'arborist';
  content: string;
  timestamp: string;
}

const DEFAULT_CLI_URL = 'http://localhost:18080';

export const AntigravityPlugin: React.FC<AntigravityPluginProps> = ({
  currentNotePath,
  currentNoteContent,
  onApplyContent,
  onAppendContent,
}) => {
  const [cliUrl, setCliUrl] = useState(() => localStorage.getItem('antigravity_cli_url') || DEFAULT_CLI_URL);
  const [status, setStatus] = useState<CliStatus>('disconnected');
  const [workspace, setWorkspace] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  // Chat message stream
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('wikitree_arborist_chat');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const noticeTimer = useRef<number | null>(null);

  // Save messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem('wikitree_arborist_chat', JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      // Offline
    }
    setStatus('disconnected');
    setWorkspace('');
    return false;
  };

  useEffect(() => {
    testConnection();
  }, []);

  // Auto-reconnect while offline
  useEffect(() => {
    if (status === 'connected') return;
    const timer = window.setInterval(() => {
      if (!loading) testConnection(cliUrl);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [status, cliUrl, loading]);

  const flash = (n: Notice, ms = 4000) => {
    setNotice(n);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), ms);
  };

  // In-Sidebar Chat generation (No external terminal required)
  const handleSendMessage = async (customPrompt?: string) => {
    const text = (customPrompt || inputMessage).trim();
    if (!text || loading) return;

    const connected = status === 'connected' || (await testConnection(cliUrl));
    if (!connected) {
      flash({
        kind: 'error',
        text: 'AI 服務尚未連線。請確認後端正在運行（npm run dev）。',
      });
      return;
    }

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${cliUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            path: currentNotePath,
            content: currentNoteContent,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || '（知識架構師未回傳內容）';

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'arborist',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      flash({ kind: 'error', text: `生成失敗：${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Quick Preset Skills
  const quickSkills = [
    {
      id: 'branch',
      icon: GitBranch,
      label: '衍生子節點',
      desc: '探索可延伸的 2~3 個下層概念',
      prompt: `請分析此知識葉片，推導出 2~3 個最值得延伸生長的概念子節點（Child Leaves），為每個子節點提供：1. 概念命名 2. 核心命題 3. 與本節點的邏輯關聯。`,
    },
    {
      id: 'cornell',
      icon: FileText,
      label: 'Cornell 提煉',
      desc: '重構為高密度康奈爾筆記',
      prompt: `請將此筆記內容按照 WikiTree 標準 Cornell 格式重構：包含 Frontmatter 元資料、核心定義、推導演繹清單、2 題主動提取反思題，以及一段總結精華。`,
    },
    {
      id: 'distill',
      icon: Lightbulb,
      label: '萃取本質洞察',
      desc: '提煉一句話命題與三錨點',
      prompt: `請以極致精煉的語言，提煉此篇筆記的一句話底層邏輯洞察，並列出支撐此洞察的 3 個關鍵錨點（Key Anchors）。`,
    },
    {
      id: 'recall',
      icon: HelpCircle,
      label: '主動自我測驗',
      desc: '產生檢驗理解的思維考題',
      prompt: `請根據這篇筆記設計 3 道具有啟發性、檢驗深層理解而非死背的思考問題，並在下方附上簡潔精準的思考指引。`,
    },
  ];

  // Optional: Open terminal if user really needs external CLI
  const handleOpenExternalTerminal = async () => {
    try {
      const response = await fetch(`${cliUrl}/api/open-terminal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialPrompt: currentNotePath ? `關於筆記「${currentNotePath}」` : '' }),
      });
      if (response.ok) {
        flash({ kind: 'success', text: '已開啟外部 Antigravity CLI 視窗。' });
      }
    } catch (e: any) {
      flash({ kind: 'error', text: `開啟失敗: ${e.message}` });
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const applyToNote = (id: string, text: string) => {
    if (onApplyContent) {
      onApplyContent(text);
      setAppliedId(id);
      setTimeout(() => setAppliedId(null), 2500);
      flash({ kind: 'success', text: '已覆蓋至當前編輯器！記得存檔。' });
    }
  };

  const appendToNote = (id: string, text: string) => {
    if (onAppendContent) {
      onAppendContent(text);
      setAppliedId(id);
      setTimeout(() => setAppliedId(null), 2500);
      flash({ kind: 'success', text: '已附加到筆記末尾！' });
    }
  };

  const statusColor =
    status === 'connected' ? '#22c55e' : status === 'testing' ? '#eab308' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontSize: '13px', minHeight: 0, backgroundColor: 'var(--bg-sidebar)' }}>
      {/* Status Header */}
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
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: statusColor,
              flexShrink: 0,
              boxShadow: status === 'connected' ? '0 0 8px rgba(34, 197, 94, 0.4)' : 'none',
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>WIKITREE ARBORIST</span>
            </div>
            <div
              style={{ color: 'var(--text-secondary)', fontSize: '10.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}
              title={currentNotePath || '尚未開啟筆記'}
            >
              {currentNotePath ? `葉片: ${currentNotePath}` : '未開啟葉片（全局對話）'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button
            className="theme-toggle-btn"
            title="清空對話"
            onClick={() => setMessages([])}
            style={{ padding: '4px' }}
          >
            <Trash2 size={13} />
          </button>
          <button
            className="theme-toggle-btn"
            title="以外部終端機 CLI 開啟"
            onClick={handleOpenExternalTerminal}
            style={{ padding: '4px' }}
          >
            <Terminal size={13} />
          </button>
          <button
            className="theme-toggle-btn"
            title="設定端點"
            onClick={() => setShowSettings((v) => !v)}
            style={{ padding: '4px' }}
          >
            <Settings size={13} />
          </button>
          <button
            className="theme-toggle-btn"
            title="重新連線"
            onClick={() => testConnection()}
            style={{ padding: '4px' }}
          >
            <RefreshCw size={13} className={status === 'testing' ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Settings Modal Bar */}
      {showSettings && (
        <div
          style={{
            padding: '10px 12px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>CLI SERVICE URL</label>
          <input
            type="text"
            className="form-input"
            value={cliUrl}
            onChange={(e) => setCliUrl(e.target.value)}
            style={{ fontSize: '12px', padding: '5px 8px' }}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-primary" onClick={() => { testConnection(cliUrl); setShowSettings(false); }} style={{ flex: 1, padding: '4px', fontSize: '11px' }}>
              連線
            </button>
            <button className="btn" onClick={() => setShowSettings(false)} style={{ padding: '4px 8px', fontSize: '11px' }}>
              關閉
            </button>
          </div>
        </div>
      )}

      {/* Notice Toast */}
      {notice && (
        <div
          style={{
            padding: '8px 12px',
            fontSize: '11.5px',
            lineHeight: 1.4,
            backgroundColor: notice.kind === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
            borderBottom: '1px solid var(--border-color)',
            color: notice.kind === 'error' ? '#ef4444' : '#22c55e',
          }}
        >
          {notice.text}
        </div>
      )}

      {/* Chat Messages / Skill Deck Area */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Welcome Capsule */}
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '12px',
                backgroundColor: 'var(--bg-secondary)',
                lineHeight: 1.5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>
                <Sparkles size={15} style={{ color: '#22c55e' }} />
                <span>WikiTree 知識生態大腦已就位</span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '11.5px' }}>
                知識如森林般生長，而非資料夾。點擊下方技能卡或直接在下方輸入提問，架構師會為你自動分析、衍生或重構筆記。
              </p>
            </div>

            {/* Quick Skills Deck */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                ARBORIST SKILLS (快速技能)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {quickSkills.map((skill) => {
                  const Icon = skill.icon;
                  const disabled = !currentNotePath && skill.id !== 'distill';
                  return (
                    <button
                      key={skill.id}
                      onClick={() => handleSendMessage(skill.prompt)}
                      disabled={loading || disabled}
                      style={{
                        textAlign: 'left',
                        border: '1px solid var(--border-color)',
                        borderRadius: '5px',
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '9px 10px',
                        cursor: disabled || loading ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={15} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '12px' }}>{skill.label}</div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {skill.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const parsedHtml = !isUser ? (marked.parse(msg.content) as string) : '';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  gap: '4px',
                }}
              >
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', padding: '0 4px' }}>
                  {isUser ? 'YOU' : 'ARBORIST'} • {msg.timestamp}
                </div>
                <div
                  style={{
                    maxWidth: '92%',
                    borderRadius: isUser ? '8px 8px 1px 8px' : '8px 8px 8px 1px',
                    padding: isUser ? '8px 12px' : '10px 12px',
                    backgroundColor: isUser ? 'var(--primary-color, #2563eb)' : 'var(--bg-secondary)',
                    color: isUser ? '#ffffff' : 'var(--text-primary)',
                    border: isUser ? 'none' : '1px solid var(--border-color)',
                    fontSize: '12.5px',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}
                >
                  {isUser ? (
                    msg.content
                  ) : (
                    <div
                      className="markdown-body"
                      style={{ fontSize: '12px', backgroundColor: 'transparent' }}
                      dangerouslySetInnerHTML={{ __html: parsedHtml }}
                    />
                  )}
                </div>

                {/* Actions for Agent messages */}
                {!isUser && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '3px' }}>
                    {onApplyContent && (
                      <button
                        className="btn"
                        title="覆蓋至目前編輯器"
                        onClick={() => applyToNote(msg.id, msg.content)}
                        style={{ padding: '3px 7px', fontSize: '10.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {appliedId === msg.id ? <Check size={12} color="#22c55e" /> : <Download size={12} />}
                        <span>套用</span>
                      </button>
                    )}
                    {onAppendContent && (
                      <button
                        className="btn"
                        title="附加至目前筆記末尾"
                        onClick={() => appendToNote(msg.id, msg.content)}
                        style={{ padding: '3px 7px', fontSize: '10.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={12} />
                        <span>附加</span>
                      </button>
                    )}
                    <button
                      className="btn"
                      title="複製內容"
                      onClick={() => copyToClipboard(msg.id, msg.content)}
                      style={{ padding: '3px 7px', fontSize: '10.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {copiedId === msg.id ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                      <span>{copiedId === msg.id ? '已複製' : '複製'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '11.5px', padding: '6px' }}>
            <Loader2 size={14} className="spin" />
            <span>知識架構師正在思考推導並組織節點...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <div
        style={{
          padding: '10px 12px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input
            type="text"
            className="form-input"
            placeholder={currentNotePath ? `對「${currentNotePath}」提問或要求生成...` : '輸入任務或提問...'}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={loading}
            style={{ flex: 1, padding: '7px 10px', height: '34px', fontSize: '12px' }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || loading}
            title="送出 (Enter)"
            style={{ padding: '7px 12px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {loading ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
          <span>按 Enter 送出 • 免開終端機</span>
          {messages.length > 0 && <span>可直接點「套用」或「附加」寫入筆記</span>}
        </div>
      </div>
    </div>
  );
};
