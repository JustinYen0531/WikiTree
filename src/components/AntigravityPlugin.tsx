import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Languages,
  Lightbulb,
  ListChecks,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

interface AntigravityPluginProps {
  currentNotePath: string;
  currentNoteContent: string;
  onApplyContent?: (content: string) => void;
  editRequest?: { text: string; apply: (s: string) => void } | null;
  onClearEditRequest?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const API_KEY_STORAGE = 'nccu_hub_groq_key';

interface ParsedAssistantReply {
  opening: string;
  body: string;
  closing: string;
}

const SECTION_RE = /(?:^|\n)\s*(?:<{0,1}(opening|intro|body|main|answer|content|closing|outro|end|開場|正文|結尾)>{0,1}|(?:#{1,4}\s*)?(開場|正文|結尾|Opening|Body|Closing|Main answer|Answer)\s*[:：]?)\s*\n/gi;
const SECTION_MARKER_LINE_RE = /^\s*(?:<{0,1}(?:opening|intro|body|main|answer|content|closing|outro|end)>{0,1}|(?:#{1,4}\s*)?(?:開場|正文|結尾|Opening|Body|Closing|Main answer|Answer)\s*[:：]?)\s*$/gim;

const AI_OPENING_PATTERNS = [
  /^(好的|好|可以|當然|沒問題|了解|收到|明白)[，,！!\s]*(以下|下面|這裡|我幫你|我會|根據|針對|這是)/,
  /^(以下|下面|這裡)(是|為|整理|提供|列出)/,
  /^(我幫你|我會|我可以|我來)(整理|改寫|摘要|翻譯|分析|列出|生成)/,
  /^(根據|針對|依照|基於).{0,40}(整理|分析|回答|如下)/,
  /^(Here|Sure|Of course|Certainly|Absolutely)[,.!\s]+(is|are|I|the|a)/i,
];

const AI_CLOSING_PATTERNS = [
  /^(如果|若|假如).{0,60}(需要|想要|希望|可以|再)/,
  /^(需要的話|如果你願意|你也可以|我也可以).{0,80}/,
  /(我可以再|可以再|再幫你).{0,60}(整理|改寫|補充|濃縮|轉成|做成)/,
  /(希望.{0,30}(有幫助|幫得上忙)|以上|完成)[。.!！\s]*$/,
  /^(Let me know|Hope this helps|I can also|If you want|If needed)/i,
];

const stripSectionMarkers = (text: string) =>
  text.replace(SECTION_MARKER_LINE_RE, '').trim();

const isProbablyCopyableContent = (text: string) =>
  /^(\s*(#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|>\s+|```|\|)|\s*\S+\s*[:：]\s*\S+)/.test(text);

const isFillerParagraph = (
  paragraph: string,
  patterns: RegExp[],
  maxLength: number,
) => {
  const text = stripSectionMarkers(paragraph).replace(/\s+/g, ' ').trim();
  if (!text || text.length > maxLength || isProbablyCopyableContent(text)) return false;
  return patterns.some((pattern) => pattern.test(text));
};

const looksLikeOpening = (paragraph: string) =>
  isFillerParagraph(paragraph, AI_OPENING_PATTERNS, 140);

const looksLikeClosing = (paragraph: string) =>
  isFillerParagraph(paragraph, AI_CLOSING_PATTERNS, 180);

const splitParagraphs = (text: string) =>
  text
    .trim()
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

const stripFillerEnvelope = (text: string): ParsedAssistantReply | null => {
  const lines = text.split('\n');
  let start = 0;
  let end = lines.length - 1;

  while (start <= end && !lines[start].trim()) start += 1;
  while (end >= start && !lines[end].trim()) end -= 1;
  if (start > end) return null;

  const opening = looksLikeOpening(lines[start]) ? lines[start].trim() : '';
  if (opening) start += 1;

  while (start <= end && !lines[start].trim()) start += 1;

  const closing = end >= start && looksLikeClosing(lines[end]) ? lines[end].trim() : '';
  if (closing) end -= 1;

  while (end >= start && !lines[end].trim()) end -= 1;

  const body = lines.slice(start, end + 1).join('\n').trim();
  if (!body || (!opening && !closing)) return null;

  return { opening, body, closing };
};

const parseAssistantReply = (content: string): ParsedAssistantReply => {
  const source = content.trim();
  if (!source) return { opening: '', body: '', closing: '' };

  const matches = [...source.matchAll(SECTION_RE)];
  if (matches.length > 0) {
    const sections: Record<string, string> = {};
    matches.forEach((match, index) => {
      const label = (match[1] || match[2] || '').toLowerCase();
      const start = (match.index || 0) + match[0].length;
      const end = index + 1 < matches.length ? matches[index + 1].index || source.length : source.length;
      const value = stripSectionMarkers(source.slice(start, end));
      if (/opening|intro|開場/.test(label)) sections.opening = value;
      else if (/closing|outro|end|結尾/.test(label)) sections.closing = value;
      else sections.body = value;
    });

    return {
      opening: sections.opening || '',
      body: sections.body || stripSectionMarkers(source),
      closing: sections.closing || '',
    };
  }

  const envelope = stripFillerEnvelope(source);
  if (envelope) return envelope;

  const paragraphs = splitParagraphs(source);
  if (paragraphs.length < 2) return { opening: '', body: source, closing: '' };

  const opening = looksLikeOpening(paragraphs[0]) ? paragraphs.shift() || '' : '';
  const closing = paragraphs.length > 1 && looksLikeClosing(paragraphs[paragraphs.length - 1])
    ? paragraphs.pop() || ''
    : '';
  const body = paragraphs.join('\n\n').trim() || source;
  return { opening, body, closing };
};

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        background: 'none', border: '1px solid var(--border-color)',
        borderRadius: '6px', padding: '3px 8px', fontSize: '11px',
        color: copied ? 'var(--success)' : 'var(--text-secondary)',
        cursor: 'pointer', alignSelf: 'flex-start',
      }}
    >
      <Copy size={11} />
      {copied ? '已複製' : '複製'}
    </button>
  );
};
const MODEL = 'llama-3.1-8b-instant';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const agentChunks = [
  {
    label: '🎯 加入考點',
    prompt: '在原筆記後補上「考點」區塊，列出最可能被考的定義、比較、因果關係、關鍵判斷與易混淆處。用條列呈現，語氣像考前複習筆記。',
  },
  {
    label: '📈 補上圖形',
    prompt: '在原筆記中補上適合幫助理解的圖形說明。優先使用 Mermaid、ASCII 流程圖、簡單表格或座標軸文字示意；如果不適合畫圖，請改用「圖形化描述」整理。',
  },
  {
    label: '🧠 加入記憶技巧',
    prompt: '補上好記的記憶技巧、口訣、聯想法或對照表。記憶技巧要短、直覺、能幫助考試回想，並保留原本概念的準確性。',
  },
  {
    label: '📝 生成練習題',
    prompt: '根據原筆記生成練習題。包含選擇題或簡答題、答案、簡短解析。題目要檢查概念理解，不要只考背誦。',
  },
  {
    label: '🔗 連到前置概念',
    prompt: '補上理解這段內容之前需要知道的前置概念，並說明每個前置概念如何連到原筆記。格式用「前置概念 -> 為什麼重要」。',
  },
  {
    label: '⚠️ 常見誤解',
    prompt: '補上學生常見誤解與正確觀念。用「誤解 / 正確理解 / 為什麼」的格式整理，幫助避免考試或作業中寫錯。',
  },
  {
    label: '📚 教授上課補充',
    prompt: '補上教授上課可能會延伸說明的補充觀點、例子、提醒或和現實情境的連結。請標成「課堂補充」，不要捏造具體教授或課程事件。',
  },
];

const MarkdownSegment: React.FC<{ text: string; muted?: boolean; main?: boolean }> = ({ text, muted, main }) => (
  <div
    style={{
      color: muted ? 'var(--text-secondary)' : 'inherit',
      borderLeft: main ? '3px solid var(--accent)' : 'none',
      paddingLeft: main ? '10px' : 0,
    }}
    dangerouslySetInnerHTML={{ __html: marked.parse(text) as string }}
  />
);

const BodyCopyButton: React.FC<{ content: string; extractBody: boolean }> = ({ content, extractBody }) => {
  const [copied, setCopied] = useState(false);
  const body = extractBody ? parseAssistantReply(content).body : content;
  const text = body || content;

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        background: 'none', border: '1px solid var(--border-color)',
        borderRadius: '6px', padding: '3px 8px', fontSize: '11px',
        color: copied ? 'var(--success)' : 'var(--text-secondary)',
        cursor: 'pointer', alignSelf: 'flex-start',
      }}
    >
      <Copy size={11} />
      {copied ? '已複製' : '複製正文'}
    </button>
  );
};

const AssistantMessage: React.FC<{ content: string; extractBody: boolean; loading?: boolean }> = ({ content, extractBody, loading }) => {
  if (!content) {
    return loading ? <Loader2 size={14} className="spin" /> : null;
  }

  if (!extractBody) {
    return <MarkdownSegment text={content} />;
  }

  const parsed = parseAssistantReply(content);
  const hasSegments = Boolean(parsed.opening || parsed.closing);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {parsed.opening && <MarkdownSegment text={parsed.opening} muted />}
      <MarkdownSegment text={parsed.body} main={hasSegments} />
      {parsed.closing && <MarkdownSegment text={parsed.closing} muted />}
    </div>
  );
};

export const AntigravityPlugin: React.FC<AntigravityPluginProps> = ({
  currentNotePath,
  currentNoteContent,
  onApplyContent,
  editRequest,
  onClearEditRequest,
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
    if (editRequest) {
      return '你是文字編輯助理。只輸出修改後的文字，不要任何解釋、前言、後記、標籤。直接輸出純文字結果。';
    }
    const base =
      '你是 NCCU Hub 的 AI 學習助理，幫助政大學生整理筆記、解釋概念、翻譯內容。請用繁體中文回答，回答要簡潔清楚。使用 Markdown 格式讓回答更易讀。';
    if (!currentNotePath || !currentNoteContent) return base;
    return `${base}\n\n使用者目前開啟的筆記是「${currentNotePath}」，內容如下：\n\n---\n${currentNoteContent.slice(0, 8000)}\n---`;
  };

  const sendMessage = async (userText: string, freshStart = false, displayText?: string) => {
    if (!hasKey || streaming || !userText.trim()) return;
    setError(null);

    const shownText = displayText ?? userText;
    const baseHistory: Message[] = freshStart ? [] : messages;
    const userMsgDisplay: Message = { role: 'user', content: shownText };
    const historyForApi = [...baseHistory, { role: 'user' as const, content: userText }];

    setMessages([...baseHistory, userMsgDisplay, { role: 'assistant', content: '' }]);
    setStreaming(true);

    abortRef.current = new AbortController();

    try {
      const systemPrompt = editRequest
        ? buildSystemPrompt()
        : `${buildSystemPrompt()}\n\n回覆請盡量分成三段：開場、正文、結尾。可複製/可直接貼進筆記的內容只放在「正文」段落；不要把「以下是我的整理」這類客套話放進正文。`;

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
            { role: 'system', content: systemPrompt },
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
    if (editRequest) {
      const apiText = `要修改的文字：\n\n${editRequest.text}\n\n指令：${text}`;
      sendMessage(apiText, true, `✏️ ${text}`);
    } else {
      sendMessage(text);
    }
  };

  const sendAgentChunk = (label: string, instruction: string) => {
    if (!editRequest || streaming) return;

    setInput('');
    const apiText = [
      '你正在擔任 NCCU Hub 的 semi-agent 筆記改寫器。',
      '請依照下方固定指令改寫「選取文字」。',
      '只輸出可直接貼回筆記的內容；不要前言、不要結尾、不要解釋你的做法。',
      '輸出可以使用 Markdown，但必須是原始 Markdown，不要包在程式碼區塊中。',
      '保留原本重點，必要時補充，但不要捏造課堂沒有根據的事實。',
      '',
      '選取文字：',
      editRequest.text,
      '',
      '固定指令：',
      instruction,
    ].join('\n');

    sendMessage(apiText, true, label);
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
            {/* Edit request banner */}
            {editRequest && (
              <div style={{
                margin: '8px 12px 0',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--accent)',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
                flexShrink: 0,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>✏️ 正在編輯選取文字</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    「{editRequest.text.slice(0, 80)}{editRequest.text.length > 80 ? '…' : ''}」
                  </div>
                </div>
                <button
                  onClick={onClearEditRequest}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0', flexShrink: 0 }}
                  title="取消編輯"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              minHeight: 0,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              {messages.length === 0 && !editRequest && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '8px', lineHeight: 1.7 }}>
                  <Sparkles size={18} style={{ color: 'var(--accent)', display: 'block', margin: '0 auto 8px' }} />
                  {currentNotePath
                    ? <>目前筆記：<strong>{currentNotePath}</strong><br />點下方按鈕或輸入問題！</>
                    : <>先開啟一則筆記，或直接輸入問題。</>
                  }
                </div>
              )}

              {messages.length === 0 && editRequest && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '8px', lineHeight: 1.7 }}>
                  在下方輸入你的修改指令，例如：「改成更簡潔」、「翻成英文」
                </div>
              )}

              {editRequest && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: messages.length === 0 ? '2px' : '0' }}>
                  {agentChunks.map((chunk) => (
                    <button
                      key={chunk.label}
                      type="button"
                      onClick={() => sendAgentChunk(chunk.label, chunk.prompt)}
                      disabled={streaming}
                      title={chunk.prompt}
                      style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: '999px',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        padding: '6px 10px',
                        fontSize: '12px',
                        cursor: streaming ? 'not-allowed' : 'pointer',
                        opacity: streaming ? 0.55 : 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {chunk.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Quick presets */}
              {messages.length === 0 && !editRequest && currentNotePath && currentNoteContent && (
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
              {messages.map((msg, i) => {
                const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1;
                const canApply = editRequest && isLastAssistant && msg.content && !streaming;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      gap: '4px',
                      width: '100%',
                      minWidth: 0,
                    }}
                  >
                    {msg.role === 'user' ? (
                      <div style={{
                        maxWidth: '88%', minWidth: 0,
                        padding: '8px 12px',
                        borderRadius: '12px 12px 2px 12px',
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                        fontSize: '12.5px', lineHeight: 1.65,
                        wordBreak: 'break-word', overflowWrap: 'anywhere',
                      }}>
                        {msg.content}
                      </div>
                    ) : msg.content ? (
                      <div
                        className="rendered-markdown"
                        style={{
                          maxWidth: '96%', minWidth: 0,
                          padding: '8px 12px',
                          borderRadius: '12px 12px 12px 2px',
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '12.5px', lineHeight: 1.65,
                          border: '1px solid var(--border-color)',
                          wordBreak: 'break-word', overflowWrap: 'anywhere',
                        }}
                      >
                        <AssistantMessage content={msg.content} extractBody={!editRequest} />
                      </div>
                    ) : (
                      <div style={{
                        maxWidth: '96%', minWidth: 0,
                        padding: '8px 12px',
                        borderRadius: '12px 12px 12px 2px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                      }}>
                        {streaming && i === messages.length - 1 && <Loader2 size={14} className="spin" />}
                      </div>
                    )}

                    {msg.role === 'assistant' && msg.content && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <BodyCopyButton content={msg.content} extractBody={!editRequest} />
                        {canApply && (
                          <button
                            onClick={() => {
                              editRequest.apply(msg.content);
                              onClearEditRequest?.();
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              background: 'none', border: '1px solid var(--accent)',
                              borderRadius: '6px', padding: '3px 8px', fontSize: '11px',
                              color: 'var(--accent)', cursor: 'pointer', fontWeight: 700,
                            }}
                          >
                            ✓ 套用到選取範圍
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

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
                placeholder={editRequest ? '告訴我怎麼修改這段文字…' : '輸入問題，Enter 送出，Shift+Enter 換行…'}
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
