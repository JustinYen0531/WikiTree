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
  TreePine,
} from 'lucide-react';
import { FileNode } from '../utils/fileSystem';
import { isSupabaseConfigured } from '../utils/supabase';

interface SidebarProps {
  rootHandle: FileSystemDirectoryHandle | string | null;
  workspaceName: string;
  files: FileNode[];
  activeFile: FileNode | null;
  onSelectFile: (file: FileNode) => void;
  onCreateFile: (parentPath: string) => void;
  onCreateFolder: (parentPath: string) => void;
  onRename: (node: FileNode, newName: string) => void;
  onDelete: (node: FileNode) => void;
  activeTab: 'courses' | 'files' | 'history' | 'publish' | 'antigravity';
  setActiveTab: (tab: 'courses' | 'files' | 'history' | 'publish' | 'antigravity') => void;
  user?: { username: string; nickname: string; college: string; department: string; grade: string; isSupabaseUser?: boolean } | null;
  onLogout?: () => void;
  onTriggerLogin?: () => void;
  onOpenForest?: () => void;
  onOpenFolder?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
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
  user,
  onLogout,
  onTriggerLogin,
  onOpenForest,
  onOpenFolder,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfilePopover, setShowProfilePopover] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const isWorkshopTab = activeTab === 'files' || activeTab === 'history' || activeTab === 'publish' || activeTab === 'antigravity';

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
    const colors = [
      'linear-gradient(135deg, #111111 0%, #3a3a3a 100%)',
      'linear-gradient(135deg, #2a2a2a 0%, #5a5a5a 100%)',
      'linear-gradient(135deg, #000000 0%, #444444 100%)',
      'linear-gradient(135deg, #333333 0%, #777777 100%)',
      'linear-gradient(135deg, #1f1f1f 0%, #666666 100%)',
      'linear-gradient(135deg, #0f0f0f 0%, #4f4f4f 100%)'
    ];
    const index = Math.abs((name || 'A').charCodeAt(0) % colors.length);
    return colors[index];
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

  const filteredFiles = filterNodes(files, searchQuery);

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: FileNode, depth: number = 0) => {
    const isDirectory = node.kind === 'directory';
    const isExpanded = expandedPaths.has(node.path) || searchQuery !== '';
    const isActive = activeFile?.path === node.path;

    return (
      <div key={node.path} className="file-tree-node">
        <div 
          className={`tree-node-item ${isActive ? 'active' : ''}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => !isDirectory && onSelectFile(node)}
        >
          {isDirectory ? (
            <button 
              className="theme-toggle-btn node-chevron-btn" 
              onClick={(e) => toggleExpand(node.path, e)}
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

          <div className="node-actions">
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
            {node.children.map(child => renderTreeNode(child, depth + 1))}
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
          {isWorkshopTab ? (workspaceName || '創意工房尚未開啟') : 'NCCU Hub'}
        </span>
      </div>

      {/* Primary Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', borderBottom: '1px solid var(--border-color)', padding: '8px' }}>
        <button
          className={`btn ${activeTab === 'courses' ? 'btn-primary' : ''}`}
          style={{ padding: '8px 6px', fontSize: '12px', border: 'none', background: activeTab === 'courses' ? undefined : 'transparent' }}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={14} />
          線上探索
        </button>
        <button
          className={`btn ${isWorkshopTab ? 'btn-primary' : ''}`}
          style={{ padding: '8px 6px', fontSize: '12px', border: 'none', background: isWorkshopTab ? undefined : 'transparent' }}
          onClick={() => setActiveTab('files')}
        >
          <FileText size={14} />
          創意工房
        </button>
      </div>

      {isWorkshopTab && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', borderBottom: '1px solid var(--border-color)', padding: '6px 8px', backgroundColor: 'var(--bg-secondary)' }}>
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
            版本
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
      )}

      {/* Legacy Navigation Tabs kept hidden while the UI migrates to dry/wet separation. */}
      <div style={{ display: 'none' }}>
        <button 
          className={`btn ${activeTab === 'courses' ? 'btn-primary' : ''}`}
          style={{ flex: '1 1 72px', padding: '6px 4px', fontSize: '11px', border: 'none', background: activeTab === 'courses' ? undefined : 'transparent' }}
          onClick={() => setActiveTab('courses')}
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

      {activeTab === 'files' && (
        <>
          {/* Prominent Quick Actions - Always rendered so they can click immediately */}
          <div style={{ display: 'flex', gap: '6px', padding: '10px 8px 4px 8px', flexShrink: 0 }}>
            <button
              className="btn btn-primary"
              onClick={(e) => handleCreateFileClick('', e)}
              style={{ flex: 1, padding: '6px 4px', fontSize: '12px', gap: '4px' }}
            >
              <Plus size={13} />
              新增筆記
            </button>
            <button
              className="btn"
              onClick={(e) => handleCreateFolderClick('', e)}
              style={{ flex: 1, padding: '6px 4px', fontSize: '12px', gap: '4px' }}
            >
              <FolderPlus size={13} />
              新增資料夾
            </button>
            <button
              className="btn"
              onClick={onOpenFolder}
              title="開啟其他資料夾"
              style={{ flexShrink: 0, padding: '6px 8px', fontSize: '12px', gap: '4px' }}
            >
              <FolderOpen size={13} />
            </button>
          </div>

          {rootHandle ? (
            <>
              {/* Search bar */}
              <div className="search-container" style={{ padding: '8px', flexShrink: 0 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={14} style={{ position: 'absolute', left: '8px', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="快速搜尋..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', paddingLeft: '28px', height: '30px', fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* Root Level Actions Title */}
              <div className="sidebar-section-title" style={{ padding: '4px 12px 2px 12px' }}>
                <span>工作區檔案</span>
              </div>

              {/* File Tree */}
              <div className="tree-container">
                {filteredFiles.length === 0 ? (
                  <div style={{ padding: '20px 8px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    未找到任何筆記
                  </div>
                ) : (
                  filteredFiles.map(node => renderTreeNode(node, 0))
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: '20px 12px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.5' }}>
              請先進入創意工房，建立新筆記，或開啟一個工房資料夾來載入筆記。
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

            {/* Enter Forest Button */}
            <button
              onClick={() => {
                setShowProfilePopover(false);
                if (onOpenForest) onOpenForest();
              }}
              className="btn-outline-content"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%',
                padding: '10px 12px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#ffffff',
                backgroundColor: '#2e7d32',
                background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'transform 0.15s, opacity 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '4px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <TreePine size={14} />
              進入我的森林
            </button>

            {/* Logout Trigger */}
            <button
              onClick={() => {
                setShowProfilePopover(false);
                if (onLogout) onLogout();
              }}
              className="btn-outline-content"
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
