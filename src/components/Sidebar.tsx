import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Plus, 
  Trash, 
  Edit, 
  Search, 
  History, 
  Globe, 
  ChevronRight, 
  FolderPlus,
  BookOpen,
  LogIn,
  Copy,
  Check,
  LogOut,
  ShieldCheck,
  X,
  Sparkles,
  Sprout,
  Palette,
  Import,
} from 'lucide-react';
import { FileNode } from '../utils/fileSystem';
import type { WorkspaceFolder } from '../utils/workspaceMemory';
import { isSupabaseConfigured } from '../utils/supabase';

interface SidebarProps {
  workspaceFolders: WorkspaceFolder[];
  activeWorkspaceId: string | null;
  workspaceBusy: boolean;
  onAddWorkspace: () => void;
  onExpandWorkspace: (folder: WorkspaceFolder) => void;
  onActivateWorkspace: (folder: WorkspaceFolder) => void;
  onRemoveWorkspace: (id: string) => void;
  onSelectWorkspaceFile: (folder: WorkspaceFolder, file: FileNode) => void;
  rootHandle: FileSystemDirectoryHandle | string | null;
  workspaceName: string;
  files: FileNode[];
  activeFile: FileNode | null;
  onSelectFile: (file: FileNode) => void;
  onCreateFile: (parentPath: string) => void;
  onCreateFolder: (parentPath: string) => void;
  onRename: (node: FileNode, newName: string) => void;
  onDelete: (node: FileNode) => void;
  activeTab: 'explore' | 'skills' | 'exploration' | 'style' | 'files' | 'history' | 'publish' | 'antigravity';
  setActiveTab: (tab: 'explore' | 'skills' | 'exploration' | 'style' | 'files' | 'history' | 'publish' | 'antigravity') => void;
  onQuickNewFile?: () => void;
  user?: { username: string; nickname: string; college: string; department: string; grade: string; isSupabaseUser?: boolean } | null;
  onLogout?: () => void;
  onTriggerLogin?: () => void;
  managedLibrary?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  workspaceFolders,
  activeWorkspaceId,
  workspaceBusy,
  onAddWorkspace,
  onExpandWorkspace,
  onActivateWorkspace,
  onRemoveWorkspace,
  onSelectWorkspaceFile,
  rootHandle,
  workspaceName,
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  activeTab,
  setActiveTab,
  onQuickNewFile,
  user,
  onLogout,
  onTriggerLogin,
  managedLibrary = false,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [expandedRoots, setExpandedRoots] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfilePopover, setShowProfilePopover] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const isOrbitTab = activeTab === 'explore' || activeTab === 'skills' || activeTab === 'exploration' || activeTab === 'style';
  const isWorkshopTab = !isOrbitTab;

  const handleCopyToken = (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleLoginClick = () => {
    if (onTriggerLogin) onTriggerLogin();
  };

  const getAvatarGradient = (name: string) => {
    const phase = Math.abs((name || 'A').charCodeAt(0) % 4) * 8;
    return `radial-gradient(circle at ${38 + phase}% ${30 + phase}%, rgba(255,255,255,0.94), rgba(255,255,255,0.34) 38%, rgba(255,255,255,0.08) 72%, rgba(0,0,0,0.2))`;
  };

  const toggleExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const handleCreateFileClick = (parentPath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateFile(parentPath);
  };

  const handleCreateFolderClick = (parentPath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateFolder(parentPath);
  };

  const handleRenameClick = (node: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt(`請輸入「${node.name}」的新名稱：`, node.name);
    if (newName && newName !== node.name) {
      onRename(node, newName);
    }
  };

  const handleDeleteClick = (node: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`您確定要刪除「${node.name}」嗎？`)) {
      onDelete(node);
    }
  };

  // Helper to filter nodes recursively based on search query
  const filterNodes = (nodes: FileNode[], query: string): FileNode[] => {
    if (!query) return nodes;
    
    return nodes
      .map(node => {
        if (node.kind === 'file') {
          return node.name.toLowerCase().includes(query.toLowerCase()) ? node : null;
        } else {
          const matchingChildren = node.children ? filterNodes(node.children, query) : [];
          if (matchingChildren.length > 0 || node.name.toLowerCase().includes(query.toLowerCase())) {
            return {
              ...node,
              children: matchingChildren
            };
          }
          return null;
        }
      })
      .filter((n): n is FileNode => n !== null);
  };

  const toggleRoot = (folder: WorkspaceFolder) => {
    const opening = !expandedRoots.has(folder.id);
    setExpandedRoots(current => {
      const updated = new Set(current);
      if (opening) updated.add(folder.id); else updated.delete(folder.id);
      return updated;
    });
    if (opening) onExpandWorkspace(folder);
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: FileNode, depth: number, folder: WorkspaceFolder) => {
    const isDirectory = node.kind === 'directory';
    const nodeKey = `${folder.id}:${node.path}`;
    const isExpanded = expandedPaths.has(nodeKey) || searchQuery !== '';
    const isActive = folder.id === activeWorkspaceId && activeFile?.path === node.path;

    return (
      <div key={node.path} className="file-tree-node">
        <div 
          className={`tree-node-item ${isActive ? 'active' : ''}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => !isDirectory && !workspaceBusy && onSelectWorkspaceFile(folder, node)}
          draggable={!isDirectory}
          onDragStart={(e) => {
            if (!isDirectory) {
              const fileData = {
                name: node.name,
                path: node.path,
                kind: node.kind,
              };
              e.dataTransfer.setData('application/json', JSON.stringify(fileData));
              e.dataTransfer.setData('text/plain', node.path);
            }
          }}
        >
          {isDirectory ? (
            <button 
              className="theme-toggle-btn node-chevron-btn" 
              onClick={(e) => toggleExpand(nodeKey, e)}
              style={{ padding: '2px', marginRight: '2px' }}
            >
              <ChevronRight className={`node-chevron ${isExpanded ? 'expanded' : ''}`} />
            </button>
          ) : (
            <div style={{ width: '18px' }} />
          )}

          {isDirectory ? (
            isExpanded ? (
              <FolderOpen className="node-icon" style={{ color: 'var(--accent)' }} />
            ) : (
              <Folder className="node-icon" style={{ color: 'var(--accent)' }} />
            )
          ) : (
            <FileText className="node-icon" />
          )}

          <span className="node-label">{node.name.replace(/\.md$/i, '')}</span>

          <div className="node-actions" style={{ display: folder.id === activeWorkspaceId && !workspaceBusy ? undefined : 'none' }}>
            {isDirectory && (
              <>
                <button 
                  className="sidebar-action-btn" 
                  title="新增筆記"
                  onClick={(e) => handleCreateFileClick(node.path, e)}
                >
                  <Plus size={14} />
                </button>
                <button 
                  className="sidebar-action-btn" 
                  title="新增資料夾"
                  onClick={(e) => handleCreateFolderClick(node.path, e)}
                >
                  <FolderPlus size={14} />
                </button>
              </>
            )}
            <button 
              className="sidebar-action-btn" 
              title="重新命名"
              onClick={(e) => handleRenameClick(node, e)}
            >
              <Edit size={13} />
            </button>
            <button 
              className="sidebar-action-btn" 
              title="刪除"
              onClick={(e) => handleDeleteClick(node, e)}
            >
              <Trash size={13} />
            </button>
          </div>
        </div>

        {isDirectory && isExpanded && node.children && (
          <div className="tree-node-children">
            {node.children.map(child => renderTreeNode(child, depth + 1, folder))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="app-sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <span className="workspace-title" title={workspaceName}>
          <BookOpen size={16} style={{ color: 'var(--accent)' }} />
          {isWorkshopTab ? (managedLibrary ? '我的 WIKITREE' : (workspaceName || 'WIKITREE 尚未就緒')) : 'WIKITREE ORBIT'}
        </span>
      </div>

      {/* Primary Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', borderBottom: '1px solid var(--border-color)', padding: '8px' }}>
        <button
          className={`btn ${isOrbitTab ? 'btn-primary' : ''}`}
          style={{ padding: '8px 6px', fontSize: '12px', border: 'none', background: isOrbitTab ? undefined : 'transparent' }}
          onClick={() => setActiveTab('explore')}
        >
          <Globe size={14} />
          ORBIT
        </button>
        <button
          className={`btn ${isWorkshopTab ? 'btn-primary' : ''}`}
          style={{ padding: '8px 6px', fontSize: '12px', border: 'none', background: isWorkshopTab ? undefined : 'transparent' }}
          onClick={() => setActiveTab('files')}
        >
          <FileText size={14} />
          WIKITREE
        </button>
      </div>

      {isOrbitTab && (
        <div className="orbit-subnav" aria-label="Orbit 導覽">
          <button
            type="button"
            className={`orbit-subnav-button ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            <Globe size={14} />
            <span><strong>探索</strong><small>知識生態與共享筆記</small></span>
          </button>
          <button
            type="button"
            className={`orbit-subnav-button ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <Sparkles size={14} />
            <span><strong>技能</strong><small>筆記 Skill 與公開來源</small></span>
          </button>
          <button
            type="button"
            className={`orbit-subnav-button ${activeTab === 'exploration' ? 'active' : ''}`}
            onClick={() => setActiveTab('exploration')}
          >
            <Sprout size={14} />
            <span><strong>探索苗圃</strong><small>排程探索與來源草稿</small></span>
          </button>
          <button
            type="button"
            className={`orbit-subnav-button ${activeTab === 'style' ? 'active' : ''}`}
            onClick={() => setActiveTab('style')}
          >
            <Palette size={14} />
            <span><strong>風格</strong><small>打造你的森林樣貌</small></span>
          </button>
        </div>
      )}

      {isWorkshopTab && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', borderBottom: '1px solid var(--border-color)', padding: '6px 8px', backgroundColor: 'var(--bg-secondary)' }}>
          <button
            className={`btn ${activeTab === 'files' ? 'btn-primary' : ''}`}
            style={{ flex: '1 1 72px', padding: '6px 4px', fontSize: '11px', border: 'none', background: activeTab === 'files' ? undefined : 'transparent' }}
            onClick={() => setActiveTab('files')}
          >
            <FileText size={14} />
            LEAVES
          </button>
          <button
            className={`btn ${activeTab === 'history' ? 'btn-primary' : ''}`}
            style={{ flex: '1 1 72px', padding: '6px 4px', fontSize: '11px', border: 'none', background: activeTab === 'history' ? undefined : 'transparent' }}
            onClick={() => setActiveTab('history')}
          >
            <History size={14} />
            EVOLVE
          </button>
          <button
            className={`btn ${activeTab === 'publish' ? 'btn-primary' : ''}`}
            style={{ flex: '1 1 72px', padding: '6px 4px', fontSize: '11px', border: 'none', background: activeTab === 'publish' ? undefined : 'transparent' }}
            onClick={() => setActiveTab('publish')}
          >
            <Globe size={14} />
            SIGNAL
          </button>
        </div>
      )}

      {/* Legacy Navigation Tabs kept hidden while the UI migrates to dry/wet separation. */}
      <div style={{ display: 'none' }}>
        <button 
          className={`btn ${activeTab === 'explore' ? 'btn-primary' : ''}`}
          style={{ flex: '1 1 72px', padding: '6px 4px', fontSize: '11px', border: 'none', background: activeTab === 'explore' ? undefined : 'transparent' }}
          onClick={() => setActiveTab('explore')}
        >
          <BookOpen size={14} />
          課程
        </button>
        <button 
          className={`btn ${activeTab === 'files' ? 'btn-primary' : ''}`}
          style={{ flex: '1 1 72px', padding: '6px 4px', fontSize: '11px', border: 'none', background: activeTab === 'files' ? undefined : 'transparent' }}
          onClick={() => setActiveTab('files')}
        >
          <FileText size={14} />
          筆記
        </button>
        <button 
          className={`btn ${activeTab === 'history' ? 'btn-primary' : ''}`}
          style={{ flex: '1 1 72px', padding: '6px 4px', fontSize: '11px', border: 'none', background: activeTab === 'history' ? undefined : 'transparent' }}
          onClick={() => setActiveTab('history')}
        >
          <History size={14} />
          歷史
        </button>
        <button 
          className={`btn ${activeTab === 'publish' ? 'btn-primary' : ''}`}
          style={{ flex: '1 1 72px', padding: '6px 4px', fontSize: '11px', border: 'none', background: activeTab === 'publish' ? undefined : 'transparent' }}
          onClick={() => setActiveTab('publish')}
        >
          <Globe size={14} />
          發布
        </button>
      </div>

      {isWorkshopTab && (
        <>
          <button className="btn library-import-trigger" disabled={!rootHandle || workspaceBusy} onClick={onAddWorkspace} style={{ margin: '10px 8px 0', fontSize: '12px' }}>
            <Import size={14} /> 收進 WikiTree
          </button>
          {/* Prominent Quick Actions - Always rendered so they can click immediately */}
          <div style={{ display: 'flex', gap: '6px', padding: '10px 8px 4px 8px', flexShrink: 0 }}>
            <button 
              className="btn btn-primary" 
              disabled={!rootHandle || workspaceBusy}
              onClick={(e) => {
                e.stopPropagation();
                if (onQuickNewFile) onQuickNewFile();
                else handleCreateFileClick('', e);
              }}
              style={{ flex: 1, padding: '6px 4px', fontSize: '12px', gap: '4px' }}
              title="立即建立並開啟空白新文件"
            >
              <Plus size={13} />
              空白新筆記
            </button>
            <button 
              className="btn" 
              disabled={!rootHandle || workspaceBusy}
              onClick={(e) => handleCreateFolderClick('', e)}
              style={{ flex: 1, padding: '6px 4px', fontSize: '12px', gap: '4px' }}
            >
              <FolderPlus size={13} />
              新增子資料夾
            </button>
          </div>

          {workspaceFolders.length > 0 ? (
            <>
              {/* Search bar */}
              <div className="search-container" style={{ padding: '8px', flexShrink: 0 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={14} style={{ position: 'absolute', left: '8px', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="搜尋已載入的筆記…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', paddingLeft: '28px', height: '30px', fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* Root Level Actions Title */}
              <div className="sidebar-section-title" style={{ padding: '4px 12px 2px 12px' }}>
                <span>我的 WikiTree</span>
              </div>

              {/* File Tree */}
              <div className="tree-container">
                {workspaceFolders.map(folder => {
                  const expanded = managedLibrary || expandedRoots.has(folder.id);
                  const selected = activeWorkspaceId === folder.id && !!rootHandle;
                  const folderFiles = selected ? files : folder.files;
                  const filtered = filterNodes(folderFiles || [], searchQuery);
                  return (
                    <section key={folder.id} className="workspace-folder">
                      <div className={`tree-node-item ${selected ? 'active' : ''}`} title={managedLibrary ? 'WikiTree 自動管理的筆記天地' : (typeof folder.handle === 'string' ? folder.handle : folder.name)}>
                        {managedLibrary ? (
                          <div style={{ width: '20px', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}><BookOpen size={14} /></div>
                        ) : (
                          <button className="theme-toggle-btn node-chevron-btn" aria-label={`${expanded ? '收合' : '展開'} ${folder.name}`} aria-expanded={expanded} disabled={workspaceBusy} onClick={() => toggleRoot(folder)}>
                            <ChevronRight className={`node-chevron ${expanded ? 'expanded' : ''}`} />
                          </button>
                        )}
                        <button className="workspace-folder-label" disabled={workspaceBusy} onClick={() => {
                          if (!managedLibrary && !expanded) toggleRoot(folder);
                          if (!selected) onActivateWorkspace(folder);
                        }}>
                          {expanded ? <FolderOpen size={15} /> : <Folder size={15} />}
                          <span className="node-label">{folder.name}</span>
                          {selected && <small>目前</small>}
                        </button>
                        {!managedLibrary && (
                          <button className="sidebar-action-btn" disabled={workspaceBusy} title="從清單移除（不刪除檔案）" aria-label={`關閉 ${folder.name}，不刪除檔案`} onClick={() => onRemoveWorkspace(folder.id)}>
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      {expanded && (
                        <div style={{ paddingLeft: '8px' }}>
                          {folder.error ? (
                            <div className="workspace-folder-message">{folder.error} <button className="btn" onClick={() => onExpandWorkspace(folder)}>重試</button></div>
                          ) : !folderFiles ? (
                            <div className="workspace-folder-message">正在讀取…</div>
                          ) : filtered.length ? filtered.map(node => renderTreeNode(node, 0, folder)) : (
                            <div className="workspace-folder-message">{searchQuery ? '沒有符合的筆記' : '資料夾目前是空的'}</div>
                          )}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ padding: '20px 12px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.5' }}>
              WikiTree 正在準備你的筆記天地，完成後就能直接建立第一片葉。
            </div>
          )}
        </>
      )}

      {(activeTab === 'history' || activeTab === 'publish') && (
        <div style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {!rootHandle ? (
            <p>請先開啟創意工房資料夾，才能檢視版本與發布筆記。</p>
          ) : activeTab === 'history' ? (
            <p>請使用上方工具列的「歷史紀錄」按鈕檢視並還原手動快照快照，或在左側分頁中點擊快照記錄。</p>
          ) : (
            <p>已準備好發布！請點擊上方工具列的「發布網站」按鈕編譯您的筆記網站。</p>
          )}
        </div>
      )}

      {/* User Profile Card at the Bottom with Popover Support */}
      <div 
        style={{ 
          marginTop: 'auto', 
          borderTop: '1px solid var(--border-color)', 
          padding: '12px 16px', 
          backgroundColor: 'var(--bg-secondary)',
          flexShrink: 0,
          position: 'relative'
        }}
      >
        {/* Click catcher backdrop when popover is open */}
        {showProfilePopover && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              cursor: 'default',
              backgroundColor: 'transparent'
            }}
            onClick={() => setShowProfilePopover(false)}
          />
        )}

        {/* Popover Card */}
        {user && showProfilePopover && (
          <div 
            className="popover-enter popover-active"
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: '12px',
              right: '12px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Popover Header / Brand Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--success)' }}>
                  {user.isSupabaseUser ? '政大雲端驗證帳戶 (Supabase)' : '政大本地驗證帳戶'}
                </span>
              </div>
            </div>

            {/* Profile Detail */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '50%', 
                background: getAvatarGradient(user.nickname), 
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '18px', 
                fontWeight: 'bold',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {user.nickname.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.nickname}
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  @{user.username}
                </span>
              </div>
            </div>

            {/* Detailed NCCU Info Table */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px', 
              fontSize: '12px', 
              borderTop: '1px solid var(--border-color)', 
              borderBottom: '1px solid var(--border-color)', 
              padding: '10px 0', 
              color: 'var(--text-secondary)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>帳號學號：</span>
                <strong style={{ color: 'var(--text-primary)' }}>{user.username}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>所屬學院：</span>
                <strong style={{ color: 'var(--text-primary)' }}>{user.college}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }}>
                <span>主修科系：</span>
                <strong 
                  style={{ 
                    color: 'var(--text-primary)', 
                    textAlign: 'right', 
                    maxWidth: '70%', 
                    textOverflow: 'ellipsis', 
                    overflow: 'hidden', 
                    whiteSpace: 'nowrap' 
                  }} 
                  title={user.department}
                >
                  {user.department}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>年級學制：</span>
                <strong style={{ color: 'var(--text-primary)' }}>{user.grade}</strong>
              </div>
            </div>

            {/* Logout Trigger */}
            <button
              onClick={() => {
                setShowProfilePopover(false);
                if (onLogout) onLogout();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: 'var(--danger)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <LogOut size={13} />
              登出政大帳戶
            </button>
          </div>
        )}

        {/* Profile Card Main Area */}
        {user ? (
          <div 
            onClick={() => setShowProfilePopover(!showProfilePopover)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              width: '100%', 
              gap: '10px',
              padding: '6px 8px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
              <div 
                className={user.isSupabaseUser ? "avatar-glow-mock" : "avatar-glow-real"}
                style={{ 
                  borderRadius: '50%', 
                  padding: '2px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0 
                }}
              >
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  background: getAvatarGradient(user.nickname), 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '12px', 
                  fontWeight: 'bold' 
                }}>
                  {user.nickname.charAt(0).toUpperCase()}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.nickname}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.department} {user.grade.split(' ')[1] || user.grade}
                </span>
              </div>
            </div>
            {/* Micro chevron arrow indicating clickable action */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}>
              <ChevronRight size={14} style={{ transform: showProfilePopover ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleLoginClick}
              style={{ width: '100%', padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '8px' }}
            >
              <LogIn size={14} />
              登入政大帳戶
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
