import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Code, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Columns, 
  Eye, 
  Edit3, 
  Grid, 
  Sparkles
} from 'lucide-react';
import { marked } from 'marked';

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSaved: boolean;
  viewMode: 'edit' | 'preview' | 'split';
  setViewMode: (mode: 'edit' | 'preview' | 'split') => void;
}

export const Editor: React.FC<EditorProps> = ({
  content,
  onChange,
  onSave,
  isSaved,
  viewMode,
  setViewMode,
}) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashCoords, setSlashCoords] = useState({ top: 0, left: 0 });
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);

  // Custom parser to handle Obsidian/GitHub style callouts
  const parseMarkdown = async (mdText: string) => {
    let processed = mdText;
    
    // We can do line-by-line parsing for blockquotes to build nice callouts.
    const lines = mdText.split('\n');
    let inBlockquote = false;
    let currentCalloutType = '';
    let currentCalloutContent: string[] = [];
    const newLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^>\s*\[!(NOTE|INFO|TIP|SUCCESS|IMPORTANT|WARNING|CAUTION|DANGER|ALERT)\](.*)/i);

      if (match) {
        inBlockquote = true;
        currentCalloutType = match[1].toUpperCase();
        const firstLineContent = match[2].trim();
        currentCalloutContent = firstLineContent ? [firstLineContent] : [];
      } else if (inBlockquote && line.startsWith('>')) {
        const contentLine = line.substring(1).trim();
        currentCalloutContent.push(contentLine);
      } else {
        if (inBlockquote) {
          // Wrap callout block in custom HTML
          let emoji = '💡';
          let className = 'note';
          if (['TIP', 'SUCCESS'].includes(currentCalloutType)) {
            emoji = '✨';
            className = 'success';
          } else if (['IMPORTANT', 'WARNING', 'CAUTION'].includes(currentCalloutType)) {
            emoji = '⚠️';
            className = 'warning';
          } else if (['DANGER', 'ALERT'].includes(currentCalloutType)) {
            emoji = '🛑';
            className = 'danger';
          }

          newLines.push(`<div class="callout-block ${className}">
  <span class="callout-icon">${emoji}</span>
  <div class="callout-content">
    <strong>${currentCalloutType}</strong><br/>
    ${currentCalloutContent.join('<br/>')}
  </div>
</div>`);
          inBlockquote = false;
        }
        newLines.push(line);
      }
    }
    
    // Catch trailing open blockquote
    if (inBlockquote) {
      let emoji = '💡';
      let className = 'note';
      if (['TIP', 'SUCCESS'].includes(currentCalloutType)) {
        emoji = '✨';
        className = 'success';
      } else if (['IMPORTANT', 'WARNING', 'CAUTION'].includes(currentCalloutType)) {
        emoji = '⚠️';
        className = 'warning';
      } else if (['DANGER', 'ALERT'].includes(currentCalloutType)) {
        emoji = '🛑';
        className = 'danger';
      }
      newLines.push(`<div class="callout-block ${className}">
  <span class="callout-icon">${emoji}</span>
  <div class="callout-content">
    <strong>${currentCalloutType}</strong><br/>
    ${currentCalloutContent.join('<br/>')}
  </div>
</div>`);
    }

    processed = newLines.join('\n');

    try {
      const html = await marked.parse(processed);
      setHtmlContent(html);
    } catch (e) {
      console.error('Markdown rendering error', e);
      setHtmlContent(`<pre>${mdText}</pre>`);
    }
  };

  useEffect(() => {
    parseMarkdown(content);
  }, [content]);

  // Insert markdown tag at cursor
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const selected = text.substring(start, end);
    const replacement = before + selected + after;
    
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    // Reset cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  // Slash commands data in Traditional Chinese
  const slashCommands = [
    { label: '大標題', desc: '大型區塊標題 (H1)', before: '# ', after: '', icon: 'H1' },
    { label: '中標題', desc: '中型區塊標題 (H2)', before: '## ', after: '', icon: 'H2' },
    { label: '小標題', desc: '小型區塊標題 (H3)', before: '### ', after: '', icon: 'H3' },
    { label: '待辦清單', desc: '待辦事項勾選項目', before: '- [ ] ', after: '', icon: 'Todo' },
    { label: '項目清單', desc: '無序符號項目清單', before: '- ', after: '', icon: '清單' },
    { label: '提醒框', desc: 'Notion 風格的高亮提醒框', before: '> [!NOTE]\n> 請輸入提示文字...', after: '', icon: '提醒' },
    { label: '程式碼區塊', desc: '支援程式碼高亮的區塊', before: '```javascript\n', after: '\n```', icon: '代碼' },
    { label: '表格', desc: '網格式表格格式排版', before: '| 欄位 1 | 欄位 2 |\n| -------- | -------- |\n| 資料 1   | 資料 2   |', after: '', icon: '表格' },
  ];

  const filteredCommands = slashCommands.filter(c => 
    c.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
    c.desc.toLowerCase().includes(slashQuery.toLowerCase())
  );

  // Handle keys in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Save shortcut: Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
      return;
    }

    if (showSlashMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSlashIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSlashIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedSlashIndex]) {
          executeSlashCommand(filteredCommands[selectedSlashIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowSlashMenu(false);
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onChange(value);

    // Slash command trigger check
    const selectionEnd = e.target.selectionEnd;
    const textBeforeCursor = value.substring(0, selectionEnd);
    const lastSlashIdx = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIdx !== -1 && lastSlashIdx >= textBeforeCursor.lastIndexOf('\n')) {
      const query = textBeforeCursor.substring(lastSlashIdx + 1);
      if (!query.includes(' ')) {
        // Show slash menu at cursor coordinates
        setSlashQuery(query);
        setShowSlashMenu(true);
        setSelectedSlashIndex(0);

        const textarea = textareaRef.current;
        if (textarea) {
          const lines = textBeforeCursor.split('\n');
          const currentLineNum = lines.length;
          const currentColNum = lines[lines.length - 1].length;
          
          setSlashCoords({
            top: Math.min(textarea.clientHeight - 150, currentLineNum * 20 + 20),
            left: Math.min(textarea.clientWidth - 200, currentColNum * 8 + 20)
          });
        }
        return;
      }
    }
    
    setShowSlashMenu(false);
  };

  const executeSlashCommand = (cmd: typeof slashCommands[0]) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const textBeforeCursor = text.substring(0, start);
    const lastSlashIdx = textBeforeCursor.lastIndexOf('/');

    // Replace the slash and the query with the command text
    const newValue = text.substring(0, lastSlashIdx) + cmd.before + text.substring(end);
    onChange(newValue);
    setShowSlashMenu(false);

    // Focus and position cursor
    setTimeout(() => {
      textarea.focus();
      const newPos = lastSlashIdx + cmd.before.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Close slash menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node)) {
        setShowSlashMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
      {/* Editor Toolbar */}
      <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid var(--border-color)', height: '40px', flexShrink: 0 }}>
        {/* Formatting actions */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="theme-toggle-btn" onClick={() => insertMarkdown('**', '**')} title="粗體"><Bold size={15} /></button>
          <button className="theme-toggle-btn" onClick={() => insertMarkdown('*', '*')} title="斜體"><Italic size={15} /></button>
          <button className="theme-toggle-btn" onClick={() => insertMarkdown('`', '`')} title="程式碼"><Code size={15} /></button>
          <button className="theme-toggle-btn" onClick={() => insertMarkdown('[', '](網址)')} title="連結"><LinkIcon size={15} /></button>
          <button className="theme-toggle-btn" onClick={() => insertMarkdown('- ')} title="清單"><List size={15} /></button>
          <button className="theme-toggle-btn" onClick={() => insertMarkdown('1. ')} title="有序清單"><ListOrdered size={15} /></button>
          <button className="theme-toggle-btn" onClick={() => insertMarkdown('- [ ] ')} title="待辦清單"><CheckSquare size={15} /></button>
          <button className="theme-toggle-btn" onClick={() => insertMarkdown('| 欄位 | 欄位 |\n| --- | --- |\n| 資料 | 資料 |')} title="表格"><Grid size={15} /></button>
          <button className="theme-toggle-btn" onClick={() => insertMarkdown('> [!NOTE]\n> ')} title="提醒框"><Sparkles size={15} /></button>
        </div>

        {/* View mode toggle */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: isSaved ? 'var(--text-secondary)' : 'var(--warning)', marginRight: '8px' }}>
            {isSaved ? '已儲存至本地' : '未儲存變更 (Ctrl+S)'}
          </span>
          <button 
            className={`theme-toggle-btn ${viewMode === 'edit' ? 'active' : ''}`}
            onClick={() => setViewMode('edit')}
            title="編輯模式"
            style={{ backgroundColor: viewMode === 'edit' ? 'var(--border-color)' : 'transparent', padding: '4px' }}
          >
            <Edit3 size={15} />
          </button>
          <button 
            className={`theme-toggle-btn ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode('split')}
            title="雙欄模式"
            style={{ backgroundColor: viewMode === 'split' ? 'var(--border-color)' : 'transparent', padding: '4px' }}
          >
            <Columns size={15} />
          </button>
          <button 
            className={`theme-toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
            title="預覽模式"
            style={{ backgroundColor: viewMode === 'preview' ? 'var(--border-color)' : 'transparent', padding: '4px' }}
          >
            <Eye size={15} />
          </button>
        </div>
      </div>

      {/* Editor + Preview Split Workspace */}
      <div className="editor-panel">
        {/* Editor Area */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="editor-pane" style={{ flex: 1 }}>
            <textarea
              ref={textareaRef}
              className="markdown-textarea"
              value={content}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="開始撰寫筆記... (輸入 '/' 喚出 Notion 快選指令)"
            />

            {/* Notion style Slash Suggestion Popover */}
            {showSlashMenu && filteredCommands.length > 0 && (
              <div 
                ref={slashMenuRef}
                className="slash-suggestions"
                style={{ top: `${slashCoords.top}px`, left: `${slashCoords.left}px` }}
              >
                {filteredCommands.map((cmd, idx) => (
                  <div
                    key={cmd.label}
                    className={`slash-item ${idx === selectedSlashIndex ? 'selected' : ''}`}
                    onClick={() => executeSlashCommand(cmd)}
                  >
                    <div style={{ fontWeight: '600', padding: '2px 6px', backgroundColor: 'var(--border-color)', borderRadius: '4px', fontSize: '11px' }}>
                      {cmd.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500' }}>{cmd.label}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>{cmd.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Preview Area */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="preview-pane" style={{ flex: 1 }}>
            <div className="preview-pane-inner">
              <div 
                className="rendered-markdown" 
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
