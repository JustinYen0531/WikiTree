import { useState, useEffect } from 'react';
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

function App() {
  const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | string | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  
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

  const handleOpenOrCreateCliWorkspace = async () => {
    if (!cliPathInput.trim()) {
      alert('請輸入有效的路徑！');
      return;
    }

    const cliUrl = localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080';
    try {
      const response = await fetch(`${cliUrl}/api/workspace/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: cliPathInput.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        const absolutePath = data.workspace;
        
        setRootHandle(absolutePath);
        setWorkspaceName(data.name || absolutePath);
        
        const filesListResponse = await fetch(`${cliUrl}/api/workspace/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        
        if (filesListResponse.ok) {
          const filesData = await filesListResponse.json();
          const enrichFiles = (nodes: any[]): FileNode[] => {
            return nodes.map(node => ({
              ...node,
              handle: { path: node.path, isCli: true, name: node.name, kind: node.kind },
              children: node.children ? enrichFiles(node.children) : undefined
            }));
          };
          const enriched = enrichFiles(filesData.files || []);
          setFiles(enriched);
          
          const snapListResponse = await fetch(`${cliUrl}/api/workspace/snapshots/load`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          if (snapListResponse.ok) {
            const snapList = await snapListResponse.json();
            setSnapshots(snapList);
          }
          
          if (enriched.length > 0) {
            const firstFile = findFirstFile(enriched);
            if (firstFile) {
              await openFile(firstFile);
            }
          } else {
            setActiveFile(null);
            setContent('');
            setOriginalContent('');
          }
        }
      } else {
        const err = await response.json();
        alert(`開啟工作區失敗: ${err.error || '未知錯誤'}`);
      }
    } catch (e: any) {
      console.error('Failed to connect to CLI to open workspace', e);
      alert(`連線本機 CLI 伺服器失敗，請確認伺服器運作中。 (${e.message})`);
    }
  };

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

  // Load directory contents and version history
  const loadWorkspace = async (handle: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle> => {
    const hasPermission = await verifyPermission(handle, true);
    if (!hasPermission) {
      alert('需要讀寫權限才能存取並修改您的本地檔案。');
      throw new Error('Permission denied');
    }

    const fileList = await getFilesRecursively(handle);
    const snapList = await loadSnapshots(handle);

    setRootHandle(handle);
    setWorkspaceName(handle.name);
    setFiles(fileList);
    setSnapshots(snapList);
    
    return handle;
  };

  // Open directory picker
  const handleSelectDirectory = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker();
      const loadedHandle = await loadWorkspace(handle);
      
      // Auto-open the first file if available
      const fileList = await getFilesRecursively(loadedHandle);
      if (fileList.length > 0) {
        const firstFile = findFirstFile(fileList);
        if (firstFile) {
          await openFile(firstFile);
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error('Error selecting directory', e);
        alert('開啟資料夾選擇器失敗。');
      }
    }
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
  const openFile = async (file: FileNode) => {
    if (!isSaved) {
      if (!confirm('您目前編輯的筆記有未儲存的變更。確定要捨棄這些修改嗎？')) {
        return;
      }
    }

    try {
      const text = await readFileContent(file.handle as FileSystemFileHandle);
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

  // Ensure workspace is loaded. If not, trigger folder select first.
  const ensureWorkspace = async (): Promise<FileSystemDirectoryHandle | string | null> => {
    if (rootHandle) return rootHandle;

    alert('請先選擇一個本地資料夾作為您的筆記工作區！\n(您可以在開啟的視窗中選取現有資料夾，或是新建一個資料夾)');
    try {
      const handle = await (window as any).showDirectoryPicker();
      return await loadWorkspace(handle);
    } catch (e) {
      return null;
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
      {/* Sidebar - file explorer & search */}
      <Sidebar 
        rootHandle={rootHandle}
        workspaceName={workspaceName}
        files={files}
        activeFile={activeFile}
        onSelectFile={openFile}
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
        onRename={handleRename}
        onDelete={handleDelete}
        activeTab={sidebarTab}
        setActiveTab={setSidebarTab}
        user={user}
        onLogout={handleLogout}
        onTriggerLogin={() => setShowLoginModal(true)}
      />

      {/* Main Panel View */}
      <div className="main-view-container">
        {sidebarTab === 'courses' ? (
          <CourseSearch files={files} activeFile={activeFile} onOpenNote={openFile} />
        ) : !rootHandle ? (
          /* Empty Workspace Selector UI */
          <div className="workspace-empty-state">
            <div className="empty-state-card" style={{ maxWidth: '600px', width: '90%', padding: '32px' }}>
              <FolderOpen className="empty-state-icon" style={{ marginBottom: '16px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
                  開啟創意工房
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  創意工房會使用你的本機資料夾來撰寫、整理、版本管理與發布 Markdown 筆記。線上探索不會碰到本機檔案。
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
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success)' }}>創意工房 CLI 已連線</span>
                  </div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    輸入要開啟或新建的創意工房路徑：
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="例如：C:\Users\user\Desktop\我的創意工房"
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
                      {isBrowsing ? '瀏覽中...' : '瀏覽...'}
                    </button>
                    <button className="btn btn-primary" onClick={handleOpenOrCreateCliWorkspace}>
                      開啟 / 新建
                    </button>
                  </div>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                    若路徑不存在，創意工房會為你建立資料夾。這只影響本機工作區，不會修改線上探索資料。
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
                  未偵測到創意工房 CLI。你仍可用瀏覽器 Picker 選擇既有資料夾；若要直接輸入路徑新建資料夾，請先啟動 CLI：<br/>
                  <code style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', marginTop: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
                    node cli-server.cjs
                  </code>
                </div>
              )}

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {cliConnected ? '也可以直接用下方 Picker 選擇既有資料夾。' : ''}
                </span>
                <button className="btn" onClick={handleSelectDirectory} style={{ padding: '10px 20px', fontSize: '14px' }}>
                  選擇創意工房資料夾
                </button>
              </div>
            </div>
          </div>
        ) : showHistoryPanel ? (
          /* Version History Inspection Workspace */
          <VersionHistory 
            rootHandle={rootHandle}
            snapshots={snapshots}
            onRestoreSnapshot={handleRestoreSnapshot}
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
                  {activeFile ? activeFile.path.split('/').join(' / ') : '選擇一篇筆記'}
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
                    已修改
                  </span>
                )}
              </div>

              <div className="navbar-right">
                {activeFile && (
                  <button className="btn" onClick={handleSaveFile} disabled={isSaved}>
                    <Save size={14} />
                    儲存筆記
                  </button>
                )}
                
                <button className="btn" onClick={handleCreateSnapshot}>
                  <History size={14} />
                  儲存版本
                </button>

                {snapshots.length > 0 && (
                  <button className="btn" onClick={() => setShowHistoryPanel(true)}>
                    歷史版本 ({snapshots.length})
                  </button>
                )}

                <button className="btn btn-primary" onClick={() => setShowPublishModal(true)}>
                  <Globe size={14} />
                  發布筆記
                </button>

                <button className="theme-toggle-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            </div>

            {/* Note Editor View */}
            {activeFile ? (
              <Editor
                key={activeFile.path}
                content={content}
                onChange={setContent}
                onSave={handleSaveFile}
                isSaved={isSaved}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', gap: '16px' }}>
                <p>未開啟任何筆記。</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn" onClick={() => handleCreateFile('')}>
                    <Plus size={14} /> 新增筆記
                  </button>
                  <button className="btn" onClick={() => handleCreateFolder('')}>
                    <FolderPlus size={14} /> 新增資料夾
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
            currentNotePath={activeFile ? activeFile.path : ''}
            currentNoteContent={content}
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
