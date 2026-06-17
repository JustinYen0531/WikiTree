import React, { useState, useEffect } from 'react';
import { X, Globe, Check, AlertCircle } from 'lucide-react';
import { FileNode } from '../utils/fileSystem';
import { publishSite, PublishConfig } from '../utils/publisher';

interface PublishModalProps {
  rootHandle: FileSystemDirectoryHandle | string;
  files: FileNode[];
  onClose: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  rootHandle,
  files,
  onClose,
}) => {
  const [siteTitle, setSiteTitle] = useState('我的筆記庫');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract all file paths from the tree
  const getAllFilePaths = (nodes: FileNode[]): string[] => {
    const paths: string[] = [];
    
    function traverse(arr: FileNode[]) {
      for (const node of arr) {
        if (node.kind === 'file' && node.name.toLowerCase().endsWith('.md')) {
          paths.push(node.path);
        } else if (node.kind === 'directory' && node.children) {
          traverse(node.children);
        }
      }
    }
    
    traverse(nodes);
    return paths;
  };

  const allPaths = getAllFilePaths(files);

  // Auto-select all files on mount
  useEffect(() => {
    setSelectedPaths(allPaths);
  }, [files]);

  const handleTogglePath = (path: string) => {
    setSelectedPaths(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path) 
        : [...prev, path]
    );
  };

  const handleSelectAll = () => {
    setSelectedPaths(allPaths);
  };

  const handleSelectNone = () => {
    setSelectedPaths([]);
  };

  const handlePublish = async () => {
    if (selectedPaths.length === 0) {
      setErrorMsg('請至少選擇一篇筆記進行發布。');
      return;
    }
    
    setErrorMsg('');
    setIsPublishing(true);
    
    try {
      const config: PublishConfig = {
        siteTitle,
        theme,
        selectedPaths
      };
      
      await publishSite(rootHandle, files, config);
      setPublishSuccess(true);
    } catch (e: any) {
      console.error('Publishing failed', e);
      setErrorMsg(`發布失敗: ${e.message || '未知錯誤'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '550px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} style={{ color: 'var(--accent)' }} />
            <span>發布工作區至網頁</span>
          </div>
          <button className="theme-toggle-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {!publishSuccess ? (
          <div className="modal-body">
            {errorMsg && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '10px 12px', 
                backgroundColor: 'var(--danger-bg)', 
                color: 'var(--danger)', 
                fontSize: '13px', 
                borderRadius: 'var(--border-radius-sm)', 
                border: '1px solid rgba(226,92,92,0.2)' 
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              將您的本地筆記編譯為精美且支援響應式設計的靜態閱讀網站。編譯輸出將直接寫入您筆記資料夾中的隱藏目錄 <strong>.notes_published/</strong>。
            </p>

            {/* Site Configuration */}
            <div className="form-group">
              <label className="form-label">網站標題</label>
              <input 
                type="text" 
                className="form-input" 
                value={siteTitle} 
                onChange={(e) => setSiteTitle(e.target.value)} 
                placeholder="例如：我的學習筆記" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">預設主題</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={`btn ${theme === 'light' ? 'btn-primary' : ''}`}
                  style={{ flex: 1, padding: '6px', fontSize: '12px', background: theme === 'light' ? undefined : 'transparent' }}
                  onClick={() => setTheme('light')}
                >
                  淺色模式
                </button>
                <button 
                  className={`btn ${theme === 'dark' ? 'btn-primary' : ''}`}
                  style={{ flex: 1, padding: '6px', fontSize: '12px', background: theme === 'dark' ? undefined : 'transparent' }}
                  onClick={() => setTheme('dark')}
                >
                  深色模式
                </button>
                <button 
                  className={`btn ${theme === 'auto' ? 'btn-primary' : ''}`}
                  style={{ flex: 1, padding: '6px', fontSize: '12px', background: theme === 'auto' ? undefined : 'transparent' }}
                  onClick={() => setTheme('auto')}
                >
                  跟隨系統
                </button>
              </div>
            </div>

            {/* Select Notes */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">選擇要發布的筆記 ({selectedPaths.length} / {allPaths.length})</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="theme-toggle-btn" onClick={handleSelectAll} style={{ fontSize: '11px', color: 'var(--accent)' }}>全選</button>
                  <button className="theme-toggle-btn" onClick={handleSelectNone} style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>清除</button>
                </div>
              </div>
              
              <div className="publish-note-list">
                {allPaths.map(path => (
                  <label key={path} className="publish-list-item" style={{ cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedPaths.includes(path)} 
                      onChange={() => handleTogglePath(path)} 
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {path}
                    </span>
                  </label>
                ))}
                {allPaths.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    工作區中未找到任何 Markdown 筆記。
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="modal-body" style={{ alignItems: 'center', textAlign: 'center', padding: '30px 20px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--success-bg)', 
              color: 'var(--success)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '16px',
              border: '2px solid var(--success-border)'
            }}>
              <Check size={28} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>編譯完成！</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              您的靜態閱讀網站已成功生成於您的筆記目錄：
              <br />
              <strong style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>.notes_published/</strong>
            </p>

            <div style={{ 
              backgroundColor: 'var(--bg-sidebar)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--border-radius-md)', 
              padding: '16px', 
              fontSize: '12.5px', 
              textAlign: 'left', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              lineHeight: '1.5'
            }}>
              <strong>如何部署與使用您的網站：</strong>
              <div>1. 本地雙擊 <code style={{ fontSize: '11.5px' }}>.notes_published/index.html</code> 即可在瀏覽器中直接離線預覽，免裝伺服器！</div>
              <div>2. 將 <code style={{ fontSize: '11.5px' }}>.notes_published/</code> 目錄內的所有檔案上傳至 GitHub Pages、Netlify 或 Vercel 即可免費對外發布。</div>
              <div>3. 點擊「完成」並在您的檔案管理員中查看。</div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="modal-footer">
          {!publishSuccess ? (
            <>
              <button className="btn" onClick={onClose}>取消</button>
              <button 
                className="btn btn-primary" 
                onClick={handlePublish}
                disabled={isPublishing || allPaths.length === 0}
              >
                {isPublishing ? '正在進行編譯編寫...' : '開始編譯並生成網站'}
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={onClose}>完成</button>
          )}
        </div>
      </div>
    </div>
  );
};
