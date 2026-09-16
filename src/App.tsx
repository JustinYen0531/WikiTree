import { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  History, 
  Globe, 
  Plus, 
  FolderPlus,
  Sparkles,
  X,
  Edit2
} from 'lucide-react';

import { supabase, isSupabaseConfigured } from './utils/supabase';

// Import local utilities
import { 
  FileNode, 
  getFilesRecursively, 
  verifyPermission,
  readFileContent,
  writeFileContent,
  createFile,
  createDirectory,
  renameEntry,
  deleteEntry,
  getDirectoryHandleByPath
} from './utils/fileSystem';

import { 
  Snapshot, 
  loadSnapshots, 
  createSnapshot, 
  restoreSnapshot 
} from './utils/versionControl';

// Import components
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { VersionHistory } from './components/VersionHistory';
import { PublishNoteModal } from './components/PublishNoteModal';
import { LoginModal } from './components/LoginModal';
import { LandingPage } from './components/LandingPage';
import { CourseSearch } from './components/CourseSearch';
import { SkillLibrary } from './components/SkillLibrary';
import { ExplorationNursery } from './components/ExplorationNursery';
import { StyleStudio } from './components/StyleStudio';
import { ImportToWikiTreeModal } from './components/ImportToWikiTreeModal';
import { AntigravityPlugin } from './components/AntigravityPlugin';
import { CustomCursor } from './components/CustomCursor';
import { SplashScreen } from './components/SplashScreen';
import { notionHtmlToMarkdown } from './utils/notionImporter';

import { workspaceId, type WorkspaceFolder } from './utils/workspaceMemory';
import { PendingDiffInfo } from './utils/diffUtils';
import {
  getTheme,
  readSavedTheme,
  THEME_DEFAULT_MIGRATION_KEY,
  THEME_STORAGE_KEY,
  type ThemeId,
} from './utils/themes';
import { getManagedLibrary, type LibraryImportResult, type LibraryInfo } from './utils/library';

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('fromSplash') === '1') return false;
      const shown = sessionStorage.getItem('wikitree_splash_shown');
      return !shown;
    } catch {
      return false;
    }
  });

  const handleSplashFinish = () => {
    try {
      sessionStorage.setItem('wikitree_splash_shown', '1');
    } catch {}
    setShowSplash(false);
  };

  const [workspaceFolders, setWorkspaceFolders] = useState<WorkspaceFolder[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [managedLibrary, setManagedLibrary] = useState<LibraryInfo | null>(null);
  const [workspaceBusy, setWorkspaceBusy] = useState(false);
  const workspaceLock = useRef(false);
  const restoreAttempted = useRef(false);
  const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | string | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [pendingInsertNote, setPendingInsertNote] = useState<string | null>(null);
  const [pendingDiff, setPendingDiff] = useState<PendingDiffInfo | null>(null);
  const [explorationHandoff, setExplorationHandoff] = useState<{ key: string; sourceIds: string[]; titles: string[] } | null>(null);
  
  // Top Navbar Inline Rename States
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [fileNameInput, setFileNameInput] = useState('');
  const [cliConnected, setCliConnected] = useState(false);

  // Local Sign-In States
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('antigravity_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [showLibraryImport, setShowLibraryImport] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Listen to Supabase auth state change to sync with our app user state
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const metadata = session.user.user_metadata || {};
          const loggedUser = {
            username: metadata.username || session.user.email?.split('@')[0] || '',
            nickname: metadata.nickname || session.user.email?.split('@')[0] || '',
            college: metadata.college || '',
            department: metadata.department || '',
            grade: metadata.grade || '',
            isSupabaseUser: true,
          };
          setUser(loggedUser);
          localStorage.setItem('antigravity_user', JSON.stringify(loggedUser));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('antigravity_user');
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const handleLoginSuccess = (loggedUser: any) => {
    setUser(loggedUser);
    localStorage.setItem('antigravity_user', JSON.stringify(loggedUser));
    showToast(`🎉 歡迎回來，${loggedUser.nickname}！`, 'success');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error("Supabase signOut error:", e);
      }
    }
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('antigravity_user');
    showToast('🔒 已安全登出政大 Hub 帳戶', 'info');
  };

  // Check CLI status on load and periodically
  const checkCliStatus = async () => {
    const cliUrl = localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080';
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1000);
      const response = await fetch(`${cliUrl}/api/status`, { signal: controller.signal });
      clearTimeout(id);
      if (response.ok) {
        setCliConnected(true);
        return;
      }
    } catch (e) {
      // Offline
    }
    setCliConnected(false);
  };

  useEffect(() => {
    checkCliStatus();
    const interval = setInterval(checkCliStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const rememberFolder = (folder: WorkspaceFolder) => {
    setWorkspaceFolders(current => {
      const exists = current.some(item => item.id === folder.id);
      return exists ? current.map(item => item.id === folder.id ? folder : item) : [...current, folder];
    });
  };

  const runFileOperation = async (operation: () => Promise<void>) => {
    if (workspaceLock.current) return;
    workspaceLock.current = true;
    setWorkspaceBusy(true);
    try { await operation(); }
    finally { workspaceLock.current = false; setWorkspaceBusy(false); }
  };

  const activateFolder = async (folder: WorkspaceFolder, selectedFile?: FileNode, approved = false): Promise<boolean> => {
    if (workspaceLock.current) return false;
    if (!approved && !isSaved && !confirm('筆記還沒儲存。要捨棄修改並切換資料夾嗎？')) return false;
    workspaceLock.current = true;
    setWorkspaceBusy(true);
    try {
      if (typeof folder.handle !== 'string' && !await verifyPermission(folder.handle, true)) {
        throw new Error('需要重新允許存取這個資料夾。');
      }
      const fileList = await getFilesRecursively(folder.handle);
      const snapList = await loadSnapshots(folder.handle);
      rememberFolder({ ...folder, files: fileList, error: undefined });
      setActiveWorkspaceId(folder.id);
      setRootHandle(folder.handle);
      setWorkspaceName(folder.name);
      setFiles(fileList);
      setSnapshots(snapList);
      setActiveFile(null);
      setContent('');
      setOriginalContent('');
      setShowHistoryPanel(false);
      setShowPublishModal(false);
      if (selectedFile) await openFile(selectedFile, folder.handle, true);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '資料夾暫時無法開啟';
      setWorkspaceFolders(current => current.map(item => item.id === folder.id ? { ...item, error: message } : item));
      showToast(message, 'error');
      return false;
    } finally {
      workspaceLock.current = false;
      setWorkspaceBusy(false);
    }
  };

  const loadFolderTree = async (folder: WorkspaceFolder) => {
    try {
      const fileList = await getFilesRecursively(folder.handle);
      setWorkspaceFolders(current => current.map(item => item.id === folder.id ? { ...item, files: fileList, error: undefined } : item));
    } catch {
      setWorkspaceFolders(current => current.map(item => item.id === folder.id ? { ...item, error: '無法存取，請重試或重新加入資料夾。' } : item));
    }
  };

  useEffect(() => {
    if (!cliConnected || restoreAttempted.current || rootHandle) return;
    restoreAttempted.current = true;

    const autoInit = async () => {
      try {
        const library = await getManagedLibrary();
        setManagedLibrary(library);
        const folder = { id: library.id || workspaceId(library.path), name: library.name, handle: library.path };
        const ok = await activateFolder(folder, undefined, true);
        if (!ok) throw new Error('無法讀取 WikiTree 筆記天地。');
        setSidebarTab('files');

        const currentFileList = await getFilesRecursively(library.path);
        setWorkspaceFolders([{ ...folder, files: currentFileList }]);
        const firstFile = findFirstFile(currentFileList);
        if (firstFile) void openFile(firstFile, library.path, true);
      } catch (error) {
        restoreAttempted.current = false;
        console.error('Auto init WikiTree library failed:', error);
        showToast(error instanceof Error ? error.message : '無法進入你的 WikiTree。', 'error');
      }
    };

    void autoInit();
  }, [cliConnected]);

  useEffect(() => {
    if (!rootHandle || !activeWorkspaceId) return;
    setWorkspaceFolders(current => current.map(folder => folder.id === activeWorkspaceId ? { ...folder, files } : folder));
  }, [files, rootHandle, activeWorkspaceId]);

  // App views and panels
  const [sidebarTab, setSidebarTab] = useState<'explore' | 'skills' | 'exploration' | 'style' | 'files' | 'history' | 'publish' | 'antigravity'>('explore');
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [viewMode, setViewMode] = useState<'wysiwyg' | 'source' | 'split'>('wysiwyg');
  const [theme, setTheme] = useState<ThemeId>(readSavedTheme);

  // Snapshots (VCS) state
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  const isSaved = content === originalContent;

  // Initialize theme
  useEffect(() => {
    const selectedTheme = getTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme-mode', selectedTheme.mode);
    document.documentElement.style.colorScheme = selectedTheme.mode;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      localStorage.setItem(THEME_DEFAULT_MIGRATION_KEY, '1');
    } catch {
      // The theme still works for this session when storage is unavailable.
    }
  }, [theme]);

  // Helper to recursively find the first file node in the tree
  const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.kind === 'file') return node;
      if (node.kind === 'directory' && node.children) {
        const first = findFirstFile(node.children);
        if (first) return first;
      }
    }
    return null;
  };

  // Open a note
  const openFile = async (file: FileNode, fileRoot = rootHandle, skipConfirm = false) => {
    if (!skipConfirm && !isSaved) {
      if (!confirm('您目前編輯的筆記有未儲存的變更。確定要捨棄這些修改嗎？')) {
        return;
      }
    }

    try {
      const text = await readFileContent(file.handle as FileSystemFileHandle);
      if (/\.html?$/i.test(file.name) && fileRoot) {
        const { title, markdown } = notionHtmlToMarkdown(text);
        const baseName = title.replace(/[<>:"/\\|?*]/g, '_').trim().replace(/[. ]+$/, '') || '匯入筆記';
        const parentPath = file.path.split('/').slice(0, -1).join('/');
        const existingFiles = await getFilesRecursively(fileRoot!);
        const paths = new Set<string>();
        const collect = (nodes: FileNode[]) => nodes.forEach(node => {
          paths.add(node.path.toLowerCase());
          if (node.children) collect(node.children);
        });
        collect(existingFiles);
        let mdName = `${baseName}.md`;
        const fullPath = (name: string) => parentPath ? `${parentPath}/${name}` : name;
        for (let n = 2; paths.has(fullPath(mdName).toLowerCase()); n++) mdName = `${baseName} (${n}).md`;
        const parentDir = await getDirectoryHandleByPath(fileRoot!, parentPath, { create: true });
        const newHandle = await createFile(parentDir, mdName);
        await writeFileContent(newHandle, markdown);
        setFiles(await getFilesRecursively(fileRoot!));
        setActiveFile({ name: mdName, path: fullPath(mdName), kind: 'file', handle: newHandle });
        setContent(markdown);
        setOriginalContent(markdown);
        showToast(`已轉成 ${mdName}，原始 HTML 已保留`);
        return;
      }
      setActiveFile(file);
      setContent(text);
      setOriginalContent(text);
    } catch (e) {
      console.error('Failed to read file', e);
      alert(`無法開啟檔案: ${file.name}`);
    }
  };

  // Save current note content
  const handleSaveFile = async (overrideContent?: string) => {
    if (!rootHandle || !activeFile) return;
    const targetContent = overrideContent !== undefined ? overrideContent : content;

    try {
      await writeFileContent(activeFile.handle as FileSystemFileHandle, targetContent);
      setContent(targetContent);
      setOriginalContent(targetContent);
      // Reload workspace files to ensure state matches
      const fileList = await getFilesRecursively(rootHandle);
      setFiles(fileList);
      if (overrideContent !== undefined) {
        showToast('💾 已自動保存至本地！', 'success');
      }
    } catch (e) {
      console.error('Save failed', e);
      alert('儲存檔案失敗，請檢查資料夾的讀寫權限。');
    }
  };

  // Ensure the WikiTree-owned library is loaded.
  const ensureWorkspace = async (): Promise<FileSystemDirectoryHandle | string | null> => {
    if (rootHandle) return rootHandle;

    if (cliConnected) {
      try {
        const library = await getManagedLibrary();
        setManagedLibrary(library);
        await activateFolder({ id: library.id || workspaceId(library.path), name: library.name, handle: library.path }, undefined, true);
        return library.path;
      } catch {
        showToast('無法進入你的 WikiTree，請重新啟動桌面服務。', 'error');
      }
    }
    return null;
  };

  const handleLibraryImported = (result: LibraryImportResult) => {
    setShowLibraryImport(false);
    void runFileOperation(async () => {
      if (!rootHandle) return;
      const updatedFiles = await getFilesRecursively(rootHandle);
      setFiles(updatedFiles);
      const skipped = result.skipped.length ? `，略過 ${result.skipped.length} 個非支援項目` : '';
      showToast(`🌱 已收進 ${result.imported.length} 份筆記${skipped}`);
    });
  };

  // 無痛建立並開啟空白新文件（零彈窗、免手動輸入檔名，直接開寫）
  const handleQuickNewFile = async () => {
    const activeRoot = await ensureWorkspace();
    if (!activeRoot) return;

    try {
      const currentFiles = await getFilesRecursively(activeRoot);
      const fileNames = new Set(currentFiles.map(f => f.name.toLowerCase()));
      
      let baseName = '未命名筆記';
      let targetName = `${baseName}.md`;
      let counter = 2;
      while (fileNames.has(targetName.toLowerCase())) {
        targetName = `${baseName} (${counter}).md`;
        counter++;
      }

      const parentDir = await getDirectoryHandleByPath(activeRoot, '', { create: true });
      const newFileHandle = await createFile(parentDir, targetName);
      await writeFileContent(newFileHandle, '# ' + targetName.replace('.md', '') + '\n\n');

      const updatedFiles = await getFilesRecursively(activeRoot);
      setFiles(updatedFiles);

      const newNode: FileNode = {
        name: targetName,
        path: targetName,
        kind: 'file',
        handle: newFileHandle
      };

      await openFile(newNode, activeRoot, true);
      setSidebarTab('files');
      showToast(`✨ 已建立新文件：${targetName}`);
    } catch (e) {
      console.error('Create quick note failed', e);
      showToast('建立新文件失敗', 'error');
    }
  };

  const handleCreateGeneratedNote = async (markdown: string) => {
    const activeRoot = await ensureWorkspace();
    if (!activeRoot) return;
    const requested = prompt('這份草稿已預覽完成。請輸入新葉片名稱（可包含資料夾路徑）：');
    if (!requested?.trim()) return;
    const parts = requested.split('/').map(part => part.trim()).filter(Boolean);
    if (!parts.length) return;
    const rawName = parts.pop()!.replace(/[<>:"\\|?*]/g, '_').replace(/[. ]+$/, '');
    if (!rawName) { showToast('葉片名稱無法使用。', 'error'); return; }
    const fileName = rawName.endsWith('.md') ? rawName : `${rawName}.md`;
    const parentPath = parts.join('/');
    const relativePath = parentPath ? `${parentPath}/${fileName}` : fileName;
    const allPaths = new Set<string>();
    const collectPaths = (nodes: FileNode[]) => nodes.forEach(node => { allPaths.add(node.path.toLowerCase()); if (node.children) collectPaths(node.children); });
    collectPaths(await getFilesRecursively(activeRoot));
    if (allPaths.has(relativePath.toLowerCase())) { showToast('同名葉片已存在，請換一個名稱。', 'error'); return; }
    try {
      const parent = await getDirectoryHandleByPath(activeRoot, parentPath, { create: true });
      const handle = await createFile(parent, fileName);
      await writeFileContent(handle, markdown.trimEnd() + '\n');
      const updated = await getFilesRecursively(activeRoot);
      setFiles(updated);
      await openFile({ name: fileName, path: relativePath, kind: 'file', handle }, activeRoot, true);
      setSidebarTab('files');
      showToast(`🌱 正式葉片已建立：${relativePath}`);
    } catch (error) {
      console.error('Create generated note failed', error);
      showToast('建立正式葉片失敗。', 'error');
    }
  };

  // Create a new note
  const handleCreateFile = async (parentPath: string) => {
    const activeRoot = await ensureWorkspace();
    if (!activeRoot) return;

    let nameInput = prompt('請輸入新建筆記名稱（可包含資料夾路徑，例如：日記/2026/今天）：');
    if (!nameInput) return;

    // Split path parts and filename
    const parts = nameInput.split('/').filter(Boolean);
    if (parts.length === 0) return;
    
    const fileName = parts.pop()!;
    const subPath = parts.join('/');
    
    // Combine parentPath and subPath
    const finalParentPath = parentPath 
      ? (subPath ? `${parentPath}/${subPath}` : parentPath) 
      : subPath;

    const finalFileName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;

    try {
      // getDirectoryHandleByPath will recursively create the directory path parts if they don't exist
      const parentDir = await getDirectoryHandleByPath(activeRoot, finalParentPath, { create: true });
      const newFileHandle = await createFile(parentDir, finalFileName);
      
      // Reload workspace
      const fileList = await getFilesRecursively(activeRoot);
      setFiles(fileList);

      // Construct path relative to root
      const relativePath = finalParentPath ? `${finalParentPath}/${finalFileName}` : finalFileName;
      const newNode: FileNode = {
        name: finalFileName,
        path: relativePath,
        kind: 'file',
        handle: newFileHandle
      };

      // Open new file
      await openFile(newNode);
    } catch (e) {
      console.error('Create file failed', e);
      alert('建立檔案失敗。');
    }
  };

  // Create a new folder
  const handleCreateFolder = async (parentPath: string) => {
    const activeRoot = await ensureWorkspace();
    if (!activeRoot) return;

    const nameInput = prompt('請輸入新建資料夾名稱（可包含多層路徑，例如：分類/工作/專案A）：');
    if (!nameInput) return;

    // Combine parentPath and nameInput
    const finalPath = parentPath ? `${parentPath}/${nameInput}` : nameInput;

    try {
      // getDirectoryHandleByPath will recursively create all folder levels in finalPath
      await getDirectoryHandleByPath(activeRoot, finalPath, { create: true });
      
      // Reload workspace
      const fileList = await getFilesRecursively(activeRoot);
      setFiles(fileList);
    } catch (e) {
      console.error('Create folder failed', e);
      alert('建立資料夾失敗。');
    }
  };

  // Rename file/folder
  const handleRename = async (node: FileNode, newName: string) => {
    if (!rootHandle) return;

    try {
      const parts = node.path.split('/');
      const oldName = parts.pop()!;
      const parentPath = parts.join('/');
      const parentDir = await getDirectoryHandleByPath(rootHandle, parentPath);

      // Perform rename
      await renameEntry(parentDir, oldName, newName, node.kind);

      // Refresh workspace
      const fileList = await getFilesRecursively(rootHandle);
      setFiles(fileList);

      // If active file was renamed, update it
      if (activeFile?.path === node.path) {
        const newPath = parentPath ? `${parentPath}/${newName}` : newName;
        // Find renamed node in the newly read fileList
        const findNode = (nodes: FileNode[]): FileNode | null => {
          for (const n of nodes) {
            if (n.path === newPath) return n;
            if (n.children) {
              const res = findNode(n.children);
              if (res) return res;
            }
          }
          return null;
        };

        const updatedNode = findNode(fileList);
        if (updatedNode) {
          setActiveFile(updatedNode);
        }
      }
    } catch (e: any) {
      console.error('Rename failed', e);
      alert(`重命名失敗: ${e.message || '未知錯誤'}`);
    }
  };

  // Top Navbar Inline Rename Handlers
  const startEditingFileName = () => {
    if (!activeFile) return;
    setFileNameInput(activeFile.name);
    setIsEditingFileName(true);
  };

  const commitFileNameChange = async () => {
    if (!isEditingFileName || !activeFile) return;
    const trimmed = fileNameInput.trim();
    if (!trimmed) {
      setIsEditingFileName(false);
      return;
    }
    const finalName = trimmed.endsWith('.md') ? trimmed : `${trimmed}.md`;
    if (finalName === activeFile.name) {
      setIsEditingFileName(false);
      return;
    }
    setIsEditingFileName(false);
    await runFileOperation(async () => {
      await handleRename(activeFile, finalName);
      showToast(`✨ 已將筆記更名為：${finalName}`);
    });
  };

  // Delete file/folder
  const handleDelete = async (node: FileNode) => {
    if (!rootHandle) return;

    try {
      const parts = node.path.split('/');
      const name = parts.pop()!;
      const parentPath = parts.join('/');
      const parentDir = await getDirectoryHandleByPath(rootHandle, parentPath);

      await deleteEntry(parentDir, name);

      // If deleted active file, clear active file
      if (activeFile?.path === node.path) {
        setActiveFile(null);
        setContent('');
        setOriginalContent('');
      }

      // Refresh workspace
      const fileList = await getFilesRecursively(rootHandle);
      setFiles(fileList);
    } catch (e) {
      console.error('Delete failed', e);
      alert('刪除失敗。');
    }
  };

  // Create manual snapshot (version history check point)
  const handleCreateSnapshot = async () => {
    if (!rootHandle) return;

    const message = prompt('請輸入此版本快照的說明備註：');
    if (message === null) return; // cancel click

    try {
      const newSnap = await createSnapshot(rootHandle, files, message);
      if (newSnap) {
        setSnapshots(prev => [...prev, newSnap]);
        alert(`版本快照「${newSnap.message}」已成功儲存！`);
      } else {
        alert('未檢測到任何修改。本地工作區檔案已是最新狀態。');
      }
    } catch (e) {
      console.error('Snapshot creation failed', e);
      alert('儲存版本快照失敗。');
    }
  };

  // Restore snapshot rollback
  const handleRestoreSnapshot = async (snapshotId: string) => {
    if (!rootHandle) return;

    try {
      await restoreSnapshot(rootHandle, snapshotId, files);
      
      // Reload workspace
      const fileList = await getFilesRecursively(rootHandle);
      const snapList = await loadSnapshots(rootHandle);
      setFiles(fileList);
      setSnapshots(snapList);

      // Re-load the currently active file, or clear it if it was deleted in snapshot
      if (activeFile) {
        const findNode = (nodes: FileNode[]): FileNode | null => {
          for (const n of nodes) {
            if (n.path === activeFile.path) return n;
            if (n.children) {
              const res = findNode(n.children);
              if (res) return res;
            }
          }
          return null;
        };

        const updatedActive = findNode(fileList);
        if (updatedActive) {
          const text = await readFileContent(updatedActive.handle as FileSystemFileHandle);
          setContent(text);
          setOriginalContent(text);
        } else {
          setActiveFile(null);
          setContent('');
          setOriginalContent('');
        }
      }
    } catch (e) {
      console.error('Restore failed', e);
      alert('還原版本快照失敗。');
    }
  };

  const getFlatPathsList = (): string[] => {
    const list: string[] = [];
    function traverse(nodes: FileNode[]) {
      for (const node of nodes) {
        if (node.kind === 'file') list.push(node.path);
        else if (node.children) traverse(node.children);
      }
    }
    traverse(files);
    return list;
  };

  if (!user && !isGuest) {
    return (
      <>
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
        <CustomCursor />
        <LandingPage 
          onLoginClick={() => setShowLoginModal(true)} 
          onGuestClick={() => setIsGuest(true)} 
        />
        {showLoginModal && (
          <LoginModal 
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
        {toast && (
          <div 
            className="animate-slide-in"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              backgroundColor: 'var(--bg-secondary)',
              color: toast.type === 'error' ? 'var(--danger)' : toast.type === 'info' ? 'var(--accent)' : 'var(--success)',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 11000,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              border: `1px solid ${toast.type === 'error' ? 'var(--danger)' : toast.type === 'info' ? 'var(--accent)' : 'var(--success)'}`,
            }}
          >
            {toast.message}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="app-container">
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <CustomCursor />
      {/* Sidebar - file explorer & search */}
      <Sidebar 
        workspaceFolders={workspaceFolders}
        activeWorkspaceId={activeWorkspaceId}
        workspaceBusy={workspaceBusy}
        onAddWorkspace={() => setShowLibraryImport(true)}
        onExpandWorkspace={loadFolderTree}
        onActivateWorkspace={folder => { void activateFolder(folder); }}
        onRemoveWorkspace={() => undefined}
        onSelectWorkspaceFile={(folder, file) => {
          if (folder.id === activeWorkspaceId && rootHandle) void runFileOperation(() => openFile(file));
          else void activateFolder(folder, file);
        }}
        rootHandle={rootHandle}
        workspaceName={workspaceName}
        files={files}
        activeFile={activeFile}
        onSelectFile={file => void runFileOperation(() => openFile(file))}
        onCreateFile={path => void runFileOperation(() => handleCreateFile(path))}
        onCreateFolder={path => void runFileOperation(() => handleCreateFolder(path))}
        onRename={(node, name) => void runFileOperation(() => handleRename(node, name))}
        onDelete={node => void runFileOperation(() => handleDelete(node))}
        activeTab={sidebarTab}
        setActiveTab={setSidebarTab}
        onQuickNewFile={() => void runFileOperation(handleQuickNewFile)}
        user={user}
        onLogout={handleLogout}
        onTriggerLogin={() => setShowLoginModal(true)}
        managedLibrary={!!managedLibrary}
      />

      {showLibraryImport && typeof rootHandle === 'string' && (
        <ImportToWikiTreeModal
          files={files}
          onClose={() => setShowLibraryImport(false)}
          onImported={handleLibraryImported}
        />
      )}

      {workspaceBusy && <div role="status" style={{ position: 'fixed', inset: 0, zIndex: 12000, background: 'rgba(0,0,0,.35)', display: 'grid', placeItems: 'center' }}>正在處理資料夾…</div>}

      {/* Main Panel View */}
      <div className="main-view-container">
        {sidebarTab === 'explore' ? (
          <CourseSearch key={rootHandle ? activeWorkspaceId : 'no-folder'} workspaceKey={rootHandle ? activeWorkspaceId || undefined : undefined} files={files} activeFile={activeFile} onOpenNote={file => void runFileOperation(() => openFile(file))} />
        ) : sidebarTab === 'skills' ? (
          <SkillLibrary workspacePath={typeof rootHandle === 'string' ? rootHandle : undefined} />
        ) : sidebarTab === 'exploration' ? (
          <ExplorationNursery
            workspacePath={typeof rootHandle === 'string' ? rootHandle : undefined}
            onHandoff={handoff => { setExplorationHandoff(handoff); setSidebarTab('antigravity'); }}
          />
        ) : sidebarTab === 'style' ? (
          <StyleStudio theme={theme} onThemeChange={setTheme} />
        ) : !rootHandle ? (
          <div className="workspace-empty-state">
            <div className="empty-state-card" style={{ maxWidth: '600px', width: '90%', padding: '32px' }}>
              <Sparkles className="empty-state-icon" style={{ marginBottom: '16px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
                  正在準備你的 WikiTree
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  {cliConnected
                    ? 'WikiTree 正在打開「文件／WikiTree」。完成後即可建立第一片葉，不必另外選擇 Windows 資料夾。'
                    : '尚未連接 WikiTree 桌面服務。請使用桌面啟動方式重新開啟，既有文件不會受到影響。'}
                </p>
              </div>
              <button className="btn" onClick={() => void checkCliStatus()}>重新連接</button>
            </div>
          </div>
        ) : showHistoryPanel ? (
          /* Version History Inspection Workspace */
          <VersionHistory 
            rootHandle={rootHandle}
            snapshots={snapshots}
            onRestoreSnapshot={id => runFileOperation(() => handleRestoreSnapshot(id))}
            onClose={() => setShowHistoryPanel(false)}
            currentFilesPaths={getFlatPathsList()}
          />
        ) : (
          /* Note Editor Panel Workspace */
          <>
            {/* Top Navigation Control Bar */}
            <div className="top-navbar">
              <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeFile && isEditingFileName ? (
                  <input
                    type="text"
                    value={fileNameInput}
                    onChange={(e) => setFileNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void commitFileNameChange();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        setIsEditingFileName(false);
                      }
                    }}
                    onBlur={() => void commitFileNameChange()}
                    autoFocus
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      height: '28px',
                      minWidth: '180px',
                      maxWidth: '320px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--accent, #2563eb)',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <span
                    onClick={startEditingFileName}
                    title={activeFile ? "點擊修改檔案名稱" : ""}
                    style={{
                      fontWeight: '500',
                      cursor: activeFile ? 'pointer' : 'default',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      transition: 'background-color 0.15s ease',
                      userSelect: 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (activeFile) (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)');
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget.style.backgroundColor = 'transparent');
                    }}
                  >
                    <span>{activeFile ? activeFile.path.split('/').join(' / ') : '選擇一片葉'}</span>
                    {activeFile && <Edit2 size={12} style={{ opacity: 0.6 }} />}
                  </span>
                )}
                {!isSaved && (
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    backgroundColor: 'var(--warning-bg)', 
                    color: 'var(--warning)', 
                    fontWeight: '600'
                  }}>
                    EVOLVING
                  </span>
                )}
              </div>

              <div className="navbar-right">
                <button className="btn" onClick={() => void runFileOperation(handleQuickNewFile)} title="立即建立並開啟空白新文件">
                  <Plus size={14} />
                  空白新文件
                </button>

                {activeFile && (
                  <button className="btn" onClick={() => void runFileOperation(() => handleSaveFile())} disabled={isSaved}>
                    <Save size={14} />
                    固定葉片
                  </button>
                )}
                
                <button className="btn" onClick={() => void runFileOperation(handleCreateSnapshot)}>
                  <History size={14} />
                  記錄演化
                </button>

                {snapshots.length > 0 && (
                  <button className="btn" onClick={() => setShowHistoryPanel(true)}>
                    演化層 ({snapshots.length})
                  </button>
                )}

                <button className="btn btn-primary" onClick={() => setShowPublishModal(true)}>
                  <Globe size={14} />
                  發送訊號
                </button>

              </div>
            </div>

            {/* Note Editor View */}
            {activeFile ? (
              <Editor
                key={`${activeWorkspaceId}:${activeFile.path}`}
                content={content}
                onChange={setContent}
                onSave={(overrideContent) => void runFileOperation(() => handleSaveFile(overrideContent))}
                isSaved={isSaved}
                viewMode={viewMode}
                setViewMode={setViewMode}
                pendingInsertContent={pendingInsertNote}
                onClearPendingInsert={() => setPendingInsertNote(null)}
                pendingDiff={pendingDiff}
                onClearPendingDiff={() => setPendingDiff(null)}
              />
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', gap: '16px' }}>
                <p>尚未選擇任何知識葉片。</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={() => void runFileOperation(handleQuickNewFile)}>
                    <Plus size={14} /> 空白新文件
                  </button>
                  <button className="btn" onClick={() => void runFileOperation(() => handleCreateFolder(''))}>
                    <FolderPlus size={14} /> 生成分枝
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {sidebarTab !== 'antigravity' && (
        <button
          className="ai-dock-button"
          onClick={() => setSidebarTab('antigravity')}
          title="開啟 AI"
        >
          <Sparkles size={18} />
          AI
        </button>
      )}

      {sidebarTab === 'antigravity' && (
        <aside className="ai-side-panel">
          <div className="ai-side-panel-header">
            <span>
              <Sparkles size={15} />
              AI
            </span>
            <button
              className="theme-toggle-btn"
              onClick={() => setSidebarTab('files')}
              title="關閉 AI"
            >
              <X size={16} />
            </button>
          </div>
          <AntigravityPlugin
            key={activeWorkspaceId || 'no-workspace'}
            workspacePath={typeof rootHandle === 'string' ? rootHandle : undefined}
            currentNotePath={activeFile ? activeFile.path : ''}
            currentNoteContent={content}
            availableFiles={files}
            onApplyContent={(newContent) => {
              setPendingInsertNote(newContent);
              showToast('🌱 已在編輯器生成待插入綠色區塊，可移動選擇位置！', 'success');
            }}
            onCreateContent={(newContent) => void runFileOperation(() => handleCreateGeneratedNote(newContent))}
            referenceHandoff={explorationHandoff}
            onReferenceHandoffConsumed={() => setExplorationHandoff(null)}
            onAppendContent={(added) => {
              setContent((prev) => (prev ? `${prev}\n\n${added}` : added));
              showToast('🌱 已將內容附加至筆記末尾，請記得儲存！', 'success');
            }}
            onApplyDiff={(diffInfo) => {
              setPendingDiff(diffInfo);
              showToast('🔀 已在編輯器生成對稱 Diff 修整區塊！', 'success');
            }}
          />
        </aside>
      )}

      {/* Publish Note Modal */}
      {showPublishModal && (
        <PublishNoteModal
          activeFile={activeFile}
          content={content}
          user={user}
          onClose={() => setShowPublishModal(false)}
          onSuccess={(title) => {
            setShowPublishModal(false);
            showToast(`✅ 「${title}」已發布到社群！`, 'success');
          }}
        />
      )}

      {/* NCCU Local Account Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div 
          className="animate-slide-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--bg-secondary)',
            color: toast.type === 'error' ? 'var(--danger)' : toast.type === 'info' ? 'var(--accent)' : 'var(--success)',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 11000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            border: `1px solid ${toast.type === 'error' ? 'var(--danger)' : toast.type === 'info' ? 'var(--accent)' : 'var(--success)'}`,
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
