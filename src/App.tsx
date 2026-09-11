import { useState, useEffect, useRef } from 'react';
import { 
  FolderOpen, 
  Save, 
  History, 
  Globe, 
  Plus, 
  Sun, 
  Moon,
  FolderPlus,
  Sparkles,
  X
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
import { AntigravityPlugin } from './components/AntigravityPlugin';
import { CustomCursor } from './components/CustomCursor';
import { SplashScreen } from './components/SplashScreen';
import { notionHtmlToMarkdown } from './utils/notionImporter';

import { readWorkspaceMemory, writeWorkspaceMemory, workspaceId, type WorkspaceFolder } from './utils/workspaceMemory';

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

  const [initialMemory] = useState(readWorkspaceMemory);
  const [workspaceFolders, setWorkspaceFolders] = useState<WorkspaceFolder[]>(initialMemory.folders);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(initialMemory.activeId);
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
  
  // CLI States
  const [cliConnected, setCliConnected] = useState(false);
  const [cliPathInput, setCliPathInput] = useState('');

  // Local Sign-In States
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('antigravity_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

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

  const connectCliFolder = async (folderPath: string, create = false) => {
    if (!folderPath.trim() || workspaceLock.current) return;
    if (!isSaved && !confirm('筆記還沒儲存。要捨棄修改並切換資料夾嗎？')) return;
    workspaceLock.current = true;
    setWorkspaceBusy(true);
    const cliUrl = localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080';
    try {
      const response = await fetch(`${cliUrl}/api/workspace/open`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath.trim(), create }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '無法開啟資料夾');
      workspaceLock.current = false;
      await activateFolder({ id: workspaceId(data.workspace), name: data.name, handle: data.workspace }, undefined, true);
      setSidebarTab('files');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '無法開啟資料夾', 'error');
    } finally { workspaceLock.current = false; setWorkspaceBusy(false); }
  };

  const handleOpenOrCreateCliWorkspace = () => connectCliFolder(cliPathInput, true);

  const loadFolderTree = async (folder: WorkspaceFolder) => {
    try {
      const fileList = await getFilesRecursively(folder.handle);
      setWorkspaceFolders(current => current.map(item => item.id === folder.id ? { ...item, files: fileList, error: undefined } : item));
    } catch {
      setWorkspaceFolders(current => current.map(item => item.id === folder.id ? { ...item, error: '無法存取，請重試或重新加入資料夾。' } : item));
    }
  };

  const removeFolder = (id: string) => {
    if (workspaceLock.current) return;
    if (id === activeWorkspaceId) {
      if (!isSaved && !confirm('筆記還沒儲存。要捨棄修改並關閉這個資料夾嗎？')) return;
      setActiveWorkspaceId(null);
      setRootHandle(null);
      setWorkspaceName('');
      setFiles([]);
      setSnapshots([]);
      setActiveFile(null);
      setContent('');
      setOriginalContent('');
      setShowHistoryPanel(false);
      setShowPublishModal(false);
    }
    setWorkspaceFolders(current => current.filter(folder => folder.id !== id));
    showToast('已從清單移除，電腦裡的資料夾仍保留。', 'info');
  };

  useEffect(() => {
    try { writeWorkspaceMemory(workspaceFolders, activeWorkspaceId); }
    catch { showToast('無法儲存資料夾清單，請確認本機儲存空間。', 'error'); }
  }, [workspaceFolders, activeWorkspaceId]);

  useEffect(() => {
    if (!cliConnected || restoreAttempted.current || rootHandle) return;
    restoreAttempted.current = true;

    const autoInit = async () => {
      // 1. 若有既有工作區，優先恢復
      const savedFolder = initialMemory.folders.find(item => item.id === initialMemory.activeId) || initialMemory.folders[0];
      let activeTargetHandle: any = null;
      if (savedFolder) {
        const ok = await activateFolder(savedFolder, undefined, true);
        if (ok) activeTargetHandle = savedFolder.handle;
      }

      // 2. 若無既有工作區，自動連接應用所在目錄下的預設 notes 資料夾
      if (!activeTargetHandle) {
        const cliUrl = localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080';
        try {
          const res = await fetch(`${cliUrl}/api/status`);
          if (res.ok) {
            const data = await res.json();
            const targetDir = data.defaultNotesPath || data.workspace;
            if (targetDir) {
              await connectCliFolder(targetDir, true);
              activeTargetHandle = targetDir;
            }
          }
        } catch (err) {
          console.error('Auto init workspace failed:', err);
        }
      }

      // 3. 自動切換至筆記視圖，若無開啟中檔案則自動開啟最新筆記或建立空白新文件
      setSidebarTab('files');
      if (activeTargetHandle) {
        try {
          const currentFileList = await getFilesRecursively(activeTargetHandle);
          if (currentFileList.length === 0) {
            setTimeout(() => {
              void handleQuickNewFile();
            }, 250);
          } else {
            const firstFile = findFirstFile(currentFileList);
            if (firstFile) {
              void openFile(firstFile, activeTargetHandle, true);
            } else {
              void handleQuickNewFile();
            }
          }
        } catch {}
      }
    };

    void autoInit();
  }, [cliConnected]);

  useEffect(() => {
    if (!rootHandle || !activeWorkspaceId) return;
    setWorkspaceFolders(current => current.map(folder => folder.id === activeWorkspaceId ? { ...folder, files } : folder));
  }, [files, rootHandle, activeWorkspaceId]);

  const [isBrowsing, setIsBrowsing] = useState(false);

  const handleBrowseCliWorkspace = async () => {
    if (isBrowsing) return;
    setIsBrowsing(true);
    const cliUrl = localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080';
    try {
      const response = await fetch(`${cliUrl}/api/workspace/browse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.path) {
          setCliPathInput(data.path);
        }
      } else {
        const err = await response.json();
        alert(err.error || '瀏覽資料夾失敗');
      }
    } catch (e: any) {
      console.error('Failed to browse workspace via CLI', e);
      alert(`無法開啟本機瀏覽視窗：${e.message}`);
    } finally {
      setIsBrowsing(false);
    }
  };

  // App views and panels
  const [sidebarTab, setSidebarTab] = useState<'courses' | 'files' | 'history' | 'publish' | 'antigravity'>('courses');
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [viewMode, setViewMode] = useState<'wysiwyg' | 'source' | 'split'>('wysiwyg');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Snapshots (VCS) state
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  const isSaved = content === originalContent;

  // Initialize theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Native picker folders remain available for this session; desktop paths persist.
  const loadWorkspace = async (handle: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle> => {
    let id = '';
    for (const folder of workspaceFolders) {
      if (typeof folder.handle !== 'string' && await folder.handle.isSameEntry(handle)) id = folder.id;
    }
    const folder = { id: id || `browser:${crypto.randomUUID()}`, name: handle.name, handle };
    if (!await activateFolder(folder)) throw new Error('Workspace not opened');
    return handle;
  };

  const handleSelectDirectory = async () => {
    if (workspaceLock.current) return;
    try {
      if (cliConnected) {
        setIsBrowsing(true);
        const cliUrl = localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080';
        const response = await fetch(`${cliUrl}/api/workspace/browse`, { method: 'POST' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '無法選擇資料夾');
        if (data.path) await connectCliFolder(data.path);
      } else {
        const handle = await (window as any).showDirectoryPicker();
        await loadWorkspace(handle);
      }
      setSidebarTab('files');
    } catch (error: any) {
      if (error.name !== 'AbortError') showToast('無法加入資料夾，請再試一次。', 'error');
    } finally { setIsBrowsing(false); }
  };

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
  const handleSaveFile = async () => {
    if (!rootHandle || !activeFile) return;

    try {
      await writeFileContent(activeFile.handle as FileSystemFileHandle, content);
      setOriginalContent(content);
      // Reload workspace files to ensure state matches
      const fileList = await getFilesRecursively(rootHandle);
      setFiles(fileList);
    } catch (e) {
      console.error('Save failed', e);
      alert('儲存檔案失敗，請檢查資料夾的讀寫權限。');
    }
  };

  // Ensure workspace is loaded. If not, automatically connect default notes workspace.
  const ensureWorkspace = async (): Promise<FileSystemDirectoryHandle | string | null> => {
    if (rootHandle) return rootHandle;

    if (cliConnected) {
      const cliUrl = localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080';
      try {
        const res = await fetch(`${cliUrl}/api/status`);
        if (res.ok) {
          const data = await res.json();
          const targetDir = data.defaultNotesPath || data.workspace;
          if (targetDir) {
            await connectCliFolder(targetDir, true);
            return targetDir;
          }
        }
      } catch {}
    }

    try {
      const handle = await (window as any).showDirectoryPicker();
      return await loadWorkspace(handle);
    } catch (e) {
      return null;
    }
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
              backgroundColor: toast.type === 'error' ? 'var(--danger)' : toast.type === 'info' ? 'var(--accent)' : 'var(--success)',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 11000,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid rgba(255, 255, 255, 0.1)',
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
        workspaceBusy={workspaceBusy || isBrowsing}
        onAddWorkspace={handleSelectDirectory}
        onExpandWorkspace={loadFolderTree}
        onActivateWorkspace={folder => { void activateFolder(folder); }}
        onRemoveWorkspace={removeFolder}
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
      />

      {workspaceBusy && <div role="status" style={{ position: 'fixed', inset: 0, zIndex: 12000, background: 'rgba(0,0,0,.35)', display: 'grid', placeItems: 'center' }}>正在處理資料夾…</div>}

      {/* Main Panel View */}
      <div className="main-view-container">
        {sidebarTab === 'courses' ? (
          <CourseSearch key={rootHandle ? activeWorkspaceId : 'no-folder'} workspaceKey={rootHandle ? activeWorkspaceId || undefined : undefined} files={files} activeFile={activeFile} onOpenNote={file => void runFileOperation(() => openFile(file))} />
        ) : !rootHandle ? (
          /* Empty Workspace Selector UI */
          <div className="workspace-empty-state">
            <div className="empty-state-card" style={{ maxWidth: '600px', width: '90%', padding: '32px' }}>
              <FolderOpen className="empty-state-icon" style={{ marginBottom: '16px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
                  連接知識森林
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  選擇一個本機根系作為森林入口。知識會在這裡生長、分枝、演化，線上探索不會碰到你的本機根系。
                </p>
              </div>
              <h2 style={{ display: 'none', fontSize: '22px', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '8px' }}>
                開啟或新建筆記工作區
              </h2>
              <p style={{ display: 'none', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '24px' }}>
                您可以透過本機 CLI 伺服器直接輸入路徑「建立全新的資料夾」作為工作區，或是使用瀏覽器原生檔案選擇器開啟現有的資料夾。
              </p>

              {cliConnected ? (
                <div style={{ 
                  width: '100%', 
                  padding: '18px', 
                  borderRadius: '8px', 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)',
                  marginBottom: '24px',
                  textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.82)' }}></div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>FOREST LINK ONLINE</span>
                  </div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    輸入要連接或生成的森林根路徑：
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="例如：C:\Users\user\Desktop\WikiTree-Forest"
                      value={cliPathInput}
                      onChange={(e) => setCliPathInput(e.target.value)}
                      style={{ 
                        flex: 1, 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        border: '1px solid var(--border-color)', 
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '14px' 
                      }}
                    />
                    <button 
                      className="btn" 
                      onClick={handleBrowseCliWorkspace} 
                      disabled={isBrowsing}
                      style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {isBrowsing ? 'SCANNING...' : 'BROWSE'}
                    </button>
                    <button className="btn btn-primary" onClick={handleOpenOrCreateCliWorkspace}>
                      CONNECT
                    </button>
                  </div>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                    若路徑不存在，WikiTree 會生成新的森林根系。這只影響本機知識森林，不會修改線上探索資料。
                  </span>
                </div>
              ) : (
                <div style={{ 
                  width: '100%', 
                  padding: '16px', 
                  borderRadius: '8px', 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px dashed var(--border-color)',
                  marginBottom: '24px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5'
                }}>
                  未偵測到森林連接器。你仍可用瀏覽器 Picker 選擇既有根系；若要直接輸入路徑生成根系，請先啟動 CLI：<br/>
                  <code style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', marginTop: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
                    node cli-server.cjs
                  </code>
                </div>
              )}

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {cliConnected ? '也可以直接用下方 Picker 選擇既有森林根系。' : ''}
                </span>
                <button className="btn" onClick={handleSelectDirectory} style={{ padding: '10px 20px', fontSize: '14px' }}>
                  選擇森林根系
                </button>
              </div>
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
              <div className="navbar-left">
                <span style={{ fontWeight: '500' }}>
                  {activeFile ? activeFile.path.split('/').join(' / ') : '選擇一片葉'}
                </span>
                {!isSaved && (
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    backgroundColor: 'var(--warning-bg)', 
                    color: 'var(--warning)', 
                    marginLeft: '8px',
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
                  <button className="btn" onClick={() => void runFileOperation(handleSaveFile)} disabled={isSaved}>
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

                <button className="theme-toggle-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            </div>

            {/* Note Editor View */}
            {activeFile ? (
              <Editor
                key={`${activeWorkspaceId}:${activeFile.path}`}
                content={content}
                onChange={setContent}
                onSave={() => void runFileOperation(handleSaveFile)}
                isSaved={isSaved}
                viewMode={viewMode}
                setViewMode={setViewMode}
                pendingInsertContent={pendingInsertNote}
                onClearPendingInsert={() => setPendingInsertNote(null)}
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
            onApplyContent={(newContent) => {
              setPendingInsertNote(newContent);
              showToast('🌱 已在編輯器生成待插入綠色區塊，可移動選擇位置！', 'success');
            }}
            onAppendContent={(added) => {
              setContent((prev) => (prev ? `${prev}\n\n${added}` : added));
              showToast('🌱 已將內容附加至筆記末尾，請記得儲存！', 'success');
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
            backgroundColor: toast.type === 'error' ? 'var(--danger)' : toast.type === 'info' ? 'var(--accent)' : 'var(--success)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 11000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
