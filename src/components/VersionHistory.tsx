import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  FileText, 
  PlusCircle, 
  MinusCircle, 
  Edit,
  Clock
} from 'lucide-react';
import { Snapshot, SnapshotChange, getSnapshotFileContent } from '../utils/versionControl';
import { diffLines, DiffLine } from '../utils/diff';

interface VersionHistoryProps {
  rootHandle: FileSystemDirectoryHandle | string;
  snapshots: Snapshot[];
  onRestoreSnapshot: (snapshotId: string) => void;
  onClose: () => void;
  currentFilesPaths: string[];
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  rootHandle,
  snapshots,
  onRestoreSnapshot,
  onClose,
}) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [selectedFileChange, setSelectedFileChange] = useState<SnapshotChange | null>(null);
  const [diffLinesData, setDiffLinesData] = useState<DiffLine[]>([]);
  const [loadingDiff, setLoadingDiff] = useState(false);

  // Sort snapshots: latest first
  const sortedSnapshots = [...snapshots].sort((a, b) => b.timestamp - a.timestamp);

  useEffect(() => {
    if (!selectedSnapshot) {
      setSelectedFileChange(null);
      setDiffLinesData([]);
      return;
    }

    if (selectedSnapshot.changes.length > 0) {
      // Auto-select the first changed file
      setSelectedFileChange(selectedSnapshot.changes[0]);
    } else {
      setSelectedFileChange(null);
    }
  }, [selectedSnapshot]);

  useEffect(() => {
    if (!selectedSnapshot || !selectedFileChange) {
      setDiffLinesData([]);
      return;
    }

    const loadDiffData = async () => {
      setLoadingDiff(true);
      try {
        let currentText = '';
        let previousText = '';

        // 1. Get the content of the file in the selected snapshot (unless deleted)
        if (selectedFileChange.type !== 'deleted') {
          currentText = await getSnapshotFileContent(rootHandle, selectedSnapshot.id, selectedFileChange.path);
        }

        // 2. Get the content of the file in the *previous* snapshot (if modified/deleted)
        if (selectedFileChange.type === 'modified' || selectedFileChange.type === 'deleted') {
          const snapIdx = snapshots.findIndex(s => s.id === selectedSnapshot.id);
          if (snapIdx !== -1) {
            let prevSnapId = '';
            for (let i = snapIdx - 1; i >= 0; i--) {
              const hasFileChange = snapshots[i].changes.find(c => c.path === selectedFileChange.path);
              if (hasFileChange && hasFileChange.type !== 'deleted') {
                prevSnapId = snapshots[i].id;
                break;
              }
            }

            if (prevSnapId) {
              previousText = await getSnapshotFileContent(rootHandle, prevSnapId, selectedFileChange.path);
            }
          }
        }

        // Compute diff lines
        const lines = diffLines(previousText, currentText);
        setDiffLinesData(lines);
      } catch (e) {
        console.error('Error loading diff content', e);
        setDiffLinesData([{ type: 'normal', value: '載入檔案差異時出錯。' }]);
      } finally {
        setLoadingDiff(false);
      }
    };

    loadDiffData();
  }, [selectedSnapshot, selectedFileChange, rootHandle, snapshots]);

  const handleRestoreClick = () => {
    if (!selectedSnapshot) return;
    if (confirm(`您確定要將整個工作區的筆記回滾到快照「${selectedSnapshot.message}」的狀態嗎？這將會覆蓋您目前的所有修改！`)) {
      onRestoreSnapshot(selectedSnapshot.id);
      alert('工作區已成功還原！');
      onClose();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <div className="top-navbar" style={{ flexShrink: 0 }}>
        <div className="navbar-left">
          <button className="btn" onClick={onClose}>
            <ArrowLeft size={16} />
            返回編輯器
          </button>
          <span style={{ fontWeight: '600', marginLeft: '12px' }}>工作區版本歷史紀錄</span>
        </div>
      </div>

      {/* Main Panel Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Side: Snapshot List */}
        <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontSize: '14px', fontWeight: '600' }}>
            歷史版本快照 ({snapshots.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {sortedSnapshots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>
                尚未儲存任何版本。點擊上方「儲存版本」即可建立快照。
              </div>
            ) : (
              sortedSnapshots.map(snap => (
                <div 
                  key={snap.id}
                  className={`tree-node-item ${selectedSnapshot?.id === snap.id ? 'active' : ''}`}
                  onClick={() => setSelectedSnapshot(snap)}
                  style={{ 
                    padding: '12px', 
                    marginBottom: '8px', 
                    border: '1px solid var(--border-color)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    gap: '4px',
                    borderRadius: 'var(--border-radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', fontSize: '13.5px' }}>{snap.message}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <Clock size={11} />
                    {new Date(snap.timestamp).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--accent)' }}>
                    {snap.changes.length} 個檔案已變更
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Middle Side: Changed files list */}
        {selectedSnapshot ? (
          <div style={{ width: '250px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '600' }}>此快照中變更的檔案</div>
              <button className="btn btn-primary" onClick={handleRestoreClick} style={{ width: '100%', padding: '8px' }}>
                <RotateCcw size={14} />
                還原至此版本
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
              {selectedSnapshot.changes.map(change => (
                <div 
                  key={change.path}
                  className={`tree-node-item ${selectedFileChange?.path === change.path ? 'active' : ''}`}
                  onClick={() => setSelectedFileChange(change)}
                  style={{ padding: '8px', borderRadius: 'var(--border-radius-sm)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {change.type === 'added' && <PlusCircle size={14} style={{ color: 'var(--success)' }} />}
                  {change.type === 'deleted' && <MinusCircle size={14} style={{ color: 'var(--danger)' }} />}
                  {change.type === 'modified' && <Edit size={14} style={{ color: 'var(--warning)' }} />}
                  <span style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {change.path}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
            請選擇左側的歷史快照以檢視變更檔案與進行還原。
          </div>
        )}

        {/* Right Side: Diff View pane */}
        {selectedSnapshot && selectedFileChange && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontSize: '14px', fontWeight: '600', flexShrink: 0 }}>
              檔案差異比對: {selectedFileChange.path} ({selectedFileChange.type === 'added' ? '新增' : selectedFileChange.type === 'deleted' ? '刪除' : '修改'})
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-secondary)' }}>
              {loadingDiff ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                  正在計算差異比對...
                </div>
              ) : (
                <div className="diff-container" style={{ padding: '16px' }}>
                  <div className="diff-file-card">
                    <div className="diff-file-header">
                      <FileText size={14} />
                      {selectedFileChange.path}
                    </div>
                    <div className="diff-file-body">
                      {diffLinesData.map((line, idx) => (
                        <div 
                          key={idx} 
                          className={`diff-line ${line.type === 'added' ? 'added' : line.type === 'removed' ? 'removed' : ''}`}
                        >
                          <span className="diff-indicator">
                            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                          </span>
                          <span>{line.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
