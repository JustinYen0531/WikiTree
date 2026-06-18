import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Languages,
  Lightbulb,
  ListChecks,
  Loader2,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface AntigravityPluginProps {
  currentNotePath: string;
  currentNoteContent: string;
  onApplyContent?: (content: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const API_KEY_STORAGE = 'nccu_hub_groq_key';
const MODEL = 'llama-3.1-8b-instant';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const AntigravityPlugin: React.FC<AntigravityPluginProps> = ({
  currentNotePath,
  currentNoteContent,
  onApplyContent,
}) => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');
  const [showGuide, setShowGuide] = useState(false);

  // Sync key if user saves it in profile popover while AI panel is open
  useEffect(() => {
    const onStorage = () => setApiKey(localStorage.getItem(API_KEY_STORAGE) || '');
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const hasKey = apiKey.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearConversation = () => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setStreaming(false);
  };

  const buildSystemPrompt = () => {
    const base =
      '你是 NCCU Hub 的 AI 學習助理，幫助政大學生整理筆記、解釋概念、翻譯內容。請用繁體中文回答，回答要簡潔清楚。';
    if (!currentNotePath || !currentNoteContent) return base;
    return `${base}\n\n使用者目前開啟的筆記是「${currentNotePath}」，內容如下：\n\n---\n${currentNoteContent.slice(0, 8000)}\n---`;
  };

  const sendMessage = async (userText: string, freshStart = false) => {
    if (!hasKey || streaming || !userText.trim()) return;
    setError(null);

    const baseHistory: Message[] = freshStart ? [] : messages;
    const userMsg: Message = { role: 'user', content: userText };
    const historyForApi = [...baseHistory, userMsg];

    setMessages([...historyForApi, { role: 'assistant', content: '' }]);
    setStreaming(true);

    abortRef.current = new AbortController();

    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model: MODEL,
          stream: true,
          max_tokens: 2048,
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...historyForApi.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let modelText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const part = parsed?.choices?.[0]?.delta?.content;
            if (part) {
              modelText += part;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: modelText };
                return updated;
              });
            }
          } catch { /* skip malformed SSE lines */ }
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      setError(e.message || '發生未知錯誤');
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.content) return prev.slice(0, -1);
        return prev;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    sendMessage(text);
  };

  const notePresets = [
    { id: 'outline', icon: ListChecks, label: '整理重點', prompt: '請把這份筆記整理成清楚的條列式重點。' },
    { id: 'summary', icon: FileText, label: '一段話摘要', prompt: '請用三句話摘要這份筆記的核心內容。' },
    { id: 'translate', icon: Languages, label: '翻成英文', prompt: '請把這份筆記的內容翻譯成自然流暢的英文。' },
    { id: 'quiz', icon: Lightbulb, label: '出練習題', prompt: '請根據這份筆記內容出三題練習題並附上參考答案。' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontSize: '13px', minHeight: 0 }}>
      {/* Header */}
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
            backgroundColor: hasKey ? 'var(--success)' : 'var(--danger)',
          }} />
          <div style={{ fontWeight: 700 }}>{hasKey ? 'Groq 已就緒' : '尚未設定 API Key'}</div>
        </div>
        {messages.length > 0 && (
          <button className="theme-toggle-btn" title="清除對話" onClick={clearConversation} style={{ padding: '3px' }}>
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {!hasKey ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            padding: '28px 20px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}>
            <Sparkles size={32} style={{ color: 'var(--accent)', opacity: 0.75 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', fontSize: '14px' }}>
                設定 Groq API Key
              </div>
              <div style={{ fontSize: '12px', lineHeight: 1.8 }}>
                點左側頭像 → 個人檔案<br />
                找到 <strong>「Groq API Key」</strong> 欄位填入<br />
                <br />
                還沒有 Key？前往 <strong>console.groq.com</strong><br />
                免費申請，每天 14,400 次
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              {messages.length === 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '8px', lineHeight: 1.7 }}>
                  <Sparkles size={18} style={{ color: 'var(--accent)', display: 'block', margin: '0 auto 8px' }} />
                  {currentNotePath
                    ? <>目前筆記：<strong>{currentNotePath}</strong><br />點下方按鈕或輸入問題！</>
                    : <>先開啟一則筆記，或直接輸入問題。</>
                  }
                </div>
              )}

              {/* Quick presets */}
              {messages.length === 0 && currentNotePath && currentNoteContent && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                  {notePresets.map((preset) => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => sendMessage(preset.prompt, true)}
                        disabled={streaming}
                        style={{
                          textAlign: 'left',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-secondary)',
                          padding: '8px 10px',
                          cursor: streaming ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          opacity: streaming ? 0.55 : 1,
                        }}
                      >
                        <Icon size={13} />
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Conversation */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    gap: '4px',
                  }}
                >
                  <div style={{
                    maxWidth: '88%',
                    padding: '8px 12px',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    fontSize: '12.5px',
                    lineHeight: 1.65,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                  }}>
                    {msg.content
                      ? msg.content
                      : (streaming && i === messages.length - 1
                          ? <Loader2 size={14} className="spin" />
                          : null)
                    }
                  </div>
                  {msg.role === 'assistant' && msg.content && onApplyContent && currentNotePath && (
                    <button
                      onClick={() => onApplyContent(msg.content)}
                      title="將此內容覆蓋寫入目前筆記"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'none',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                      }}
                    >
                      <ClipboardCheck size={11} />
                      套用到筆記
                    </button>
                  )}
                </div>
              ))}

              {error && (
                <div style={{
                  border: '1px solid var(--danger)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: 'var(--danger)',
                  backgroundColor: 'var(--bg-secondary)',
                }}>
                  錯誤：{error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              style={{
                padding: '10px 12px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '6px',
                alignItems: 'flex-end',
                flexShrink: 0,
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <textarea
                className="form-input"
                placeholder="輸入問題，Enter 送出，Shift+Enter 換行…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
                rows={2}
                style={{ flex: 1, resize: 'none', fontSize: '12.5px', padding: '8px 10px', lineHeight: 1.5 }}
                disabled={streaming}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!input.trim() || streaming}
                style={{ padding: '8px 12px', height: '52px', flexShrink: 0 }}
              >
                {streaming ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
              </button>
            </form>
          </>
        )}
      </div>

      {/* CLI Guide (collapsible) */}
      <div style={{ borderTop: '1px solid var(--border-color)', padding: '10px 14px', flexShrink: 0 }}>
        <button
          onClick={() => setShowGuide((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            color: 'var(--text-secondary)',
            fontSize: '11.5px',
            fontWeight: 600,
          }}
        >
          <span>想用 CLI Agent 直接修改筆記？</span>
          {showGuide ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
        {showGuide && (
          <ol style={{ margin: '10px 0 0 0', paddingLeft: '16px', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>安裝 Node.js（nodejs.org）</li>
            <li>
              <code style={{ backgroundColor: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: '3px', fontSize: '11px', color: 'var(--accent)' }}>
                npm install -g @anthropic-ai/claude-code
              </code>
            </li>
            <li>取得 Anthropic API Key（console.anthropic.com）</li>
            <li>
              <code style={{ backgroundColor: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: '3px', fontSize: '11px', color: 'var(--accent)' }}>
                cd 筆記資料夾 && claude
              </code>
            </li>
            <li>用中文下指令，NCCU Hub 3 秒內自動同步</li>
          </ol>
        )}
      </div>

      {currentNotePath && (
        <div style={{
          padding: '6px 12px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          fontSize: '11px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }} title={currentNotePath}>
          目前筆記：{currentNotePath}
        </div>
      )}
    </div>
  );
};
