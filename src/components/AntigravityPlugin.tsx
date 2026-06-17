import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Terminal as TerminalIcon, 
  Settings, 
  RefreshCw, 
  Trash,
  Paperclip
} from 'lucide-react';

interface Message {
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
}

interface AntigravityPluginProps {
  currentNotePath: string;
  currentNoteContent: string;
}

export const AntigravityPlugin: React.FC<AntigravityPluginProps> = ({
  currentNotePath,
  currentNoteContent,
}) => {
  const [cliUrl, setCliUrl] = useState(() => localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080');
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Mode switcher: 'chat' (AI Assistant) vs 'terminal' (Terminal GUI)
  const [mode, setMode] = useState<'terminal' | 'chat'>('terminal');

  // Terminal commands state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isRunningCommand, setIsRunningCommand] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Load history from session
  useEffect(() => {
    const savedMsgs = sessionStorage.getItem('antigravity_chat_msgs');
    if (savedMsgs) {
      setMessages(JSON.parse(savedMsgs));
    } else {
      setMessages([
        { 
          sender: 'assistant', 
          text: '您好！我是 **Antigravity**，您的本地 AI 結對編程助理。切換至 **終端控制台** 分頁可直接在本機執行終端指令，或者設定您的 Gemini API 金鑰來與我進行 AI 筆記對話！', 
          timestamp: Date.now() 
        }
      ]);
    }

    const savedLogs = sessionStorage.getItem('antigravity_terminal_logs');
    if (savedLogs) {
      setTerminalLogs(JSON.parse(savedLogs));
    } else {
      setTerminalLogs([
        '歡迎使用 Antigravity 本機圖形化終端控制台。',
        '您可以在下方輸入任何本機系統指令，或點擊上方快捷按鈕直接在您的電腦執行。',
        '--------------------------------------------------------------------------------'
      ]);
    }
  }, []);

  // Save changes to session
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('antigravity_chat_msgs', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (terminalLogs.length > 0) {
      sessionStorage.setItem('antigravity_terminal_logs', JSON.stringify(terminalLogs));
    }
  }, [terminalLogs]);

  // Test CLI Connection
  const testConnection = async (urlToCheck = cliUrl) => {
    setStatus('testing');
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000); // 2s timeout
      
      const response = await fetch(`${urlToCheck}/api/status`, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(id);
      
      if (response.ok) {
        setStatus('connected');
        localStorage.setItem('antigravity_cli_url', urlToCheck);
        return true;
      }
    } catch (e) {
      console.warn('CLI Connection failed');
    }
    setStatus('disconnected');
    return false;
  };

  // Auto test on mount
  useEffect(() => {
    testConnection();
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (mode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, mode]);

  useEffect(() => {
    if (mode === 'terminal') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, mode]);

  // AI Chat message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const userText = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    const userMessage: Message = {
      sender: 'user',
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);

    const payload = {
      message: userText,
      context: includeContext ? {
        path: currentNotePath,
        content: currentNoteContent
      } : null
    };

    if (status === 'connected') {
      try {
        const response = await fetch(`${cliUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          const data = await response.json();
          setMessages(prev => [...prev, {
            sender: 'assistant',
            text: data.reply || 'AI 未返回任何回應。',
            timestamp: Date.now()
          }]);
        } else {
          throw new Error('伺服器返回錯誤響應');
        }
      } catch (e: any) {
        setMessages(prev => [...prev, 
          { sender: 'system', text: `連線中斷: ${e.message}`, timestamp: Date.now() },
          { sender: 'assistant', text: `抱歉，我與位於 ${cliUrl} 的本地 CLI 伺服器失去連線。請確保伺服器正在運行並再試一次。`, timestamp: Date.now() }
        ]);
        setStatus('disconnected');
      } finally {
        setIsSending(false);
      }
    } else {
      // Demo Mode Response
      setTimeout(() => {
        const reply = `### Antigravity AI (模擬展示模式)
若要啟用真實的 AI 模型對話，請在啟動 CLI 伺服器前，在您的命令列視窗設定 Gemini API 金鑰：
\`\`\`powershell
# 在 Windows PowerShell：
$env:GEMINI_API_KEY="您的_API_KEY"
npm.cmd run cli
\`\`\`

如果您已經有安裝全域的 **Antigravity CLI** 工具並希望直接執行本機終端機命令，請切換至上方的 **終端控制台** 分頁。該功能將直接在您的系統執行命令，**無須任何 API 金鑰**！`;

        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: reply,
          timestamp: Date.now()
        }]);
        setIsSending(false);
      }, 1000);
    }
  };

  // Run terminal command (real execution on host machine)
  const handleRunCommand = async (cmdText: string) => {
    if (!cmdText.trim() || isRunningCommand) return;
    const finalCmd = cmdText.trim();

    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [...prev, `[${timestamp}] $ ${finalCmd}`]);
    setIsRunningCommand(true);

    if (status === 'connected') {
      try {
        const response = await fetch(`${cliUrl}/api/command`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: finalCmd })
        });
        
        if (response.ok) {
          const data = await response.json();
          const lines = data.output.split('\n');
          setTerminalLogs(prev => [...prev, ...lines]);
        } else {
          const errData = await response.json();
          setTerminalLogs(prev => [...prev, `錯誤: ${errData.error || '伺服器出錯'}`]);
        }
      } catch (e: any) {
        setTerminalLogs(prev => [...prev, `連線失敗: 無法連線至 CLI 伺服器 (${e.message})`]);
        setStatus('disconnected');
      } finally {
        setIsRunningCommand(false);
      }
    } else {
      // Offline Demo Mode
      setTimeout(() => {
        setTerminalLogs(prev => [
          ...prev, 
          `錯誤：無法執行「${finalCmd}」`,
          `-> 本地 Antigravity CLI 伺服器目前處於離線狀態。`,
          `-> 若要啟用指令執行，請在您的專案目錄中執行以下命令啟動伺服器：`,
          `   npm.cmd run cli`,
          `   並點擊右上角的 🔄 重新整理連線。`
        ]);
        setIsRunningCommand(false);
      }, 500);
    }
  };

  const handleTerminalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim() || isRunningCommand) return;
    const cmd = terminalInput.trim();
    setTerminalInput('');

    // Check if user is typing Chinese natural language instead of standard CLI shell commands
    const hasChinese = /[\u4e00-\u9fa5]/.test(cmd);
    const commonPrefixes = ['git', 'npm', 'node', 'cd', 'dir', 'ls', 'mkdir', 'echo', 'antigravity', 'npx', 'tsc', 'vite', 'python', 'pip', 'yarn', 'pnpm', 'clear', 'cls', 'git.exe', 'npm.cmd'];
    const firstWord = cmd.split(/[\s|&;]+/)[0].toLowerCase();
    const isStandardCmd = commonPrefixes.some(prefix => firstWord === prefix || firstWord.startsWith(prefix));

    if (hasChinese && !isStandardCmd) {
      setTerminalLogs(prev => [
        ...prev,
        `$ ${cmd}`,
        `[Antigravity 系統提示] 偵測到您輸入了中文自然語言要求。`,
        `-> 本控制台為執行「本機系統指令」（如 git status 或 npm run build）所設計。`,
        `-> 若要讓 AI 助理為您執行檔案操作或解答問題，請切換至上方的「AI 助理」對話分頁與 AI 聊聊！`,
        `--------------------------------------------------------------------------------`
      ]);
      return;
    }

    handleRunCommand(cmd);
  };

  // Helper to parse bolding in lines
  const parseInlineMarkdown = (line: string) => {
    let parts: React.ReactNode[] = [line];
    if (line.includes('**')) {
      const subParts = line.split('**');
      parts = subParts.map((sp, sIdx) => sIdx % 2 === 1 ? <strong key={sIdx}>{sp}</strong> : sp);
    }
    return parts;
  };

  // Helper to render message with formatted code blocks and click-to-run integration
  const renderMessageText = (text: string) => {
    if (!text) return null;
    
    // Split by code blocks
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, idx) => {
      if (part.startsWith('```')) {
        const lines = part.split('\n');
        const firstLine = lines[0];
        const lang = firstLine.replace('```', '').trim();
        const code = lines.slice(1, lines.length - 1).join('\n');
        
        // Check if code can be executed in terminal
        const cleanLang = lang.toLowerCase();
        const isShellCode = ['bash', 'shell', 'powershell', 'cmd', 'sh', 'bat', 'ps1'].includes(cleanLang) || 
                            code.includes('git ') || code.includes('npm ') || code.includes('antigravity ');
        
        return (
          <div 
            key={idx} 
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px', 
              margin: '8px 0', 
              fontFamily: 'var(--font-mono)',
              fontSize: '11.5px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* Header section with copy & execution actions */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              backgroundColor: 'var(--bg-secondary)', 
              padding: '6px 10px',
              borderBottom: '1px solid var(--border-color)',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>{lang || 'code'}</span>
              {isShellCode && (
                <button
                  onClick={() => {
                    setMode('terminal');
                    handleRunCommand(code);
                  }}
                  style={{
                    backgroundColor: 'var(--accent-bg)',
                    border: '1px solid var(--accent)',
                    color: 'var(--accent)',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '10.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.95)'}
                  onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                >
                  <TerminalIcon size={11} />
                  本機終端執行
                </button>
              )}
            </div>
            <pre style={{ margin: 0, padding: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--text-primary)' }}>{code}</pre>
          </div>
        );
      } else {
        // Render regular lines
        return part.split('\n').map((line, lIdx) => {
          if (line.startsWith('- ')) {
            return <li key={`${idx}-${lIdx}`} style={{ marginLeft: '12px', listStyleType: 'disc', color: 'var(--text-primary)' }}>{parseInlineMarkdown(line.substring(2))}</li>;
          }
          return <p key={`${idx}-${lIdx}`} style={{ margin: '4px 0', minHeight: line ? undefined : '8px', color: 'var(--text-primary)' }}>{parseInlineMarkdown(line)}</p>;
        });
      }
    });
  };

  const clearChat = () => {
    setMessages([
      { 
        sender: 'assistant', 
        text: '對話紀錄已清除。設定 Gemini API 金鑰即可與我討論您的筆記內容！', 
        timestamp: Date.now() 
      }
    ]);
    sessionStorage.removeItem('antigravity_chat_msgs');
  };

  const clearTerminalLogs = () => {
    setTerminalLogs([
      '終端機日誌已清空。',
      '--------------------------------------------------------------------------------'
    ]);
    sessionStorage.removeItem('antigravity_terminal_logs');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', fontSize: '13px' }}>
      
      {/* Plugin Connection Header */}
      <div style={{ 
        padding: '10px 12px', 
        borderBottom: '1px solid var(--border-color)', 
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: status === 'connected' ? 'var(--success)' : status === 'testing' ? 'var(--warning)' : 'var(--danger)' 
          }} />
          <span style={{ fontWeight: '600' }}>
            {status === 'connected' ? 'CLI 已連線' : status === 'testing' ? '連線中...' : 'CLI 伺服器離線'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            className="theme-toggle-btn" 
            title="連線設定"
            onClick={() => setShowSettings(!showSettings)}
            style={{ padding: '3px' }}
          >
            <Settings size={14} />
          </button>
          <button 
            className="theme-toggle-btn" 
            title="重新整理連線"
            onClick={() => testConnection()}
            style={{ padding: '3px' }}
          >
            <RefreshCw size={14} className={status === 'testing' ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Settings Panel Toggle */}
      {showSettings && (
        <div style={{ 
          padding: '12px', 
          borderBottom: '1px solid var(--border-color)', 
          backgroundColor: 'var(--bg-sidebar)',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          flexShrink: 0
        }}>
          <div className="form-group">
            <label className="form-label">本機 CLI 伺服器端點</label>
            <input 
              type="text" 
              className="form-input" 
              value={cliUrl} 
              onChange={(e) => setCliUrl(e.target.value)}
              placeholder="http://localhost:18080"
              style={{ fontSize: '12px', padding: '6px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => { testConnection(cliUrl); setShowSettings(false); }}
              style={{ flex: 1, padding: '4px' }}
            >
              連接
            </button>
            <button 
              className="btn" 
              onClick={() => setShowSettings(false)}
              style={{ padding: '4px' }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Mode Switcher Segment Controls */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid var(--border-color)', 
        padding: '6px 8px', 
        backgroundColor: 'var(--bg-sidebar)', 
        flexShrink: 0,
        gap: '4px'
      }}>
        <button 
          className={`btn ${mode === 'terminal' ? 'btn-primary' : ''}`}
          style={{ flex: 1, padding: '4px 6px', fontSize: '11px', border: 'none', background: mode === 'terminal' ? undefined : 'transparent' }}
          onClick={() => setMode('terminal')}
        >
          <TerminalIcon size={12} style={{ marginRight: '4px' }} />
          終端控制台
        </button>
        <button 
          className={`btn ${mode === 'chat' ? 'btn-primary' : ''}`}
          style={{ flex: 1, padding: '4px 6px', fontSize: '11px', border: 'none', background: mode === 'chat' ? undefined : 'transparent' }}
          onClick={() => setMode('chat')}
        >
          <Sparkles size={12} style={{ marginRight: '4px' }} />
          AI 智慧助理
        </button>
      </div>

      {/* Panel 1: Terminal Console GUI */}
      {mode === 'terminal' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          
          {/* Quick command triggers */}
          <div style={{ 
            padding: '6px 8px', 
            borderBottom: '1px solid var(--border-color)', 
            display: 'flex', 
            gap: '4px', 
            overflowX: 'auto',
            backgroundColor: 'var(--bg-secondary)',
            flexShrink: 0
          }}>
            <button 
              className="btn" 
              onClick={() => handleRunCommand('antigravity status')} 
              style={{ padding: '3px 6px', fontSize: '10.5px', whiteSpace: 'nowrap' }}
            >
              antigravity status
            </button>
            <button 
              className="btn" 
              onClick={() => handleRunCommand('antigravity audit')} 
              style={{ padding: '3px 6px', fontSize: '10.5px', whiteSpace: 'nowrap' }}
            >
              antigravity audit
            </button>
            <button 
              className="btn" 
              onClick={() => handleRunCommand('antigravity --help')} 
              style={{ padding: '3px 6px', fontSize: '10.5px', whiteSpace: 'nowrap' }}
            >
              antigravity --help
            </button>
            <button 
              className="btn" 
              onClick={() => handleRunCommand('npm.cmd run build')} 
              style={{ padding: '3px 6px', fontSize: '10.5px', whiteSpace: 'nowrap' }}
            >
              npm run build
            </button>
            <button 
              className="btn" 
              onClick={() => handleRunCommand('git status')} 
              style={{ padding: '3px 6px', fontSize: '10.5px', whiteSpace: 'nowrap' }}
            >
              git status
            </button>
          </div>

          {/* Graphical Console Log Stream */}
          <div style={{ 
            flex: 1, 
            backgroundColor: '#0d0d0d', 
            color: '#2ef82e', 
            fontFamily: 'var(--font-mono)', 
            fontSize: '11.5px', 
            padding: '12px', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            lineHeight: '1.4'
          }}>
            <div style={{ flex: 1 }}>
              {terminalLogs.map((log, idx) => (
                <div key={idx} style={{ whiteSpace: 'pre-wrap' }}>{log}</div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>

          {/* Console commands input form */}
          <div style={{ 
            padding: '10px', 
            borderTop: '1px solid var(--border-color)', 
            backgroundColor: 'var(--bg-secondary)',
            flexShrink: 0
          }}>
            <form onSubmit={handleTerminalFormSubmit} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>$</span>
              <input 
                type="text" 
                className="form-input" 
                placeholder={status === 'connected' ? "輸入指令 (例如 antigravity status)..." : "請啟動伺服器以執行系統指令..."}
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                disabled={isRunningCommand}
                style={{ flex: 1, padding: '6px 10px', height: '34px', fontSize: '12.5px', fontFamily: 'var(--font-mono)' }}
              />
              <button 
                type="button" 
                className="btn" 
                onClick={clearTerminalLogs} 
                title="清空螢幕日誌"
                style={{ padding: '6px 10px', height: '34px' }}
              >
                <Trash size={14} />
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={!terminalInput.trim() || isRunningCommand}
                style={{ padding: '6px 10px', height: '34px' }}
              >
                執行
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Panel 2: AI Assistant Chat */}
      {mode === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          
          {/* Chat Messages Feed Area */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '12px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px' 
          }}>
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {/* Sender Label */}
                <span style={{ 
                  fontSize: '10px', 
                  color: 'var(--text-secondary)', 
                  marginBottom: '2px',
                  textAlign: msg.sender === 'user' ? 'right' : 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  {msg.sender === 'user' ? '您' : msg.sender === 'assistant' ? 'Antigravity AI' : '系統'}
                  {msg.sender === 'assistant' && <Sparkles size={10} style={{ color: 'var(--accent)' }} />}
                </span>

                {/* Message Bubble */}
                <div style={{ 
                  padding: '8px 12px', 
                  borderRadius: 'var(--border-radius-md)', 
                  backgroundColor: msg.sender === 'user' ? 'var(--accent-bg)' : msg.sender === 'system' ? 'var(--danger-bg)' : 'var(--bg-secondary)',
                  color: msg.sender === 'system' ? 'var(--danger)' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                  fontSize: '12.5px'
                }}>
                  {renderMessageText(msg.text)}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Chat controls */}
          <div style={{ 
            padding: '6px 10px', 
            borderTop: '1px solid var(--border-color)', 
            display: 'flex', 
            justifyContent: 'flex-end',
            backgroundColor: 'var(--bg-sidebar)',
            flexShrink: 0
          }}>
            <button 
              className="btn" 
              onClick={clearChat} 
              title="清空聊天對話"
              style={{ padding: '3px 8px', fontSize: '11px' }}
            >
              <Trash size={12} /> 清空歷史
            </button>
          </div>

          {/* Chat Input form panel */}
          <div style={{ 
            padding: '10px', 
            borderTop: '1px solid var(--border-color)', 
            backgroundColor: 'var(--bg-secondary)',
            flexShrink: 0
          }}>
            {/* Context Attachment Indicator */}
            {currentNotePath && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                fontSize: '11px', 
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                backgroundColor: 'var(--border-color)',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
                  <Paperclip size={11} style={{ flexShrink: 0 }} />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    工作區上下文: {currentNotePath.split('/').pop()}
                  </span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', flexShrink: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={includeContext} 
                    onChange={() => setIncludeContext(!includeContext)} 
                  />
                  附加內容
                </label>
              </div>
            )}

            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder={status === 'connected' ? "詢問關於此筆記的問題..." : "輸入訊息對話 (Gemini API 展示模式)..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isSending}
                style={{ flex: 1, padding: '6px 10px', height: '34px', fontSize: '12.5px' }}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={!inputValue.trim() || isSending}
                style={{ padding: '6px 10px', height: '34px', width: '38px' }}
              >
                <Send size={14} />
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
