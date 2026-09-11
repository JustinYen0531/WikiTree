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
  ChevronLeft,
  MessageSquare,
  Clock,
  Edit2,
  X,
  Image as ImageIcon,
  Paperclip,
} from 'lucide-react';
import { renderMarkdownSync } from '../utils/markdownRenderer';
import { preprocessCallouts } from '../utils/callouts';
import DOMPurify from 'dompurify';
import { AiProviderPicker, type AiSelection } from './AiProviderPicker';
import { readChatStream } from '../utils/chatStream';
import { cliWorkspaceHeaders } from '../utils/cliWorkspace';
import { computeLineDiff, PendingDiffInfo } from '../utils/diffUtils';

import { FileNode } from '../utils/fileSystem';

export interface AntigravityPluginProps {
  workspacePath?: string;
  currentNotePath: string;
  currentNoteContent: string;
  availableFiles?: FileNode[];
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

export interface AttachmentFile {
  id: string;
  name: string;
  type: string;
  size?: number;
  dataUrl?: string;
  path?: string;
  isImage?: boolean;
}

interface ChatMessage {
  delivery?: 'streaming' | 'incomplete';
  id: string;
  role: 'user' | 'arborist';
  content: string;
  timestamp: string;
  attachments?: AttachmentFile[];
}

export interface ChatSession {
  id: string;
  title: string;
  notePath: string;
  noteName: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

function getNoteName(path?: string): string {
  if (!path) return '未命名筆記';
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
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
  availableFiles,
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
  const [aiSelection, setAiSelection] = useState<AiSelection>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('wikitree_ai_selection') || 'null');
      if (saved && typeof saved.model === 'string') {
        // Google Gemini is the user-facing name of the existing Anti-Gravity service.
        const provider = saved.provider === 'google' ? 'agy' : saved.provider;
        if (['agy', 'openai'].includes(provider)) return { ...saved, provider };
      }
    } catch {}
    return { provider: 'agy', model: 'default' };
  });
  const [aiReady, setAiReady] = useState(false);
  useEffect(() => {
    localStorage.setItem('wikitree_ai_selection', JSON.stringify(aiSelection));
  }, [aiSelection]);
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

  const loadInitialSessions = (): ChatSession[] => {
    try {
      const raw = localStorage.getItem('wikitree_arborist_sessions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => {
            const resolvedPath = s.notePath || '';
            let resolvedName = s.noteName || (resolvedPath ? getNoteName(resolvedPath) : '');
            if (resolvedName === '歷史備份' || resolvedName === '全域對話' || !resolvedName) {
              resolvedName = currentNotePath ? getNoteName(currentNotePath) : '未命名筆記';
            }
            return {
              id: s.id || 'session-' + Date.now(),
              title: s.title || '未命名對話',
              notePath: resolvedPath,
              noteName: resolvedName,
              messages: Array.isArray(s.messages)
                ? s.messages.map((m: ChatMessage) => (m.delivery === 'streaming' ? { ...m, delivery: 'incomplete' } : m))
                : [],
              createdAt: s.createdAt || Date.now(),
              updatedAt: s.updatedAt || Date.now(),
            };
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse sessions', e);
    }
    return [];
  };

  // 提取工作區所有可用筆記清單
  const allMarkdownNotes = React.useMemo(() => {
    const list: Array<{ name: string; path: string }> = [];
    const seen = new Set<string>();

    const traverse = (nodes?: FileNode[]) => {
      if (!nodes) return;
      for (const node of nodes) {
        if (node.kind === 'file') {
          if (!seen.has(node.path)) {
            seen.add(node.path);
            list.push({ name: node.name, path: node.path });
          }
        } else if (node.children) {
          traverse(node.children);
        }
      }
    };
    traverse(availableFiles);

    if (currentNotePath && !seen.has(currentNotePath)) {
      list.unshift({ name: getNoteName(currentNotePath), path: currentNotePath });
    }

    return list;
  }, [availableFiles, currentNotePath]);

  const [sessions, setSessions] = useState<ChatSession[]>(loadInitialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const init = loadInitialSessions();
    const saved = localStorage.getItem('wikitree_arborist_active_session_id');
    if (saved && init.some((s) => s.id === saved)) return saved;
    return init.length > 0 ? init[0].id : null;
  });

  // 視圖切換：預設一開始進入 AI 功能時顯示對話欄清單（'list'），點擊對話後進入聊天（'chat'）
  const [sessionView, setSessionView] = useState<'list' | 'chat'>('list');
  // 跨 Session 單一任務鎖定：紀錄當前正在運算生成的 Session ID
  const [generatingSessionId, setGeneratingSessionId] = useState<string | null>(null);

  // 對話標題即時編輯狀態（在對話內）
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  // 對話標題即時編輯狀態（在列表清單中）
  const [listEditingSessionId, setListEditingSessionId] = useState<string | null>(null);
  const [listEditingTitle, setListEditingTitle] = useState('');

  // 建立新對話詢問彈窗狀態
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNoteForCreation, setSelectedNoteForCreation] = useState<{ name: string; path: string }>({
    name: currentNotePath ? getNoteName(currentNotePath) : '',
    path: currentNotePath || '',
  });
  const [createSessionTitle, setCreateSessionTitle] = useState('新對話');

  // 更換對話隸屬筆記彈窗狀態
  const [reassignModalSession, setReassignModalSession] = useState<ChatSession | null>(null);

  // 當 currentNotePath 改變且 modal 未開啟時保持同步
  useEffect(() => {
    if (currentNotePath) {
      setSelectedNoteForCreation({
        name: getNoteName(currentNotePath),
        path: currentNotePath,
      });
    }
  }, [currentNotePath]);

  // 依照隸屬文件對對話進行分組索引
  const groupedSessions = React.useMemo(() => {
    const map = new Map<string, { noteName: string; notePath: string; sessions: ChatSession[]; latestUpdatedAt: number }>();

    sessions.forEach((s) => {
      const key = s.notePath || s.noteName || '__default__';
      let name = s.noteName;
      if (!name || name === '歷史備份' || name === '全域對話') {
        name = s.notePath ? getNoteName(s.notePath) : (currentNotePath ? getNoteName(currentNotePath) : '未命名筆記');
      }
      const existing = map.get(key);
      if (existing) {
        existing.sessions.push(s);
        if (s.updatedAt > existing.latestUpdatedAt) {
          existing.latestUpdatedAt = s.updatedAt;
        }
      } else {
        map.set(key, {
          noteName: name,
          notePath: s.notePath || '',
          sessions: [s],
          latestUpdatedAt: s.updatedAt,
        });
      }
    });

    const groups = Array.from(map.entries()).map(([key, value]) => ({
      groupKey: key,
      ...value,
      sessions: [...value.sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    }));

    return groups.sort((a, b) => b.latestUpdatedAt - a.latestUpdatedAt);
  }, [sessions, currentNotePath]);

  const startListTitleEdit = (session: ChatSession, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setListEditingSessionId(session.id);
    setListEditingTitle(session.title);
  };

  const commitListTitleEdit = (sessionId: string) => {
    const trimmed = listEditingTitle.trim();
    if (trimmed) {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: trimmed, updatedAt: Date.now() } : s))
      );
    }
    setListEditingSessionId(null);
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const messages = activeSession ? activeSession.messages : [];

  useEffect(() => {
    try {
      localStorage.setItem('wikitree_arborist_sessions', JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('wikitree_arborist_active_session_id', activeSessionId);
    }
  }, [activeSessionId]);

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setSessionView('chat');
  };

  // 開啟建立新對話彈窗
  const handleOpenCreateModal = (targetPath?: string, targetName?: string) => {
    const activePath = targetPath !== undefined ? targetPath : (currentNotePath || (allMarkdownNotes[0]?.path || ''));
    const activeName = targetName !== undefined ? targetName : (activePath ? getNoteName(activePath) : (allMarkdownNotes[0]?.name || '未命名筆記'));

    setSelectedNoteForCreation({ name: activeName, path: activePath });
    setCreateSessionTitle(activeName ? `${activeName.replace(/\.md$/i, '')} 對話` : '新對話');
    setShowCreateModal(true);
  };

  // 確認建立新對話
  const handleConfirmCreateSession = () => {
    const nPath = selectedNoteForCreation.path;
    const nName = selectedNoteForCreation.name || getNoteName(nPath);
    const title = createSessionTitle.trim() || '新對話';

    const newSession: ChatSession = {
      id: 'session-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      title,
      notePath: nPath || '',
      noteName: nName,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSessionView('chat');
    setShowCreateModal(false);
    flash({ kind: 'info', text: `已建立新對話（隸屬於：${nName}）` });
  };

  // 快速建立對話（無需彈窗）
  const handleCreateNewSessionDirect = (targetPath?: string, targetName?: string) => {
    const nPath = targetPath !== undefined ? targetPath : currentNotePath;
    const nName = targetName || getNoteName(nPath);
    const newSession: ChatSession = {
      id: 'session-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      title: `${nName.replace(/\.md$/i, '')} 對話`,
      notePath: nPath || '',
      noteName: nName,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSessionView('chat');
    flash({ kind: 'info', text: `已建立新對話（隸屬於：${nName}）` });
  };

  // 更換對話隸屬筆記
  const handleReassignSessionNote = (sessionId: string, newPath: string, newName: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, notePath: newPath, noteName: newName, updatedAt: Date.now() } : s))
    );
    setReassignModalSession(null);
    flash({ kind: 'info', text: `已將對話重新隸屬於筆記：「${newName}」` });
  };

  const handleDeleteSession = (sessionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (generatingSessionId === sessionId) {
      flash({ kind: 'error', text: '此對話正在運算中，請先終止任務再刪除。' });
      return;
    }
    const target = sessions.find((s) => s.id === sessionId);
    if (!confirm(`確定要刪除對話「${target?.title || '此對話'}」嗎？`)) return;

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setSessionView('list');
    }
    flash({ kind: 'info', text: '已刪除對話欄' });
  };

  const commitTitleEdit = () => {
    if (!activeSessionId) return;
    const trimmed = titleInput.trim();
    if (trimmed) {
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, title: trimmed, updatedAt: Date.now() } : s))
      );
    }
    setIsEditingTitle(false);
  };

  // Browser 模式狀態與共用 Ref
  const [pastedContent, setPastedContent] = useState('');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const noticeTimer = useRef<number | null>(null);

  // 附件參考與拖放狀態
  const [pendingAttachments, setPendingAttachments] = useState<AttachmentFile[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processUploadedFiles = async (files: File[]) => {
    const newAttachments: AttachmentFile[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(file.name);
      let dataUrl: string | undefined = undefined;

      if (isImage || file.size < 10 * 1024 * 1024) {
        try {
          dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        } catch (err) {
          console.error('Failed to read file as dataUrl', err);
        }
      }

      newAttachments.push({
        id: 'att-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        isImage,
      });
    }

    if (newAttachments.length > 0) {
      setPendingAttachments((prev) => [...prev, ...newAttachments]);
      flash({ kind: 'success', text: `📎 已附加 ${newAttachments.length} 個參考檔案/圖片` });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      void processUploadedFiles(fileList);
      e.target.value = '';
    }
  };

  const addSidebarFileAttachment = (name: string, filePath: string) => {
    const isImage = /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(name);
    const newAtt: AttachmentFile = {
      id: 'att-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      name,
      type: isImage ? `image/${name.split('.').pop()?.toLowerCase() || 'png'}` : 'text/plain',
      path: filePath,
      isImage,
    };

    setPendingAttachments((prev) => [...prev, newAtt]);
    flash({ kind: 'success', text: `📎 已附加檔案「${name}」作為參考依據！` });
  };

  const removeAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    // 1. 本機檔案系統拖放 (OS Drag & Drop)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      await processUploadedFiles(files);
      return;
    }

    // 2. 左側檔案樹拖放 (Sidebar Tree Node Drag & Drop)
    const rawJson = e.dataTransfer.getData('application/json');
    if (rawJson) {
      try {
        const data = JSON.parse(rawJson);
        if (data && data.name) {
          addSidebarFileAttachment(data.name, data.path);
          return;
        }
      } catch {}
    }

    const plainPath = e.dataTransfer.getData('text/plain');
    if (plainPath) {
      const name = plainPath.split('/').pop() || plainPath;
      addSidebarFileAttachment(name, plainPath);
    }
  };

  const switchMode = (nextMode: EnvironmentMode) => {
    setMode(nextMode);
    localStorage.setItem('wikitree_env_mode', nextMode);
    flash({
      kind: 'info',
      text: nextMode === 'app' ? '已切換為【應用程式模式】（直通 AI 知識大腦）' : '已切換為【瀏覽器模式】（專屬複製貼上工作區）',
    });
  };

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

  const handleSendMessage = async (customPrompt?: string, skillLabel?: string) => {
    const currentAttachments = [...pendingAttachments];
    const text = (customPrompt || inputMessage).trim() || (currentAttachments.length > 0 ? '請參考附帶的圖片/檔案，為我提煉並製作詳細的知識筆記。' : '');
    if (!text) return;
    setPendingAttachments([]);

    // 檢查是否有進行中的任務（不支援跨 session 同時進行任務）
    if (generatingSessionId) {
      const busySession = sessions.find((s) => s.id === generatingSessionId);
      flash({
        kind: 'error',
        text: `⚠️ 對話「${busySession?.title || '其他對話'}」正在進行任務中！暫不支援同時執行多個任務。`,
      });
      return;
    }

    if (loading || requestRef.current) return;
    if (!aiReady) {
      flash({ kind: 'info', text: '請先在輸入區下方選擇廠商、完成登入並選擇模型。' });
      return;
    }

    // 確定目標對話 Session
    let targetSession = activeSession;
    let targetId = activeSessionId;
    if (!targetSession || !targetId) {
      const nName = getNoteName(currentNotePath);
      const newSession: ChatSession = {
        id: 'session-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        title: '新對話',
        notePath: currentNotePath || '',
        noteName: nName,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      targetSession = newSession;
      targetId = newSession.id;
    }

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

    // 第一次與筆記互動時，自動推導並命名對話標題
    let derivedTitle: string | undefined = undefined;
    if (targetSession.title === '新對話' || targetSession.title === '未命名對話' || targetSession.messages.length === 0) {
      if (skillLabel) {
        derivedTitle = targetSession.noteName && targetSession.noteName !== '全域對話'
          ? `${targetSession.noteName.replace(/\.md$/i, '')} · ${skillLabel}`
          : skillLabel;
      } else {
        const cleanPrompt = text.replace(/^[#\s\-*]+/, '').split('\n')[0].trim();
        const shortPrompt = cleanPrompt.length > 18 ? cleanPrompt.slice(0, 18) + '…' : cleanPrompt;
        derivedTitle = targetSession.noteName && targetSession.noteName !== '全域對話'
          ? `${targetSession.noteName.replace(/\.md$/i, '')} · ${shortPrompt}`
          : shortPrompt || '筆記思維對話';
      }
    }

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    const botId = 'bot-' + crypto.randomUUID();
    const currentTargetId = targetId;

    // 將使用者問題及串流訊息加入目標 Session
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentTargetId) return s;
        return {
          ...s,
          title: derivedTitle !== undefined ? derivedTitle : s.title,
          messages: [
            ...s.messages,
            userMsg,
            {
              id: botId,
              role: 'arborist',
              content: '',
              delivery: 'streaming',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
          updatedAt: Date.now(),
        };
      })
    );

    setStreamStatus('請求已送出，等待 AI 回覆…');
    if (!customPrompt) setInputMessage('');
    setLoading(true);
    setGeneratingSessionId(currentTargetId);

    try {
      const response = await fetch(`${cliUrl}/api/chat`, {
        method: 'POST',
        signal: controller.signal,
        headers: { ...cliWorkspaceHeaders(workspacePath), 'X-WikiTree-AI': '1' },
        body: JSON.stringify({
          provider: aiSelection.provider,
          model: aiSelection.model,
          message: text,
          stream: true,
          attachments: currentAttachments,
          context: {
            path: targetSession.notePath || currentNotePath,
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

      await readChatStream(response, (event) => {
        if (controller.signal.aborted) return;
        if (event.type === 'status') setStreamStatus(event.text);
        if (event.type === 'delta') {
          setStreamStatus('正在產生回覆…');
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== currentTargetId) return s;
              return {
                ...s,
                messages: s.messages.map((msg) =>
                  msg.id === botId ? { ...msg, content: msg.content + event.text } : msg
                ),
                updatedAt: Date.now(),
              };
            })
          );
        }
        if (event.type === 'done') {
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== currentTargetId) return s;
              return {
                ...s,
                messages: s.messages.map((msg) =>
                  msg.id === botId ? { ...msg, content: event.text || msg.content || '（AI 未回傳文字）', delivery: undefined } : msg
                ),
                updatedAt: Date.now(),
              };
            })
          );
        }
      });
    } catch (e: any) {
      const message = controller.signal.aborted ? '回覆已停止，已收到的文字仍保留。' : e.message;
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== currentTargetId) return s;
          return {
            ...s,
            messages: s.messages.map((msg) => (msg.id === botId ? { ...msg, delivery: 'incomplete' } : msg)),
            updatedAt: Date.now(),
          };
        })
      );
      setStreamStatus(message);
      if (!controller.signal.aborted) flash({ kind: 'error', text: `生成失敗：${message}` });
    } finally {
      requestRef.current = null;
      setLoading(false);
      setGeneratingSessionId(null);
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
              title={sessionView === 'list' ? '查看當前對話' : '切換對話列表'}
              onClick={() => {
                if (sessionView === 'list') {
                  if (activeSessionId) setSessionView('chat');
                  else handleOpenCreateModal();
                } else {
                  setSessionView('list');
                }
              }}
              style={{
                padding: '3px',
                color: sessionView === 'list' ? 'var(--primary-color, #2563eb)' : 'inherit',
              }}
            >
              <MessageSquare size={12} />
            </button>
          )}
          {mode === 'app' && sessionView === 'chat' && (
            <button
              className="theme-toggle-btn"
              title="清空此對話紀錄"
              disabled={loading}
              onClick={() => {
                if (!activeSessionId) return;
                if (confirm('確定要清空此對話內容嗎？')) {
                  setSessions((prev) =>
                    prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [], updatedAt: Date.now() } : s))
                  );
                }
              }}
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
          {mode === 'app' && (
            <AiProviderPicker
              url={cliUrl}
              selection={aiSelection}
              onChange={setAiSelection}
              onReadyChange={setAiReady}
              disabled={loading}
            />
          )}
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
        sessionView === 'list' ? (
          /* 對話欄列表管理視圖 */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            {/* 列表頂部工具列 */}
            <div
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} style={{ color: 'var(--primary-color, #2563eb)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  對話欄列表 ({sessions.length})
                </span>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => handleOpenCreateModal()}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="建立新對話（自動偵測當前筆記）"
              >
                <Plus size={13} />
                <span>新增對話</span>
              </button>
            </div>

            {/* 進行中任務鎖定提醒 */}
            {generatingSessionId && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(37, 99, 235, 0.12)',
                  borderBottom: '1px solid rgba(37, 99, 235, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#2563eb',
                  flexShrink: 0,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Loader2 size={13} className="spin" />
                  <span>「{sessions.find((s) => s.id === generatingSessionId)?.title || '對話'}」運算中 ({elapsedSeconds}s)</span>
                </span>
                <button
                  className="btn"
                  onClick={() => {
                    setActiveSessionId(generatingSessionId);
                    setSessionView('chat');
                  }}
                  style={{ padding: '2px 8px', fontSize: '10.5px' }}
                >
                  查看
                </button>
              </div>
            )}

            {/* 對話清單滾動區 */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {sessions.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '36px 16px',
                    textAlign: 'center',
                    gap: '12px',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    marginTop: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#22c55e',
                    }}
                  >
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                      目前尚無對話記錄
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      點擊下方按鈕，為當前正在修改的筆記「{getNoteName(currentNotePath)}」開啟專屬對話欄！
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleOpenCreateModal()}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Plus size={14} />
                    <span>建立第一個對話</span>
                  </button>
                </div>
              ) : (
                groupedSessions.map((group) => (
                  <div
                    key={group.groupKey}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      marginBottom: '10px',
                    }}
                  >
                    {/* 文件索引分組標頭 */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(34, 197, 94, 0.08)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          minWidth: 0,
                        }}
                      >
                        <FileText size={12} color="#22c55e" style={{ flexShrink: 0 }} />
                        <span
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={group.noteName}
                        >
                          隸屬文件：{group.noteName}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            color: 'var(--text-secondary)',
                            fontWeight: 400,
                            flexShrink: 0,
                          }}
                        >
                          ({group.sessions.length})
                        </span>
                      </div>

                      <button
                        className="theme-toggle-btn"
                        title={`在「${group.noteName}」下新增對話`}
                        onClick={() => handleCreateNewSessionDirect(group.notePath, group.noteName)}
                        style={{
                          padding: '2px 6px',
                          fontSize: '10.5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Plus size={11} />
                        <span>新增</span>
                      </button>
                    </div>

                    {/* 該文件索引底下的所有對話欄卡片 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {group.sessions.map((session) => {
                        const isSelected = activeSessionId === session.id;
                        const isGenerating = generatingSessionId === session.id;
                        const isEditingThisTitle = listEditingSessionId === session.id;

                        return (
                          <div
                            key={session.id}
                            onClick={() => handleSelectSession(session.id)}
                            style={{
                              border: isSelected ? '1px solid var(--primary-color, #2563eb)' : '1px solid var(--border-color)',
                              borderRadius: '6px',
                              padding: '9px 11px',
                              backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255,255,255,0.04))';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                            }}
                          >
                            {/* 第一列：標題（可編輯） ＋ 操作（更換筆記 / 運算中 / 刪除） */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              {isEditingThisTitle ? (
                                <input
                                  type="text"
                                  value={listEditingTitle}
                                  onChange={(e) => setListEditingTitle(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    e.stopPropagation();
                                    if (e.key === 'Enter') commitListTitleEdit(session.id);
                                    if (e.key === 'Escape') setListEditingSessionId(null);
                                  }}
                                  onBlur={() => commitListTitleEdit(session.id)}
                                  autoFocus
                                  style={{
                                    flex: 1,
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--primary-color, #2563eb)',
                                    backgroundColor: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    minWidth: 0,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    flex: 1,
                                    minWidth: 0,
                                  }}
                                >
                                  <span
                                    onClick={(e) => {
                                      startListTitleEdit(session, e);
                                    }}
                                    title="點擊或點筆圖示修改名稱"
                                    style={{
                                      fontWeight: 700,
                                      fontSize: '12.5px',
                                      color: 'var(--text-primary)',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {session.title}
                                  </span>
                                  <button
                                    className="theme-toggle-btn"
                                    title="修改對話名稱"
                                    onClick={(e) => startListTitleEdit(session, e)}
                                    style={{
                                      padding: '2px',
                                      opacity: 0.5,
                                      flexShrink: 0,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                                  >
                                    <Edit2 size={11} />
                                  </button>
                                </div>
                              )}

                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                                <button
                                  className="theme-toggle-btn"
                                  title="更換隸屬筆記"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReassignModalSession(session);
                                  }}
                                  style={{ padding: '3px', opacity: 0.6 }}
                                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                                >
                                  <FileText size={11.5} color="#22c55e" />
                                </button>
                                {isGenerating && (
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      backgroundColor: 'rgba(37, 99, 235, 0.15)',
                                      color: '#2563eb',
                                      fontWeight: 600,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                    }}
                                  >
                                    <Loader2 size={10} className="spin" />
                                    運算中
                                  </span>
                                )}
                                <button
                                  className="theme-toggle-btn"
                                  title="刪除此對話欄"
                                  onClick={(e) => handleDeleteSession(session.id, e)}
                                  style={{ padding: '3px', opacity: 0.6 }}
                                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            {/* 第二列：訊息統計與時間 */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '10.5px',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MessageSquare size={10} />
                                <span>{session.messages.length} 則訊息</span>
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Clock size={10} />
                                <span>
                                  {new Date(session.updatedAt).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}{' '}
                                  {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* 對話聊天視圖 */
          <>
            {/* 對話頁面頂部控制列：返回列表 ＋ 標題與隸屬文件索引 ＋ 新增對話 */}
            <div
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexShrink: 0,
              }}
            >
              <button
                className="btn"
                onClick={() => setSessionView('list')}
                style={{
                  padding: '3px 8px',
                  fontSize: '11px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  flexShrink: 0,
                }}
                title="返回對話欄列表"
              >
                <ChevronLeft size={13} />
                <span>對話列表</span>
              </button>

              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitTitleEdit();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    onBlur={commitTitleEdit}
                    autoFocus
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid var(--primary-color, #2563eb)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => {
                      setTitleInput(activeSession?.title || '新對話');
                      setIsEditingTitle(true);
                    }}
                    title="點擊自訂對話標題"
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeSession?.title || '新對話'}
                    </span>
                    <Edit2 size={10.5} style={{ opacity: 0.5, flexShrink: 0 }} />
                  </div>
                )}

                {/* 頂部隸屬文件索引 ＋ 更換按鈕 */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10px',
                    color: 'var(--text-secondary)',
                    maxWidth: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <FileText size={10} color="#22c55e" style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    隸屬文件：<strong style={{ color: 'var(--text-primary)' }}>{activeSession?.noteName || '未指定筆記'}</strong>
                  </span>
                  <button
                    onClick={() => activeSession && setReassignModalSession(activeSession)}
                    className="theme-toggle-btn"
                    title="更換隸屬筆記"
                    style={{
                      padding: '1px 5px',
                      fontSize: '9.5px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      lineHeight: '1.2',
                      flexShrink: 0,
                      color: '#22c55e',
                    }}
                  >
                    更換
                  </button>

                  {/* 若當前對話並非隸屬當前編輯筆記，提供一鍵綁定快捷 */}
                  {currentNotePath && activeSession && activeSession.notePath !== currentNotePath && (
                    <button
                      onClick={() => handleReassignSessionNote(activeSession.id, currentNotePath, getNoteName(currentNotePath))}
                      className="theme-toggle-btn"
                      title={`一鍵綁定為目前正在修改的筆記：「${getNoteName(currentNotePath)}」`}
                      style={{
                        padding: '1px 5px',
                        fontSize: '9.5px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        lineHeight: '1.2',
                        flexShrink: 0,
                      }}
                    >
                      綁定為當前筆記
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <button
                  className="btn"
                  onClick={() => handleOpenCreateModal()}
                  style={{ padding: '3px 7px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                  title="建立並切換至新對話"
                >
                  <Plus size={12} />
                  <span>新對話</span>
                </button>
              </div>
            </div>

            {/* 跨對話任務鎖定提示 */}
            {generatingSessionId && generatingSessionId !== activeSessionId && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(234, 179, 8, 0.12)',
                  borderBottom: '1px solid rgba(234, 179, 8, 0.3)',
                  fontSize: '11px',
                  color: '#ca8a04',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Loader2 size={12} className="spin" />
                  <span>對話「{sessions.find((s) => s.id === generatingSessionId)?.title}」正在進行任務中</span>
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    setActiveSessionId(generatingSessionId);
                  }}
                  style={{ padding: '2px 6px', fontSize: '10px' }}
                >
                  前往該對話
                </button>
              </div>
            )}

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
                          onClick={() => handleSendMessage(skill.prompt, skill.label)}
                          disabled={loading || disabled || (!!generatingSessionId && generatingSessionId !== activeSessionId)}
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
                        gap: '4px',
                      }}
                    >
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', padding: '0 4px' }}>
                        YOU • {msg.timestamp}
                      </div>

                      {/* 渲染附加的圖片或參考檔案 */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '90%' }}>
                          {msg.attachments.map((att) => (
                            <div
                              key={att.id}
                              style={{
                                borderRadius: '6px',
                                overflow: 'hidden',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-secondary)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: att.isImage && att.dataUrl ? '2px' : '4px 8px',
                              }}
                            >
                              {att.isImage && att.dataUrl ? (
                                <img
                                  src={att.dataUrl}
                                  alt={att.name}
                                  style={{
                                    maxWidth: '180px',
                                    maxHeight: '140px',
                                    borderRadius: '4px',
                                    objectFit: 'contain',
                                    display: 'block',
                                  }}
                                />
                              ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-primary)' }}>
                                  <FileText size={13} color="#22c55e" />
                                  <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {att.name}
                                  </span>
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

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

                            {/* 操作控制列：依據 activeTab 嚴格區分動作 */}
                            <div
                              style={{
                                padding: '8px 12px',
                                borderTop: '1px solid var(--border-color)',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center',
                              }}
                            >
                              {activeTab === 'note' ? (
                                <>
                                  {/* 知識筆記分頁：只有直接插入 ＋ 複製按鈕 */}
                                  {onApplyContent && (
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => applyToNote(msg.id, note)}
                                      style={{
                                        flex: 1,
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        backgroundColor: '#22c55e',
                                        color: '#000000',
                                        border: 'none',
                                      }}
                                      title="在編輯器中生成可拖動的綠色插入區塊"
                                    >
                                      {appliedId === msg.id ? <Check size={14} color="#000000" /> : <Plus size={14} />}
                                      <span>{appliedId === msg.id ? '已送至編輯器！' : '➕ 直接插入'}</span>
                                    </button>
                                  )}

                                  <button
                                    className="btn"
                                    title="複製純淨筆記"
                                    onClick={() => copyToClipboard(msg.id, note)}
                                    style={{ padding: '6px 12px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    {copiedId === msg.id ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
                                    <span>{copiedId === msg.id ? '已複製' : '複製'}</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  {/* 知識修整分頁：只有套用修整按鈕 */}
                                  {onApplyDiff && (
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => applyDiffToNote(msg.id, note, diff)}
                                      style={{
                                        flex: 1,
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        backgroundColor: '#2563eb',
                                        borderColor: '#2563eb',
                                        color: '#ffffff',
                                      }}
                                      title="在編輯器中呈現對稱的 Diff 審查區塊（綠色新增＋紅色刪除）"
                                    >
                                      {appliedId === msg.id ? <Check size={14} color="#ffffff" /> : <GitBranch size={14} />}
                                      <span>{appliedId === msg.id ? '已送至編輯器！' : '🔀 套用修整 (Diff)'}</span>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })
            )}

            {loading && generatingSessionId === activeSessionId && (
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: isDraggingOver ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-secondary)',
              border: isDraggingOver ? '1px dashed #2563eb' : undefined,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              flexShrink: 0,
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            {/* 拖放覆蓋提示 */}
            {isDraggingOver && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(37, 99, 235, 0.15)',
                  backdropFilter: 'blur(2px)',
                  border: '2px dashed #2563eb',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#2563eb',
                  fontWeight: 600,
                  fontSize: '12px',
                  zIndex: 10,
                  pointerEvents: 'none',
                }}
              >
                <ImageIcon size={18} />
                <span>放開滑鼠以附加參考圖片或檔案</span>
              </div>
            )}

            {/* 待發送的附件縮圖/列表 */}
            {pendingAttachments.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  maxWidth: '100%',
                }}
              >
                {pendingAttachments.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: att.isImage && att.dataUrl ? '2px 6px 2px 2px' : '4px 8px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      flexShrink: 0,
                      maxWidth: '180px',
                    }}
                  >
                    {att.isImage && att.dataUrl ? (
                      <img
                        src={att.dataUrl}
                        alt={att.name}
                        style={{ width: '26px', height: '26px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <Paperclip size={13} color="#2563eb" />
                    )}
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: 'var(--text-primary)',
                        flex: 1,
                      }}
                      title={att.name}
                    >
                      {att.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--text-secondary)',
                      }}
                      title="移除此附件"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 隱藏的檔案選取器 */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.md,.json,.csv,.doc,.docx"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {/* 「+」按鈕：選取本機檔案或圖片 */}
              <button
                type="button"
                className="btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || (!!generatingSessionId && generatingSessionId !== activeSessionId)}
                title="附加參考圖片或檔案 (+)"
                style={{
                  padding: '7px 9px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                <Plus size={15} />
              </button>

              <input
                type="text"
                className="form-input"
                placeholder={
                  generatingSessionId && generatingSessionId !== activeSessionId
                    ? '另一個對話任務正在執行中（不支援同時任務）…'
                    : pendingAttachments.length > 0
                    ? `已附加 ${pendingAttachments.length} 個檔案，輸入指令或直接按送出...`
                    : currentNotePath
                    ? `對「${getNoteName(currentNotePath)}」提問或拖放圖片...`
                    : '輸入任務或拖放圖片/檔案...'
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={loading || (!!generatingSessionId && generatingSessionId !== activeSessionId)}
                style={{ flex: 1, padding: '7px 10px', height: '34px', fontSize: '12px' }}
              />
              <button
                className="btn btn-primary"
                onClick={() => handleSendMessage()}
                disabled={
                  (!inputMessage.trim() && pendingAttachments.length === 0) ||
                  loading ||
                  !aiReady ||
                  (!!generatingSessionId && generatingSessionId !== activeSessionId)
                }
                title={
                  generatingSessionId && generatingSessionId !== activeSessionId
                    ? '另一個對話任務正在執行中'
                    : '送出 (Enter)'
                }
                style={{ padding: '7px 12px', height: '34px' }}
              >
                {loading && generatingSessionId === activeSessionId ? (
                  <Loader2 size={14} className="spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
              <span>按 Enter 送出 • 支援拖放/「+」圖片與參考檔案</span>
              <span>支援 20% 預覽確認</span>
            </div>
          </div>
        </>)
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

      {/* 建立新對話詢問彈窗 */}
      {showCreateModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '340px',
              backgroundColor: 'var(--bg-primary, #1e1e1e)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                <Sparkles size={15} color="#22c55e" />
                <span>建立筆記專屬對話</span>
              </div>
              <button
                className="theme-toggle-btn"
                onClick={() => setShowCreateModal(false)}
                style={{ padding: '3px', opacity: 0.7 }}
              >
                <X size={14} />
              </button>
            </div>

            {/* 自動偵測提示 / 推薦區塊 */}
            {currentNotePath ? (
              <div
                onClick={() => {
                  setSelectedNoteForCreation({
                    name: getNoteName(currentNotePath),
                    path: currentNotePath,
                  });
                  setCreateSessionTitle(`${getNoteName(currentNotePath).replace(/\.md$/i, '')} 對話`);
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: selectedNoteForCreation.path === currentNotePath ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-secondary)',
                  border: selectedNoteForCreation.path === currentNotePath ? '1px solid #22c55e' : '1px dashed var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '10.5px', color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={11} />
                  <span>⚡ 自動偵測目前正在修改的筆記：</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getNoteName(currentNotePath)}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '6px 8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                ℹ️ 目前未開啟任何筆記，請從下方選擇欲隸屬的筆記檔案：
              </div>
            )}

            {/* 選擇要隸屬的筆記清單 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                隸屬筆記檔案：
              </label>
              <select
                className="form-input"
                value={selectedNoteForCreation.path}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = allMarkdownNotes.find((n) => n.path === val);
                  const noteName = matched ? matched.name : (val ? getNoteName(val) : '未命名筆記');
                  setSelectedNoteForCreation({ name: noteName, path: val });
                  setCreateSessionTitle(`${noteName.replace(/\.md$/i, '')} 對話`);
                }}
                style={{ fontSize: '12px', padding: '6px 8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                {allMarkdownNotes.length > 0 ? (
                  allMarkdownNotes.map((note) => (
                    <option key={note.path} value={note.path}>
                      📄 {note.name}
                    </option>
                  ))
                ) : (
                  <option value="">{currentNotePath ? getNoteName(currentNotePath) : '未命名筆記.md'}</option>
                )}
              </select>
            </div>

            {/* 對話自訂名稱 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                對話名稱：
              </label>
              <input
                type="text"
                className="form-input"
                value={createSessionTitle}
                onChange={(e) => setCreateSessionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmCreateSession();
                }}
                placeholder="例如：機器學習重點整理"
                style={{ fontSize: '12px', padding: '6px 8px' }}
              />
            </div>

            {/* 動作按鈕 */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                className="btn"
                onClick={() => setShowCreateModal(false)}
                style={{ flex: 1, padding: '6px', fontSize: '11.5px' }}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmCreateSession}
                style={{ flex: 1, padding: '6px', fontSize: '11.5px', fontWeight: 600 }}
              >
                確認建立
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 更換隸屬筆記彈窗 */}
      {reassignModalSession && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setReassignModalSession(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '340px',
              backgroundColor: 'var(--bg-primary, #1e1e1e)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                <FileText size={15} color="#22c55e" />
                <span>更換對話的隸屬筆記</span>
              </div>
              <button
                className="theme-toggle-btn"
                onClick={() => setReassignModalSession(null)}
                style={{ padding: '3px', opacity: 0.7 }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              對話「<strong style={{ color: 'var(--text-primary)' }}>{reassignModalSession.title}</strong>」目前隸屬：
              <span style={{ color: '#22c55e', fontWeight: 600, marginLeft: '4px' }}>{reassignModalSession.noteName}</span>
            </div>

            {/* 一鍵綁定為當前正在修改的筆記 */}
            {currentNotePath && (
              <button
                className="btn btn-primary"
                onClick={() => handleReassignSessionNote(reassignModalSession.id, currentNotePath, getNoteName(currentNotePath))}
                style={{
                  padding: '7px 10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={13} />
                <span>綁定為目前正在修改的「{getNoteName(currentNotePath)}」</span>
              </button>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                或選擇工作區中的其他筆記：
              </div>
              <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {allMarkdownNotes.map((note) => (
                  <div
                    key={note.path}
                    onClick={() => handleReassignSessionNote(reassignModalSession.id, note.path, note.name)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '5px',
                      backgroundColor: reassignModalSession.notePath === note.path ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-secondary)',
                      border: reassignModalSession.notePath === note.path ? '1px solid #22c55e' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      fontSize: '11.5px',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <FileText size={12} color="#22c55e" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                className="btn"
                onClick={() => setReassignModalSession(null)}
                style={{ padding: '5px 12px', fontSize: '11.5px' }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
