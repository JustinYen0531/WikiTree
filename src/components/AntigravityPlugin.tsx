import React, { useEffect, useRef, useState } from 'react';
import {
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Copy,
  Download,
  Eye,
  FileText,
  GitBranch,
  Globe,
  HelpCircle,
  Lightbulb,
  Loader2,
  Monitor,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { renderMarkdownSync } from '../utils/markdownRenderer';
import { preprocessCallouts } from '../utils/callouts';
import DOMPurify from 'dompurify';
import { readChatStream } from '../utils/chatStream';
import { cliWorkspaceHeaders } from '../utils/cliWorkspace';
import { computeLineDiff, PendingDiffInfo } from '../utils/diffUtils';

export interface AntigravityPluginProps {
  workspacePath?: string;
  currentNotePath: string;
  currentNoteContent: string;
  onApplyContent?: (content: string) => void;
  onAppendContent?: (content: string) => void;
  onApplyDiff?: (diffInfo: PendingDiffInfo) => void;
}

type CliStatus = 'connected' | 'disconnected' | 'testing';
type EnvironmentMode = 'app' | 'browser';

interface Notice {
  kind: 'success' | 'error' | 'info';
  text: string;
}

interface ChatMessage {
  delivery?: 'streaming' | 'incomplete';
  id: string;
  role: 'user' | 'arborist';
  content: string;
  timestamp: string;
}

const DEFAULT_CLI_URL = 'http://localhost:18080';

// 智能切分「思考推導過程」與「純正式筆記內容」
function splitThoughtAndNote(rawText: string): { thought: string; note: string } {
  if (!rawText) return { thought: '', note: '' };

  // 1. 顯式標籤檢測
  if (rawText.includes('<!-- WIKITREE_NOTE_START -->')) {
    const parts = rawText.split('<!-- WIKITREE_NOTE_START -->');
    return { thought: parts[0].trim(), note: parts.slice(1).join('<!-- WIKITREE_NOTE_START -->').trim() };
  }

  // 2. 獨立一行的 --- / *** 分隔線檢測
  const hrRegex = /\n\s*(?:---+|\*\*\*+|___+)\s*\n/;
  const hrMatch = rawText.match(hrRegex);
  if (hrMatch && hrMatch.index !== undefined) {
    const thoughtPart = rawText.slice(0, hrMatch.index).trim();
    const notePart = rawText.slice(hrMatch.index + hrMatch[0].length).trim();
    if (notePart.length > 20) {
      return { thought: thoughtPart, note: notePart };
    }
  }

  // 3. 尋找主標題起點 (如 # 標題 或 🌲 WikiTree 節點標題)
  const treeHeaderRegex = /\n(?=(?:#+\s+|🌲\s+|```markdown))/;
  const match = rawText.match(treeHeaderRegex);
  if (match && match.index !== undefined && match.index > 30) {
    return {
      thought: rawText.slice(0, match.index).trim(),
      note: rawText.slice(match.index).trim(),
    };
  }

  // 預設無前言時，全篇即筆記
  return { thought: '', note: rawText };
}

export const AntigravityPlugin: React.FC<AntigravityPluginProps> = ({
  workspacePath,
  currentNotePath,
  currentNoteContent,
  onApplyContent,
  onAppendContent,
  onApplyDiff,
}) => {
  const [mode, setMode] = useState<EnvironmentMode>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('mode') === 'app') return 'app';
      if (urlParams.get('mode') === 'browser') return 'browser';
      if (window.matchMedia('(display-mode: standalone)').matches) return 'app';
      const saved = localStorage.getItem('wikitree_env_mode');
      if (saved === 'app' || saved === 'browser') return saved;
    } catch {}
    return 'app';
  });

  const [cliUrl, setCliUrl] = useState(() => localStorage.getItem('antigravity_cli_url') || DEFAULT_CLI_URL);
  const [status, setStatus] = useState<CliStatus>('disconnected');
  const [workspace, setWorkspace] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  // App 模式狀態
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamStatus, setStreamStatus] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    if (!loading) return;
    const start = Date.now();
    setElapsedSeconds(0);
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [loading]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [expandedPreviewIds, setExpandedPreviewIds] = useState<Record<string, boolean>>({});
  const [activeTabIds, setActiveTabIds] = useState<Record<string, 'note' | 'diff'>>({});

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('wikitree_arborist_chat');
      const history = saved ? JSON.parse(saved) : [];
      return Array.isArray(history) ? history.map((msg: ChatMessage) => msg.delivery === 'streaming' ? { ...msg, delivery: 'incomplete' } : msg) : [];
    } catch {
      return [];
    }
  });

  // Browser 模式狀態
  const [pastedContent, setPastedContent] = useState('');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const noticeTimer = useRef<number | null>(null);

  const switchMode = (nextMode: EnvironmentMode) => {
    setMode(nextMode);
    localStorage.setItem('wikitree_env_mode', nextMode);
    flash({
      kind: 'info',
      text: nextMode === 'app' ? '已切換為【應用程式模式】（直通 AI 知識大腦）' : '已切換為【瀏覽器模式】（專屬複製貼上工作區）',
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem('wikitree_arborist_chat', JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (mode === 'app') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, mode]);

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
    } catch {}
    setStatus('disconnected');
    setWorkspace('');
    return false;
  };

  useEffect(() => {
    testConnection();
  }, []);

  useEffect(() => {
    if (status === 'connected' || mode !== 'app') return;
    const timer = window.setInterval(() => {
      if (!loading) testConnection(cliUrl);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [status, cliUrl, loading, mode]);

  const flash = (n: Notice, ms = 4000) => {
    setNotice(n);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), ms);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const text = (customPrompt || inputMessage).trim();
    if (!text || loading || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;

    const connected = status === 'connected' || (await testConnection(cliUrl));
    if (controller.signal.aborted) { requestRef.current = null; return; }
    if (!connected) {
      requestRef.current = null;
      flash({
        kind: 'error',
        text: '本機 AI 服務尚未連線。如果是純瀏覽器環境，建議切換至「瀏覽器模式」使用複製貼上！',
      });
      return;
    }

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const botId = 'bot-' + crypto.randomUUID();
    setMessages(prev => [...prev, userMsg, {
      id: botId, role: 'arborist', content: '', delivery: 'streaming',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setStreamStatus('請求已送出，等待 AI 回覆…');
    if (!customPrompt) setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${cliUrl}/api/chat`, {
        method: 'POST',
        signal: controller.signal,
        headers: cliWorkspaceHeaders(workspacePath),
        body: JSON.stringify({
          message: text,
          stream: true,
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

      if (!(response.headers.get('content-type') || '').includes('application/x-ndjson')) {
        throw new Error('請重新啟動桌面服務，以啟用即時回覆。');
      }
      await readChatStream(response, event => {
        if (controller.signal.aborted) return;
        if (event.type === 'status') setStreamStatus(event.text);
        if (event.type === 'delta') {
          setStreamStatus('正在產生回覆…');
          setMessages(prev => prev.map(msg => msg.id === botId ? { ...msg, content: msg.content + event.text } : msg));
        }
        if (event.type === 'done') {
          setMessages(prev => prev.map(msg => msg.id === botId ? { ...msg, content: event.text || msg.content || '（AI 未回傳文字）', delivery: undefined } : msg));
        }
      });
    } catch (e: any) {
      const message = controller.signal.aborted ? '回覆已停止，已收到的文字仍保留。' : e.message;
      setMessages(prev => prev.map(msg => msg.id === botId ? { ...msg, delivery: 'incomplete' } : msg));
      setStreamStatus(message);
      if (!controller.signal.aborted) flash({ kind: 'error', text: `生成失敗：${message}` });
    } finally {
      requestRef.current = null;
      setLoading(false);
    }
  };

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

  const copyStructuredPrompt = (skillId: string, skillPrompt: string) => {
    const fullPrompt =
      `【WikiTree 知識生態系統指令】\n` +
      `你是 WikiTree 的「首席知識架構師（Chief Knowledge Arborist）」。請遵循「Knowledge grows like forests, not folders」原則。\n\n` +
      (currentNotePath ? `目前正在閱讀的筆記葉片：「${currentNotePath}」\n` : '') +
      `筆記內容如下：\n"""\n${currentNoteContent || '（空白筆記）'}\n"""\n\n` +
      `任務要求：${skillPrompt}\n\n` +
      `請以繁體中文、極致精煉、高密度的結構回答，先列出推導思考步驟，再以單獨行 '---' 分隔線輸出純淨筆記。`;

    navigator.clipboard.writeText(fullPrompt);
    setCopiedPromptId(skillId);
    setTimeout(() => setCopiedPromptId(null), 2500);
    flash({ kind: 'success', text: '已複製結構化提示詞！請直接貼上至外部 AI。' });
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPastedContent(text);
        flash({ kind: 'success', text: '已從剪貼簿讀取內容！' });
      }
    } catch {
      flash({ kind: 'error', text: '瀏覽器權限限制，請直接在文字框內按 Ctrl+V 貼上。' });
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
      flash({ kind: 'success', text: '🌱 已在編輯器生成待插入綠色區塊，可移動選擇位置！' });
    }
  };

  const applyDiffToNote = (id: string, noteText: string, diff: ReturnType<typeof computeLineDiff>) => {
    if (onApplyDiff) {
      onApplyDiff({
        addedContent: diff.addedLines.join('\n'),
        removedContent: diff.removedLines.join('\n'),
        fullNewContent: noteText,
        addedLinesCount: diff.addedCount,
        removedLinesCount: diff.removedCount,
      });
      setAppliedId(id);
      setTimeout(() => setAppliedId(null), 2500);
      flash({ kind: 'success', text: '🔀 已在編輯器生成對稱 Diff 修整區塊！' });
    } else if (onApplyContent) {
      onApplyContent(noteText);
      setAppliedId(id);
      setTimeout(() => setAppliedId(null), 2500);
      flash({ kind: 'success', text: '🌱 已送至編輯器！' });
    }
  };

  const appendToNote = (id: string, text: string) => {
    if (onAppendContent) {
      onAppendContent(text);
      setAppliedId(id);
      setTimeout(() => setAppliedId(null), 2500);
      flash({ kind: 'success', text: '已將純淨筆記附加至末尾！請記得存檔。' });
    }
  };

  const togglePreview = (msgId: string) => {
    setExpandedPreviewIds((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const statusColor =
    status === 'connected' ? '#22c55e' : status === 'testing' ? '#eab308' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontSize: '13px', minHeight: 0, backgroundColor: 'var(--bg-sidebar)' }}>
      {/* 頂部控制列 */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255,255,255,0.06)',
            padding: '2px',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            onClick={() => switchMode('app')}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: mode === 'app' ? 700 : 500,
              backgroundColor: mode === 'app' ? 'var(--primary-color, #2563eb)' : 'transparent',
              color: mode === 'app' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
            title="應用程式模式：直通本機 AI 大腦，免手動搬磚"
          >
            <Monitor size={12} />
            <span>應用程式</span>
          </button>
          <button
            onClick={() => switchMode('browser')}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: mode === 'browser' ? 700 : 500,
              backgroundColor: mode === 'browser' ? 'var(--primary-color, #2563eb)' : 'transparent',
              color: mode === 'browser' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
            title="瀏覽器模式：專屬複製貼上工作區"
          >
            <Globe size={12} />
            <span>瀏覽器</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {mode === 'app' && (
            <div
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: statusColor,
                boxShadow: status === 'connected' ? '0 0 6px rgba(34, 197, 94, 0.4)' : 'none',
              }}
              title={status === 'connected' ? `已連線: ${workspace || cliUrl}` : '未連線本機服務'}
            />
          )}
          {mode === 'app' && (
            <button
              className="theme-toggle-btn"
              title="清空對話"
              disabled={loading}
              onClick={() => setMessages([])}
              style={{ padding: '3px' }}
            >
              <Trash2 size={12} />
            </button>
          )}
          <button
            className="theme-toggle-btn"
            title="設定"
            onClick={() => setShowSettings((v) => !v)}
            style={{ padding: '3px' }}
          >
            <Settings size={12} />
          </button>
        </div>
      </div>

      {/* 設定面板 */}
      {showSettings && (
        <div
          style={{
            padding: '10px 12px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>環境端點設定</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>當前: {mode.toUpperCase()}</span>
          </div>
          <input
            type="text"
            className="form-input"
            value={cliUrl}
            onChange={(e) => setCliUrl(e.target.value)}
            placeholder={DEFAULT_CLI_URL}
            style={{ fontSize: '11.5px', padding: '4px 8px' }}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn btn-primary"
              onClick={() => { testConnection(cliUrl); setShowSettings(false); }}
              style={{ flex: 1, padding: '4px', fontSize: '11px' }}
            >
              測試連線
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
            padding: '7px 12px',
            fontSize: '11px',
            lineHeight: 1.4,
            backgroundColor: notice.kind === 'error' ? 'rgba(239, 68, 68, 0.15)' : notice.kind === 'info' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.15)',
            borderBottom: '1px solid var(--border-color)',
            color: notice.kind === 'error' ? '#ef4444' : notice.kind === 'info' ? '#60a5fa' : '#22c55e',
          }}
        >
          {notice.text}
        </div>
      )}

      {/* 視圖 A：應用程式模式 */}
      {mode === 'app' ? (
        <>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '12px',
                    backgroundColor: 'var(--bg-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '6px', fontSize: '12.5px' }}>
                    <Sparkles size={14} style={{ color: '#22c55e' }} />
                    <span>WikiTree 知識生態大腦（雙氣泡架構）</span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '11.5px' }}>
                    AI 會自動將「思維推導過程」與「純正式筆記」分開呈現，並提供 20% 內容預覽，確認無誤後一鍵精準寫入編輯器。
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    快捷筆記生成
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
                if (msg.role === 'user') {
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '3px',
                      }}
                    >
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', padding: '0 4px' }}>
                        YOU • {msg.timestamp}
                      </div>
                      <div
                        style={{
                          maxWidth: '90%',
                          borderRadius: '8px 8px 1px 8px',
                          padding: '8px 12px',
                          backgroundColor: 'var(--primary-color, #2563eb)',
                          color: '#ffffff',
                          fontSize: '12.5px',
                          lineHeight: 1.5,
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                if (msg.delivery) {
                  return (
                    <div key={msg.id} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        {msg.delivery === 'streaming' ? '正在回覆…' : '回覆未完成 · 已保留收到的文字'}
                      </div>
                      <div className="markdown-body" style={{ fontSize: '12px', overflowWrap: 'anywhere' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdownSync(preprocessCallouts(msg.content || '等待第一段文字…'))) }} />
                    </div>
                  );
                }

                // Arborist 訊息：拆分為「推導思路泡泡」＋「正式筆記泡泡」
                const { thought, note } = splitThoughtAndNote(msg.content);
                const hasThought = Boolean(thought);
                const isPreviewOpen = Boolean(expandedPreviewIds[msg.id]);

                // 計算 20% 預覽文字長度
                const previewCharLimit = Math.max(120, Math.floor(note.length * 0.22));
                const previewSnippet = note.length > previewCharLimit ? note.slice(0, previewCharLimit) + '...' : note;

                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* 泡泡 1：架構師思考推導過程 */}
                    {hasThought && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', padding: '0 4px' }}>
                          <Brain size={12} style={{ color: '#60a5fa' }} />
                          <span>ARBORIST 思維推導 • {msg.timestamp}</span>
                        </div>
                        <div
                          style={{
                            maxWidth: '95%',
                            borderRadius: '8px 8px 8px 1px',
                            padding: '10px 12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px dashed rgba(255, 255, 255, 0.15)',
                            color: 'var(--text-primary)',
                            fontSize: '12px',
                            lineHeight: 1.5,
                          }}
                        >
                          <div
                            className="markdown-body"
                            style={{ fontSize: '11.5px', backgroundColor: 'transparent' }}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdownSync(preprocessCallouts(thought))) }}
                          />
                        </div>
                      </div>
                    )}

                    {/* 泡泡 2：生成的正式筆記內容（預設收合 20%，支援右上角展開與 Diff 知識修整） */}
                    {(() => {
                      const diff = computeLineDiff(currentNoteContent, note);
                      const activeTab = activeTabIds[msg.id] || (diff.removedCount > 0 ? 'diff' : 'note');

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', width: '100%' }}>
                          {/* 頂部標題列與右上角 20% 收合/展開控制項 */}
                          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Sparkles size={12} style={{ color: '#22c55e' }} />
                              <span style={{ fontWeight: 600 }}>WIKITREE 知識葉片成果</span>
                              {diff.removedCount > 0 && (
                                <span style={{ fontSize: '9.5px', padding: '1px 5px', borderRadius: '3px', backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)', fontWeight: 600 }}>
                                  可修整
                                </span>
                              )}
                            </div>

                            {/* 右上角收合/展開開關 */}
                            <button
                              className="btn"
                              onClick={() => togglePreview(msg.id)}
                              style={{
                                padding: '2px 8px',
                                fontSize: '10.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                backgroundColor: isPreviewOpen ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                color: isPreviewOpen ? '#22c55e' : 'var(--text-secondary)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title={isPreviewOpen ? '收合為前 20% 預覽' : '展開查看 100% 全文'}
                            >
                              {isPreviewOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              <span>{isPreviewOpen ? '收合 (20%)' : '🔍 展開全文'}</span>
                            </button>
                          </div>

                          <div
                            style={{
                              width: '100%',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'var(--bg-secondary)',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
                            }}
                          >
                            {/* 分頁切換列：筆記成果 vs 知識修整 Diff */}
                            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                              <button
                                onClick={() => setActiveTabIds(prev => ({ ...prev, [msg.id]: 'note' }))}
                                style={{
                                  flex: 1,
                                  padding: '7px 10px',
                                  fontSize: '11px',
                                  border: 'none',
                                  borderBottom: activeTab === 'note' ? '2px solid #22c55e' : '2px solid transparent',
                                  background: activeTab === 'note' ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
                                  color: activeTab === 'note' ? '#22c55e' : 'var(--text-secondary)',
                                  fontWeight: activeTab === 'note' ? 700 : 400,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                }}
                              >
                                <span>📄 知識筆記</span>
                              </button>

                              <button
                                onClick={() => setActiveTabIds(prev => ({ ...prev, [msg.id]: 'diff' }))}
                                style={{
                                  flex: 1,
                                  padding: '7px 10px',
                                  fontSize: '11px',
                                  border: 'none',
                                  borderBottom: activeTab === 'diff' ? '2px solid #60a5fa' : '2px solid transparent',
                                  background: activeTab === 'diff' ? 'rgba(96, 165, 250, 0.08)' : 'transparent',
                                  color: activeTab === 'diff' ? '#60a5fa' : 'var(--text-secondary)',
                                  fontWeight: activeTab === 'diff' ? 700 : 400,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                }}
                              >
                                <span>🔀 知識修整 Diff</span>
                                <span style={{ fontSize: '9.5px', padding: '1px 4px', borderRadius: '3px', background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontWeight: 600 }}>
                                  +{diff.addedCount}
                                </span>
                                {diff.removedCount > 0 && (
                                  <span style={{ fontSize: '9.5px', padding: '1px 4px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: 600 }}>
                                    -{diff.removedCount}
                                  </span>
                                )}
                              </button>
                            </div>

                            {/* 筆記正文展示區 */}
                            {activeTab === 'note' ? (
                              <div style={{ padding: '12px 14px', position: 'relative' }}>
                                {!isPreviewOpen ? (
                                  <div style={{ position: 'relative', maxHeight: '135px', overflow: 'hidden' }}>
                                    <div
                                      className="markdown-body"
                                      style={{ fontSize: '12px', backgroundColor: 'transparent', lineHeight: 1.6 }}
                                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdownSync(preprocessCallouts(previewSnippet))) }}
                                    />
                                    <div
                                      style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '50px',
                                        background: 'linear-gradient(to bottom, transparent, var(--bg-secondary))',
                                        pointerEvents: 'none',
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        justifyContent: 'center',
                                        paddingBottom: '4px',
                                      }}
                                    >
                                      <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 600 }}>
                                        （目前僅顯示前 20% 內容 • 點右上角展開全文）
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className="markdown-body"
                                    style={{ fontSize: '12px', backgroundColor: 'transparent', lineHeight: 1.6 }}
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdownSync(preprocessCallouts(note))) }}
                                  />
                                )}
                              </div>
                            ) : (
                              /* 🔀 大泡泡：完整的 Diff 審查容器 */
                              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {/* 大泡泡頂部統計 */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    📝 筆記修整對照 (Revision Diff)
                                  </span>
                                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', fontWeight: 600 }}>
                                      +{diff.addedCount} 行 新增/簡化
                                    </span>
                                    <span style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 600 }}>
                                      -{diff.removedCount} 行 舊文修整
                                    </span>
                                  </div>
                                </div>

                                {/* 子泡泡 1 (上面)：新增了哪些內容 */}
                                <div
                                  style={{
                                    borderRadius: '6px',
                                    border: '1px solid rgba(34, 197, 94, 0.35)',
                                    backgroundColor: 'rgba(34, 197, 94, 0.05)',
                                    padding: '10px 12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <span>🟢</span> 新增 / 簡化概念內容
                                    </span>
                                    <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 600 }}>+{diff.addedCount} 行</span>
                                  </div>

                                  <div style={{ maxHeight: isPreviewOpen ? 'none' : '120px', overflow: 'hidden', position: 'relative' }}>
                                    <div
                                      className="markdown-body"
                                      style={{ fontSize: '11.5px', backgroundColor: 'transparent', lineHeight: 1.5 }}
                                      dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(renderMarkdownSync(preprocessCallouts(
                                          !isPreviewOpen && diff.addedLines.join('\n').length > previewCharLimit
                                            ? diff.addedLines.join('\n').slice(0, previewCharLimit) + '...'
                                            : diff.addedLines.join('\n')
                                        )))
                                      }}
                                    />
                                    {!isPreviewOpen && diff.addedLines.join('\n').length > previewCharLimit && (
                                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35px', background: 'linear-gradient(to bottom, transparent, rgba(16, 26, 18, 0.95))', pointerEvents: 'none' }} />
                                    )}
                                  </div>
                                </div>

                                {/* 子泡泡 2 (下面)：刪除了哪些內容 */}
                                <div
                                  style={{
                                    borderRadius: '6px',
                                    border: '1px solid rgba(239, 68, 68, 0.35)',
                                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                                    padding: '10px 12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <span>🔴</span> 移除 / 被替換內容
                                    </span>
                                    <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600 }}>-{diff.removedCount} 行</span>
                                  </div>

                                  <div style={{ maxHeight: isPreviewOpen ? 'none' : '110px', overflowY: 'auto' }}>
                                    {diff.removedLines.length > 0 ? (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        {diff.removedLines.map((line, idx) => (
                                          <div
                                            key={idx}
                                            style={{
                                              fontSize: '11px',
                                              fontFamily: 'var(--font-mono)',
                                              color: '#f87171',
                                              textDecoration: 'line-through',
                                              opacity: 0.85,
                                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                              padding: '2px 6px',
                                              borderRadius: '3px',
                                              overflowWrap: 'anywhere',
                                            }}
                                          >
                                            - {line}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                                        （目前筆記中無對應刪除內容，本次修整為純新增）
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 操作控制列：套用修整 (Diff) vs 直接插入 (Insert) 與複製 */}
                            <div
                              style={{
                                padding: '8px 12px',
                                borderTop: '1px solid var(--border-color)',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                              }}
                            >
                              {/* 按鈕 1: 套用修整 (Diff 替換模式) */}
                              {onApplyDiff && (
                                <button
                                  className="btn btn-primary"
                                  onClick={() => applyDiffToNote(msg.id, note, diff)}
                                  style={{
                                    flex: 1,
                                    padding: '6px 12px',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    backgroundColor: '#2563eb',
                                    borderColor: '#2563eb',
                                  }}
                                  title="在編輯器中呈現對稱的 Diff 審查區塊（綠色新增＋紅色刪除）"
                                >
                                  {appliedId === msg.id ? <Check size={14} color="#ffffff" /> : <GitBranch size={14} />}
                                  <span>{appliedId === msg.id ? '已送至編輯器！' : '🔀 套用修整 (Diff)'}</span>
                                </button>
                              )}

                              {/* 按鈕 2: 直接插入新段落 (單純插入模式) */}
                              {onApplyContent && (
                                <button
                                  className="btn"
                                  onClick={() => applyToNote(msg.id, note)}
                                  style={{
                                    padding: '6px 10px',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                    borderColor: 'rgba(34, 197, 94, 0.35)',
                                    color: '#22c55e',
                                  }}
                                  title="以可拖動的綠色膠囊直接插入筆記某一處"
                                >
                                  <Plus size={13} />
                                  <span>➕ 直接插入</span>
                                </button>
                              )}

                              <button
                                className="btn"
                                title="複製純淨筆記"
                                onClick={() => copyToClipboard(msg.id, note)}
                                style={{ padding: '6px 10px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                {copiedId === msg.id ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
                                <span>{copiedId === msg.id ? '已複製' : '複製'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })
            )}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '11.5px', padding: '6px' }}>
                <Loader2 size={14} className="spin" />
                <details style={{ flex: 1 }}>
                  <summary>回覆中 · 已等待 {elapsedSeconds} 秒</summary>
                  <div style={{ marginTop: '6px' }}>{streamStatus}</div>
                </details>
                <button className="btn" onClick={() => requestRef.current?.abort()} style={{ fontSize: '11px' }}>停止</button>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* 輸入欄 */}
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
                placeholder={currentNotePath ? `對「${currentNotePath}」提問...` : '輸入任務或提問...'}
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
                style={{ padding: '7px 12px', height: '34px' }}
              >
                {loading ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
              <span>按 Enter 送出 • 自動分離思維與筆記</span>
              <span>支援 20% 預覽確認</span>
            </div>
          </div>
        </>
      ) : (
        /* 視圖 B：瀏覽器模式 */
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '12px',
              backgroundColor: 'var(--bg-secondary)',
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '6px', fontSize: '12.5px' }}>
              <Globe size={14} style={{ color: '#3b82f6' }} />
              <span>瀏覽器工作流：複製 ➔ 外部提問 ➔ 貼上匯入</span>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '11px' }}>
              點擊卡片複製結構化提示詞，去外部 AI 提問後，再將結果貼回下方，一鍵精準寫入當前編輯器。
            </p>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>
              步驟 1：複製結構化提示詞（已附帶目前筆記）
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {quickSkills.map((skill) => {
                const Icon = skill.icon;
                const isCopied = copiedPromptId === skill.id;
                const disabled = !currentNotePath && skill.id !== 'distill';
                return (
                  <button
                    key={skill.id}
                    onClick={() => copyStructuredPrompt(skill.id, skill.prompt)}
                    disabled={disabled}
                    style={{
                      textAlign: 'left',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      backgroundColor: isCopied ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                      padding: '10px 8px',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.5 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Icon size={14} style={{ color: isCopied ? '#22c55e' : 'var(--text-primary)' }} />
                      {isCopied ? <Check size={13} color="#22c55e" /> : <Copy size={13} style={{ color: 'var(--text-secondary)' }} />}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '11.5px', color: isCopied ? '#22c55e' : 'var(--text-primary)' }}>
                      {isCopied ? '已複製！' : skill.label}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.2 }}>
                      {skill.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                步驟 2：貼上外部 AI 生成內容
              </div>
              <button
                className="btn"
                onClick={pasteFromClipboard}
                style={{ padding: '2px 6px', fontSize: '10.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Clipboard size={11} />
                <span>讀取剪貼簿</span>
              </button>
            </div>

            <textarea
              className="form-input"
              rows={6}
              placeholder="在此貼上外部 AI 生成的 Markdown 筆記內容..."
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              style={{ fontSize: '12px', padding: '8px', lineHeight: 1.4, resize: 'vertical' }}
            />

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (onApplyContent && pastedContent.trim()) {
                    onApplyContent(pastedContent.trim());
                    flash({ kind: 'success', text: '已成功套用至當前筆記編輯器！' });
                    setPastedContent('');
                  }
                }}
                disabled={!pastedContent.trim()}
                style={{ flex: 1, padding: '8px', fontSize: '11.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Download size={13} />
                <span>📥 覆蓋套用</span>
              </button>
              <button
                className="btn"
                onClick={() => {
                  if (onAppendContent && pastedContent.trim()) {
                    onAppendContent(pastedContent.trim());
                    flash({ kind: 'success', text: '已成功附加至當前筆記末端！' });
                    setPastedContent('');
                  }
                }}
                disabled={!pastedContent.trim()}
                style={{ flex: 1, padding: '8px', fontSize: '11.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Plus size={13} />
                <span>➕ 附加末尾</span>
              </button>
              {pastedContent.trim() && (
                <button
                  className="btn"
                  onClick={() => setPastedContent('')}
                  style={{ padding: '8px', fontSize: '11.5px' }}
                  title="清除"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {currentNotePath && (
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', padding: '6px 8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
              當前操作筆記：{currentNotePath}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
