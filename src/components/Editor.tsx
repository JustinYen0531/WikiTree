import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Code, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Minus,
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
  viewMode: 'wysiwyg' | 'source' | 'split';
  setViewMode: (mode: 'wysiwyg' | 'source' | 'split') => void;
  onEditSelection?: (text: string, applyFn: (replacement: string) => void) => void;
}

interface Block {
  id: string;
  type: 'header1' | 'header2' | 'header3' | 'list' | 'todo' | 'code' | 'callout' | 'table' | 'hr' | 'paragraph';
  raw: string;
}

export const Editor: React.FC<EditorProps> = ({
  content,
  onChange,
  onSave,
  isSaved,
  viewMode,
  setViewMode,
  onEditSelection,
}) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashCoords, setSlashCoords] = useState({ top: 0, left: 0 });
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);

  // WYSIWYG block states
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const hasAutoFocused = useRef(false);

  // Groq inline edit — chip only; response handled in AI side panel
  const [groqSel, setGroqSel] = useState<{ start: number; end: number; text: string } | null>(null);
  const [groqPos, setGroqPos] = useState({ x: 0, y: 0 });
  const [groqBlockIdx, setGroqBlockIdx] = useState<number | null>(null);

  const handleTextareaMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: en } = ta;
    if (s === en) { setGroqSel(null); return; }
    setGroqSel({ start: s, end: en, text: ta.value.slice(s, en) });
    setGroqBlockIdx(null);
    setGroqPos({ x: e.clientX, y: e.clientY });
  };

  const handleWysiwygMouseUp = (e: React.MouseEvent) => {
    const el = document.activeElement as HTMLTextAreaElement;
    if (!el || el.tagName !== 'TEXTAREA') { setGroqSel(null); return; }
    const { selectionStart: s, selectionEnd: en } = el;
    if (s === en) { setGroqSel(null); return; }
    const blockIdx = blockRefs.current.findIndex(ref => ref === el);
    if (blockIdx === -1) return;
    setGroqSel({ start: s, end: en, text: el.value.slice(s, en) });
    setGroqBlockIdx(blockIdx);
    setGroqPos({ x: e.clientX, y: e.clientY });
  };

  const handleGroqChipClick = () => {
    if (!groqSel || !onEditSelection) return;
    const s = groqSel.start;
    const en = groqSel.end;
    const blockIdx = groqBlockIdx;
    const applyFn = (replacement: string) => {
      if (blockIdx !== null) {
        const ta = blockRefs.current[blockIdx];
        if (!ta) return;

        const mergedDisplay = ta.value.slice(0, s) + replacement + ta.value.slice(en);
        applyMarkdownToBlock(blockIdx, mergedDisplay);
      } else {
        const current = textareaRef.current?.value ?? content;
        onChange(current.slice(0, s) + replacement + current.slice(en));
      }
    };
    onEditSelection(groqSel.text, applyFn);
    setGroqSel(null);
  };

  const isHorizontalRule = (value: string) => /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(value);

  // Parse raw markdown string into blocks
  const parseMarkdownToBlocks = (markdown: string): Block[] => {
    if (!markdown) {
      return [{ id: 'init-block', type: 'paragraph', raw: '' }];
    }
    const lines = markdown.split('\n');
    const parsedBlocks: Block[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code blocks
      if (line.trim().startsWith('```')) {
        let rawCode = line;
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          rawCode += '\n' + lines[i];
          i++;
        }
        if (i < lines.length) {
          rawCode += '\n' + lines[i];
          i++;
        }
        parsedBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: 'code', raw: rawCode });
        continue;
      }

      // Callouts / Blockquotes
      if (line.trim().startsWith('>')) {
        let rawCallout = line;
        i++;
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          rawCallout += '\n' + lines[i];
          i++;
        }
        parsedBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: 'callout', raw: rawCallout });
        continue;
      }

      // Tables
      if (line.trim().startsWith('|')) {
        let rawTable = line;
        i++;
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          rawTable += '\n' + lines[i];
          i++;
        }
        parsedBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: 'table', raw: rawTable });
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        parsedBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: 'header1', raw: line });
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        parsedBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: 'header2', raw: line });
        i++;
        continue;
      }
      if (line.startsWith('### ')) {
        parsedBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: 'header3', raw: line });
        i++;
        continue;
      }

      // Horizontal rules
      if (isHorizontalRule(line)) {
        parsedBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: 'hr', raw: line });
        i++;
        continue;
      }

      // Todo List
      if (line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]')) {
        parsedBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: 'todo', raw: line });
        i++;
        continue;
      }

      // Bulleted lists
      if (/^\s*[-*+]\s+/.test(line)) {
        parsedBlocks.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'list',
          raw: line.replace(/^\s*[-*+]\s+/, '- '),
        });
        i++;
        continue;
      }

      // Default: Paragraph
      parsedBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: 'paragraph', raw: line });
      i++;
    }

    return parsedBlocks;
  };

  const blocksToMarkdown = (blockArr: Block[]): string => {
    return blockArr.map(b => b.raw).join('\n');
  };

  const looksLikeMarkdownPaste = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    return text.includes('\n') || /(^|\n)\s*(#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|-\s*\[[ x]\]\s+|```|>\s+|\|.*\||-{3,}\s*$|\*{3,}\s*$|_{3,}\s*$)/m.test(text);
  };

  const displayValueToRaw = (block: Block, displayVal: string) => {
    const prefixMap: Partial<Record<Block['type'], string>> = {
      header1: '# ',
      header2: '## ',
      header3: '### ',
      list: '- ',
    };
    const prefix = prefixMap[block.type];
    if (prefix) return prefix + displayVal;
    if (block.type === 'todo') {
      const todoPrefix = block.raw.includes('- [x]') ? '- [x] ' : '- [ ] ';
      return todoPrefix + displayVal;
    }
    return displayVal;
  };

  const applyMarkdownToBlock = (index: number, displayVal: string) => {
    if (!looksLikeMarkdownPaste(displayVal)) {
      handleBlockInputChange(index, displayVal);
      return;
    }

    const mergedRaw = displayValueToRaw(blocks[index], displayVal);
    const parsedBlocks = parseMarkdownToBlocks(mergedRaw);
    const nextBlocks = [...blocks];

    nextBlocks.splice(index, 1, ...parsedBlocks);
    updateContentFromBlocks(nextBlocks);
    setFocusedBlockIndex(index);
    setTimeout(() => blockRefs.current[index]?.focus(), 0);
  };

  const handleBlockPaste = (index: number, e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text/plain');
    if (!looksLikeMarkdownPaste(pasted)) return;

    e.preventDefault();

    const textarea = e.currentTarget;
    const before = textarea.value.slice(0, textarea.selectionStart);
    const after = textarea.value.slice(textarea.selectionEnd);
    applyMarkdownToBlock(index, before + pasted + after);
  };

  // Sync prop changes to local blocks, but ONLY when not editing or if external change occurs
  useEffect(() => {
    const currentMd = blocksToMarkdown(blocks);
    if (content !== currentMd) {
      const newBlocks = parseMarkdownToBlocks(content);
      setBlocks(newBlocks);
      // Auto-focus first block on initial load
      if (!hasAutoFocused.current && viewMode === 'wysiwyg') {
        hasAutoFocused.current = true;
        setTimeout(() => setFocusedBlockIndex(0), 30);
      }
    }
  }, [content]);

  // Save blocks back to content
  const updateContentFromBlocks = (newBlocks: Block[]) => {
    setBlocks(newBlocks);
    onChange(blocksToMarkdown(newBlocks));
  };

  // Auto-focus active block in WYSIWYG mode
  useEffect(() => {
    if (focusedBlockIndex !== null && blockRefs.current[focusedBlockIndex]) {
      blockRefs.current[focusedBlockIndex]?.focus();
    }
  }, [focusedBlockIndex]);

  // Custom parser to handle Obsidian/GitHub style callouts for full preview pane
  const parseMarkdown = async (mdText: string) => {
    let processed = mdText;
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

  // Insert markdown tag at cursor (for Source / Split mode)
  const insertMarkdown = (before: string, after: string = '') => {
    if (viewMode === 'wysiwyg') {
      if (focusedBlockIndex !== null) {
        const textarea = blockRefs.current[focusedBlockIndex];
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);
        const replacement = before + selected + after;
        const newValue = text.substring(0, start) + replacement + text.substring(end);
        handleBlockChange(focusedBlockIndex, newValue);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
        }, 0);
      } else {
        // Append to the last block
        const newBlocks = [...blocks];
        const lastIndex = newBlocks.length - 1;
        newBlocks[lastIndex].raw += before + after;
        updateContentFromBlocks(newBlocks);
        setFocusedBlockIndex(lastIndex);
      }
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const selected = text.substring(start, end);
    const replacement = before + selected + after;
    
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  // Slash commands
  const slashCommands = [
    { label: '大標題', desc: '大型區塊標題 (H1)', before: '# ', after: '', icon: 'H1' },
    { label: '中標題', desc: '中型區塊標題 (H2)', before: '## ', after: '', icon: 'H2' },
    { label: '小標題', desc: '小型區塊標題 (H3)', before: '### ', after: '', icon: 'H3' },
    { label: '待辦清單', desc: '待辦事項勾選項目', before: '- [ ] ', after: '', icon: 'Todo' },
    { label: '項目清單', desc: '無序符號項目清單', before: '- ', after: '', icon: '清單' },
    { label: '提醒框', desc: 'Notion 風格的高亮提醒框', before: '> [!NOTE]\n> 請輸入提示文字...', after: '', icon: '提醒' },
    { label: '程式碼區塊', desc: '支援程式碼高亮的區塊', before: '```javascript\n', after: '\n```', icon: '代碼' },
    { label: '表格', desc: '網格式表格格式排版', before: '| 欄位 1 | 欄位 2 |\n| -------- | -------- |\n| 資料 1   | 資料 2   |', after: '', icon: '表格' },
    { label: '分隔線', desc: '插入水平分隔線', before: '---', after: '', icon: '---' },
  ];

  const filteredCommands = slashCommands.filter(c => 
    c.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
    c.desc.toLowerCase().includes(slashQuery.toLowerCase())
  );

  // Keyboard navigation for textareas
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  const handleBlockKeyDown = (index: number, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const value = textarea.value;
    const selectionStart = textarea.selectionStart;

    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
      return;
    }

    if (showSlashMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSlashIndex(prev => (prev + 1) % filteredCommands.length);
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSlashIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedSlashIndex]) {
          executeBlockSlashCommand(index, filteredCommands[selectedSlashIndex]);
        }
        return;
      } else if (e.key === 'Escape') {
        setShowSlashMenu(false);
        return;
      }
    }

    // 1. Enter Key: Split block
    if (e.key === 'Enter') {
      if (e.shiftKey || blocks[index].type === 'code') {
        return; 
      }
      
      e.preventDefault();
      const textBefore = value.substring(0, selectionStart);
      const textAfter = value.substring(selectionStart);
      
      const newBlocks = [...blocks];
      newBlocks[index].raw = displayValueToRaw(blocks[index], textBefore);
      
      // Inherit prefixes
      let newRaw = textAfter;
      let newType: Block['type'] = 'paragraph';
      
      if (blocks[index].type === 'todo') {
        newRaw = '- [ ] ' + textAfter;
        newType = 'todo';
      } else if (blocks[index].type === 'list' || /^[-*+]\s+/.test(blocks[index].raw)) {
        newRaw = '- ' + textAfter;
        newType = 'list';
      } else if (blocks[index].raw.startsWith('> ')) {
        newRaw = '> ' + textAfter;
        newType = 'callout';
      }

      newBlocks.splice(index + 1, 0, {
        id: Math.random().toString(36).substr(2, 9),
        type: newType,
        raw: newRaw
      });
      
      updateContentFromBlocks(newBlocks);
      setFocusedBlockIndex(index + 1);
      return;
    }

    // 2. Backspace Key: Merge block
    if (e.key === 'Backspace' && selectionStart === 0) {
      e.preventDefault();
      if (index === 0) return;

      const prevBlock = blocks[index - 1];
      // Use display value (no prefix) so "# Title" merges as "Title" not "# Title"
      const currentRaw = getBlockDisplayValue(blocks[index]);
      const prevLength = getBlockDisplayValue(prevBlock).length;

      const newBlocks = [...blocks];
      newBlocks[index - 1].raw = prevBlock.raw + currentRaw;
      newBlocks.splice(index, 1);
      
      updateContentFromBlocks(newBlocks);
      setFocusedBlockIndex(index - 1);
      
      setTimeout(() => {
        const ta = blockRefs.current[index - 1];
        if (ta) {
          ta.setSelectionRange(prevLength, prevLength);
        }
      }, 0);
      return;
    }

    // 3. Arrow Up
    if (e.key === 'ArrowUp' && selectionStart === 0) {
      e.preventDefault();
      if (index > 0) {
        setFocusedBlockIndex(index - 1);
        setTimeout(() => {
          const ta = blockRefs.current[index - 1];
          if (ta) {
            const len = ta.value.length;
            ta.setSelectionRange(len, len);
          }
        }, 0);
      }
      return;
    }

    // 4. Arrow Down
    if (e.key === 'ArrowDown' && selectionStart === value.length) {
      e.preventDefault();
      if (index < blocks.length - 1) {
        setFocusedBlockIndex(index + 1);
        setTimeout(() => {
          const ta = blockRefs.current[index + 1];
          if (ta) {
            ta.setSelectionRange(0, 0);
          }
        }, 0);
      }
      return;
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onChange(value);

    const selectionEnd = e.target.selectionEnd;
    const textBeforeCursor = value.substring(0, selectionEnd);
    const lastSlashIdx = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIdx !== -1 && lastSlashIdx >= textBeforeCursor.lastIndexOf('\n')) {
      const query = textBeforeCursor.substring(lastSlashIdx + 1);
      if (!query.includes(' ')) {
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

  const handleBlockChange = (index: number, val: string) => {
    const newBlocks = [...blocks];
    newBlocks[index].raw = val;
    
    if (val.startsWith('# ')) newBlocks[index].type = 'header1';
    else if (val.startsWith('## ')) newBlocks[index].type = 'header2';
    else if (val.startsWith('### ')) newBlocks[index].type = 'header3';
    else if (val.trim().startsWith('- [ ]') || val.trim().startsWith('- [x]')) newBlocks[index].type = 'todo';
    else if (/^\s*[-*+]\s+/.test(val)) newBlocks[index].type = 'list';
    else if (val.trim().startsWith('```')) newBlocks[index].type = 'code';
    else if (val.trim().startsWith('>')) newBlocks[index].type = 'callout';
    else if (val.trim().startsWith('|')) newBlocks[index].type = 'table';
    else if (isHorizontalRule(val)) newBlocks[index].type = 'hr';
    else newBlocks[index].type = 'paragraph';

    updateContentFromBlocks(newBlocks);

    // Slash command trigger check
    const selectionEnd = blockRefs.current[index]?.selectionEnd || 0;
    const textBeforeCursor = val.substring(0, selectionEnd);
    const lastSlashIdx = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIdx !== -1 && lastSlashIdx >= textBeforeCursor.lastIndexOf('\n')) {
      const query = textBeforeCursor.substring(lastSlashIdx + 1);
      if (!query.includes(' ')) {
        setSlashQuery(query);
        setShowSlashMenu(true);
        setSelectedSlashIndex(0);
        
        const ta = blockRefs.current[index];
        if (ta) {
          const rect = ta.getBoundingClientRect();
          const parentRect = ta.offsetParent?.getBoundingClientRect();
          setSlashCoords({
            top: rect.top - (parentRect?.top || 0) + 24,
            left: Math.min(rect.width - 200, selectionEnd * 8 + 10)
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

    const newValue = text.substring(0, lastSlashIdx) + cmd.before + text.substring(end);
    onChange(newValue);
    setShowSlashMenu(false);

    setTimeout(() => {
      textarea.focus();
      const newPos = lastSlashIdx + cmd.before.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const executeBlockSlashCommand = (index: number, cmd: typeof slashCommands[0]) => {
    const textarea = blockRefs.current[index];
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const textBeforeCursor = text.substring(0, start);
    const lastSlashIdx = textBeforeCursor.lastIndexOf('/');

    const newRaw = text.substring(0, lastSlashIdx) + cmd.before + text.substring(end);
    
    const newBlocks = [...blocks];
    newBlocks[index].raw = newRaw;
    
    if (cmd.before.startsWith('# ')) newBlocks[index].type = 'header1';
    else if (cmd.before.startsWith('## ')) newBlocks[index].type = 'header2';
    else if (cmd.before.startsWith('### ')) newBlocks[index].type = 'header3';
    else if (cmd.before.startsWith('- [ ]')) newBlocks[index].type = 'todo';
    else if (cmd.before.startsWith('```')) newBlocks[index].type = 'code';
    else if (cmd.before.startsWith('>')) newBlocks[index].type = 'callout';
    else if (cmd.before.startsWith('|')) newBlocks[index].type = 'table';
    else if (isHorizontalRule(cmd.before)) newBlocks[index].type = 'hr';
    
    updateContentFromBlocks(newBlocks);
    setShowSlashMenu(false);

    setTimeout(() => {
      textarea.focus();
      const newPos = lastSlashIdx + cmd.before.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const stripInlineMarkdownForDisplay = (value: string) =>
    value
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '$1')
      .replace(/(?<!_)_([^_\n]+)_(?!_)/g, '$1');

  // Return the text shown in the textarea (strips structural markdown prefixes)
  const getBlockDisplayValue = (block: Block): string => {
    switch (block.type) {
      case 'header1': return stripInlineMarkdownForDisplay(block.raw.replace(/^#\s*/, ''));
      case 'header2': return stripInlineMarkdownForDisplay(block.raw.replace(/^##\s*/, ''));
      case 'header3': return stripInlineMarkdownForDisplay(block.raw.replace(/^###\s*/, ''));
      case 'list': return stripInlineMarkdownForDisplay(block.raw.replace(/^\s*[-*+]\s+/, ''));
      default: return stripInlineMarkdownForDisplay(block.raw);
    }
  };

  const getBlockPlaceholder = (block: Block, index: number, totalBlocks: number): string => {
    switch (block.type) {
      case 'header1': return '大標題...';
      case 'header2': return '中標題...';
      case 'header3': return '小標題...';
      case 'todo': return '待辦事項...';
      case 'code': return '```language\ncode...\n```';
      default: 
        return index === totalBlocks - 1 
          ? '輸入文字，或輸入「/」插入區塊...' 
          : '';
    }
  };

  // Handle WYSIWYG block textarea input with Notion-style markdown shortcuts
  const handleBlockInputChange = (index: number, displayVal: string) => {
    const currentType = blocks[index].type;

    if (currentType === 'paragraph') {
      // Notion-style shortcuts: when typing a markdown prefix, convert block type
      if (displayVal === '# ') { handleBlockChange(index, '# '); return; }
      if (displayVal === '## ') { handleBlockChange(index, '## '); return; }
      if (displayVal === '### ') { handleBlockChange(index, '### '); return; }
      if (displayVal === '- ') { handleBlockChange(index, '- '); return; }
      if (displayVal === '* ') { handleBlockChange(index, '- '); return; }
      if (displayVal === '+ ') { handleBlockChange(index, '- '); return; }
      if (displayVal === '- [ ] ') { handleBlockChange(index, '- [ ] '); return; }
      handleBlockChange(index, displayVal);
      return;
    }

    // For header blocks: re-attach the stripped prefix before storing
    const prefixMap: Record<string, string> = {
      header1: '# ',
      header2: '## ',
      header3: '### ',
    };
    const prefix = prefixMap[currentType];
    if (prefix) {
      handleBlockChange(index, prefix + displayVal);
    } else {
      handleBlockChange(index, displayVal);
    }
  };

  const handleCheckboxToggle = (index: number, _e?: any) => {
    const newBlocks = [...blocks];
    const raw = newBlocks[index].raw;
    if (raw.includes('- [ ]')) {
      newBlocks[index].raw = raw.replace('- [ ]', '- [x]');
    } else if (raw.includes('- [x]')) {
      newBlocks[index].raw = raw.replace('- [x]', '- [ ]');
    }
    updateContentFromBlocks(newBlocks);
  };

  // Render block content to beautiful HTML
  const renderBlockToHtml = (block: Block): string => {
    if (!block.raw.trim()) {
      return `<p class="wysiwyg-placeholder" style="color: var(--text-secondary); opacity: 0.5; font-style: italic;">點擊此處輸入文字...</p>`;
    }

    if (block.type === 'hr') {
      return '<hr />';
    }

    let processed = block.raw;
    
    // Support Notion Callout rendering within blocks
    if (block.type === 'callout') {
      const lines = block.raw.split('\n');
      let emoji = '💡';
      let className = 'note';
      let calloutType = 'NOTE';
      
      const firstLine = lines[0] || '';
      const match = firstLine.match(/^>\s*\[!(NOTE|INFO|TIP|SUCCESS|IMPORTANT|WARNING|CAUTION|DANGER|ALERT)\](.*)/i);
      
      if (match) {
        calloutType = match[1].toUpperCase();
        const firstLineContent = match[2].trim();
        const otherLines = lines.slice(1).map(l => l.replace(/^>\s?/, '').trim());
        const calloutContent = firstLineContent ? [firstLineContent, ...otherLines] : otherLines;
        
        if (['TIP', 'SUCCESS'].includes(calloutType)) {
          emoji = '✨';
          className = 'success';
        } else if (['IMPORTANT', 'WARNING', 'CAUTION'].includes(calloutType)) {
          emoji = '⚠️';
          className = 'warning';
        } else if (['DANGER', 'ALERT'].includes(calloutType)) {
          emoji = '🛑';
          className = 'danger';
        }
        
        return `<div class="callout-block ${className}">
          <span class="callout-icon">${emoji}</span>
          <div class="callout-content">
            <strong>${calloutType}</strong><br/>
            ${calloutContent.join('<br/>')}
          </div>
        </div>`;
      }
    }

    try {
      return marked.parse(processed) as string;
    } catch (e) {
      return `<p>${block.raw}</p>`;
    }
  };

  const getBlockFontSize = (type: Block['type']) => {
    switch (type) {
      case 'header1': return '28px';
      case 'header2': return '22px';
      case 'header3': return '18px';
      default: return '15px';
    }
  };

  const getBlockFontWeight = (type: Block['type']) => {
    if (type.startsWith('header')) return '700';
    return '400';
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node)) {
        setShowSlashMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (viewMode !== 'wysiwyg') return;

    blockRefs.current.forEach((textarea) => {
      if (!textarea) return;
      textarea.style.height = '0px';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }, [blocks, viewMode]);

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
          <button className="theme-toggle-btn" onClick={() => insertMarkdown('\n---\n')} title="分隔線"><Minus size={15} /></button>
        </div>

        {/* View mode toggle */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: isSaved ? 'var(--text-secondary)' : 'var(--warning)', marginRight: '8px' }}>
            {isSaved ? '已儲存至本地' : '未儲存變更 (Ctrl+S)'}
          </span>
          <button 
            className={`theme-toggle-btn ${viewMode === 'wysiwyg' ? 'active' : ''}`}
            onClick={() => setViewMode('wysiwyg')}
            title="即時網頁編輯 (Live Edit)"
            style={{ backgroundColor: viewMode === 'wysiwyg' ? 'var(--border-color)' : 'transparent', padding: '4px' }}
          >
            <Sparkles size={15} />
          </button>
          <button 
            className={`theme-toggle-btn ${viewMode === 'source' ? 'active' : ''}`}
            onClick={() => setViewMode('source')}
            title="原始碼模式 (Source)"
            style={{ backgroundColor: viewMode === 'source' ? 'var(--border-color)' : 'transparent', padding: '4px' }}
          >
            <Edit3 size={15} />
          </button>
          <button 
            className={`theme-toggle-btn ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode('split')}
            title="雙欄模式 (Split)"
            style={{ backgroundColor: viewMode === 'split' ? 'var(--border-color)' : 'transparent', padding: '4px' }}
          >
            <Columns size={15} />
          </button>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {viewMode === 'wysiwyg' ? (
          /* NOTION-STYLE INLINE WYSIWYG EDITOR */
          <div
            className="wysiwyg-editor-canvas"
            onMouseUp={handleWysiwygMouseUp}
            style={{
              flex: 1,
              padding: '40px 60px',
              overflowY: 'auto',
              overflowX: 'hidden',
              backgroundColor: 'var(--bg-primary)',
              cursor: 'text'
            }}
          >
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  style={{ position: 'relative', minHeight: '26px' }}
                >
                  {block.type === 'hr' ? (
                    <div
                      onClick={() => {
                        setFocusedBlockIndex(index);
                        setTimeout(() => blockRefs.current[index]?.focus(), 0);
                      }}
                      style={{ position: 'relative', minHeight: '34px', padding: '8px 0', cursor: 'text' }}
                    >
                      {focusedBlockIndex === index ? (
                        <textarea
                          className="block-textarea"
                          ref={(el) => { blockRefs.current[index] = el; }}
                          value={getBlockDisplayValue(block)}
                          onChange={(e) => handleBlockInputChange(index, e.target.value)}
                          onPaste={(e) => handleBlockPaste(index, e)}
                          onKeyDown={(e) => handleBlockKeyDown(index, e)}
                          onFocus={() => setFocusedBlockIndex(index)}
                          onBlur={() => {
                            setFocusedBlockIndex(null);
                            setTimeout(() => setShowSlashMenu(false), 180);
                          }}
                          rows={1}
                          placeholder={getBlockPlaceholder(block, index, blocks.length)}
                          style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            resize: 'none',
                            background: 'transparent',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '15px',
                            color: 'var(--text-secondary)',
                            padding: '0',
                            margin: 0,
                            lineHeight: '1.4',
                            overflow: 'hidden',
                          }}
                        />
                      ) : (
                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
                      )}
                    </div>
                  ) : block.type === 'callout' ? (
                    <div
                      onClick={() => {
                        setFocusedBlockIndex(index);
                        setTimeout(() => blockRefs.current[index]?.focus(), 0);
                      }}
                      style={{ cursor: 'text' }}
                    >
                      {focusedBlockIndex === index ? (
                        <textarea
                          className="block-textarea"
                          ref={(el) => { blockRefs.current[index] = el; }}
                          value={block.raw}
                          onChange={(e) => handleBlockInputChange(index, e.target.value)}
                          onPaste={(e) => handleBlockPaste(index, e)}
                          onKeyDown={(e) => handleBlockKeyDown(index, e)}
                          onFocus={() => setFocusedBlockIndex(index)}
                          onBlur={() => { setFocusedBlockIndex(null); setTimeout(() => setShowSlashMenu(false), 180); }}
                          rows={Math.max(2, block.raw.split('\n').length)}
                          style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            resize: 'none',
                            background: 'transparent',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '14px',
                            color: 'var(--text-secondary)',
                            padding: '4px 0',
                            margin: 0,
                            lineHeight: '1.6',
                            overflow: 'hidden',
                          }}
                        />
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: renderBlockToHtml(block) }} />
                      )}
                    </div>
                  ) : block.type === 'list' ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '2px 0' }}>
                      <span style={{
                        width: '16px',
                        marginTop: '6px',
                        color: 'var(--text-primary)',
                        textAlign: 'center',
                        flexShrink: 0,
                        lineHeight: 1,
                      }}>
                        •
                      </span>
                      <textarea
                        className="block-textarea"
                        ref={(el) => { blockRefs.current[index] = el; }}
                        value={getBlockDisplayValue(block)}
                        onChange={(e) => handleBlockInputChange(index, e.target.value)}
                        onPaste={(e) => handleBlockPaste(index, e)}
                        onKeyDown={(e) => handleBlockKeyDown(index, e)}
                        onFocus={() => setFocusedBlockIndex(index)}
                        onBlur={() => setTimeout(() => setShowSlashMenu(false), 180)}
                        rows={Math.max(1, getBlockDisplayValue(block).split('\n').length)}
                        placeholder="清單項目..."
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          resize: 'none',
                          background: 'transparent',
                          fontSize: '15px',
                          fontFamily: 'inherit',
                          color: 'var(--text-primary)',
                          padding: '2px 0',
                          lineHeight: '1.6',
                          overflow: 'hidden',
                        }}
                      />
                    </div>
                  ) : block.type === 'todo' ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '2px 0' }}>
                      <input
                        type="checkbox"
                        checked={block.raw.includes('- [x]')}
                        onChange={() => handleCheckboxToggle(index, { stopPropagation: () => {} } as any)}
                        style={{ marginTop: '5px', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                      />
                      <textarea
                        className="block-textarea"
                        ref={(el) => { blockRefs.current[index] = el; }}
                        value={block.raw.replace(/^-\s*\[[ x]\]\s*/i, '')}
                        onChange={(e) => {
                          const prefix = block.raw.includes('- [x]') ? '- [x] ' : '- [ ] ';
                          handleBlockChange(index, prefix + e.target.value);
                        }}
                        onPaste={(e) => handleBlockPaste(index, e)}
                        onKeyDown={(e) => handleBlockKeyDown(index, e)}
                        onFocus={() => setFocusedBlockIndex(index)}
                        onBlur={() => setTimeout(() => setShowSlashMenu(false), 180)}
                        rows={1}
                        placeholder="待辦事項..."
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          resize: 'none',
                          background: 'transparent',
                          fontSize: '15px',
                          fontFamily: 'inherit',
                          color: 'var(--text-primary)',
                          opacity: block.raw.includes('- [x]') ? 0.45 : 1,
                          textDecoration: block.raw.includes('- [x]') ? 'line-through' : 'none',
                          padding: '2px 0',
                          lineHeight: '1.6',
                          overflow: 'hidden',
                        }}
                      />
                    </div>
                  ) : (
                    <textarea
                      className="block-textarea"
                      ref={(el) => { blockRefs.current[index] = el; }}
                      value={getBlockDisplayValue(block)}
                      onChange={(e) => handleBlockInputChange(index, e.target.value)}
                      onPaste={(e) => handleBlockPaste(index, e)}
                      onKeyDown={(e) => handleBlockKeyDown(index, e)}
                      onFocus={() => setFocusedBlockIndex(index)}
                      onBlur={() => setTimeout(() => setShowSlashMenu(false), 180)}
                      rows={Math.max(1, getBlockDisplayValue(block).split('\n').length)}
                      placeholder={getBlockPlaceholder(block, index, blocks.length)}
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        background: 'transparent',
                        fontFamily: block.type === 'code' ? 'var(--font-mono)' : 'inherit',
                        fontSize: getBlockFontSize(block.type),
                        fontWeight: getBlockFontWeight(block.type),
                        color: block.type === 'callout' ? 'var(--text-secondary)' : 'var(--text-primary)',
                        padding: '4px 0',
                        margin: 0,
                        lineHeight: '1.7',
                        letterSpacing: block.type.startsWith('header') ? '-0.02em' : 'normal',
                        overflow: 'hidden',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            
            {/* Slash Popover Suggestion in WYSIWYG mode */}
            {showSlashMenu && filteredCommands.length > 0 && (
              <div 
                ref={slashMenuRef}
                className="slash-suggestions"
                style={{ 
                  position: 'absolute',
                  top: `${slashCoords.top}px`, 
                  left: `${slashCoords.left}px`,
                  zIndex: 9999
                }}
              >
                {filteredCommands.map((cmd, idx) => (
                  <div
                    key={cmd.label}
                    className={`slash-item ${idx === selectedSlashIndex ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (focusedBlockIndex !== null) {
                        executeBlockSlashCommand(focusedBlockIndex, cmd);
                      }
                    }}
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
        ) : (
          /* ORIGINAL TEXT AREA PANELS (SOURCE & SPLIT) */
          <div className="editor-panel" style={{ flex: 1, display: 'flex' }}>
            {(viewMode === 'source' || viewMode === 'split') && (
              <div className="editor-pane" style={{ flex: 1 }}>
                <textarea
                  ref={textareaRef}
                  className="markdown-textarea"
                  value={content}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  onMouseUp={handleTextareaMouseUp}
                  placeholder="開始撰寫筆記... (輸入 '/' 喚出 Notion 快選指令)"
                />

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

            {viewMode === 'split' && (
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
        )}
      </div>

      {/* Edit with Groq chip */}
      {groqSel && onEditSelection && (
        <div
          style={{
            position: 'fixed',
            left: Math.min(groqPos.x, window.innerWidth - 180),
            top: Math.max(groqPos.y - 48, 8),
            zIndex: 9999,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleGroqChipClick}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '20px',
              backgroundColor: 'var(--accent)', color: 'white',
              border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            <Sparkles size={13} />
            Edit with Groq
          </button>
        </div>
      )}
    </div>
  );
};
