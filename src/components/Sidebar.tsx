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
  Sparkles,
  LogIn
} from 'lucide-react';
import { FileNode } from '../utils/fileSystem';
import { AntigravityPlugin } from './AntigravityPlugin';

interface SidebarProps {
  rootHandle: FileSystemDirectoryHandle | string | null;
  workspaceName: string;
  files: FileNode[];
  activeFile: FileNode | null;
  activeFileContent: string;
  onSelectFile: (file: FileNode) => void;
  onCreateFile: (parentPath: string) => void;
  onCreateFolder: (parentPath: string) => void;
  onRename: (node: FileNode, newName: string) => void;
  onDelete: (node: FileNode) => void;
  activeTab: 'files' | 'history' | 'publish' | 'antigravity';
  setActiveTab: (tab: 'files' | 'history' | 'publish' | 'antigravity') => void;
  user?: { name: string; email: string; picture: string; token: string; isMock?: boolean } | null;
  onLogout?: () => void;
  onTriggerLogin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  rootHandle,
  workspaceName,
  files,
  activeFile,
  activeFileContent,
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
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

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
          {workspaceName || '未選擇本地資料夾'}
        </span>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '4px 8px' }}>
        <button 
          className={`btn ${activeTab === 'files' ? 'btn-primary' : ''}`}
          style={{ flex: 1, padding: '6px 4px', fontSize: '11px', border: 'none', background: activeTab === 'files' ? undefined : 'transparent' }}
          onClick={() => setActiveTab('files')}
        >
          <FileText size={14} />
          筆記
        </button>
        <button 
          className={`btn ${activeTab === 'history' ? 'btn-primary' : ''}`}
          style={{ flex: 1, padding: '6px 4px', fontSize: '11px', border: 'none', background: activeTab === 'history' ? undefined : 'transparent' }}
          onClick={() => setActiveTab('history')}
        >
          <History size={14} />
          歷史
        </button>
        <button 
          className={`btn ${activeTab === 'publish' ? 'btn-primary' : ''}`}
          style={{ flex: 1, padding: '6px 4px', fontSize: '11px', border: 'none', background: activeTab === 'publish' ? undefined : 'transparent' }}
          onClick={() => setActiveTab('publish')}
        >
          <Globe size={14} />
          發布
        </button>
        <button 
          className={`btn ${activeTab === 'antigravity' ? 'btn-primary' : ''}`}
          style={{ flex: 1, padding: '6px 4px', fontSize: '11px', border: 'none', background: activeTab === 'antigravity' ? undefined : 'transparent' }}
          onClick={() => setActiveTab('antigravity')}
        >
          <Sparkles size={14} />
          AI
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
              請點擊上方按鈕建立新項目，或點擊中央的按鈕開啟一個本地資料夾作為工作區來載入筆記。
            </div>
          )}
        </>
      )}

      {activeTab === 'antigravity' && (
        <AntigravityPlugin 
          currentNotePath={activeFile ? activeFile.path : ''}
          currentNoteContent={activeFileContent}
        />
      )}

      {(activeTab === 'history' || activeTab === 'publish') && (
        <div style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {!rootHandle ? (
            <p>請先選擇本地資料夾以檢視歷史與發布筆記。</p>
          ) : activeTab === 'history' ? (
            <p>請使用上方工具列的「歷史紀錄」按鈕檢視並還原手動快照快照，或在左側分頁中點擊快照記錄。</p>
          ) : (
            <p>已準備好發布！請點擊上方工具列的「發布網站」按鈕編譯您的筆記網站。</p>
          )}
        </div>
      )}

      {/* User Profile Card at the Bottom */}
      <div 
        style={{ 
          marginTop: 'auto', 
          borderTop: '1px solid var(--border-color)', 
          padding: '12px 16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          backgroundColor: 'var(--bg-secondary)',
          flexShrink: 0 
        }}
      >
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt="avatar" 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                />
              ) : (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </span>
              </div>
            </div>
            <button 
              className="btn" 
              onClick={onLogout}
              style={{ padding: '4px 8px', fontSize: '11.5px', minHeight: 'auto', border: '1px solid var(--border-color)', height: '26px' }}
            >
              登出
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              className="btn btn-primary" 
              onClick={onTriggerLogin}
              style={{ width: '100%', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <LogIn size={13} />
              登入 Google 帳戶
            </button>
            {localStorage.getItem('antigravity_google_client_id') && (
              <div 
                id="google-signin-btn-container" 
                style={{ 
                  marginTop: '4px',
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  overflow: 'hidden'
                }}
              ></div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
