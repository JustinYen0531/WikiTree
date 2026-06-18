import React, { useState } from 'react';
import { X, Globe, Check, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured, getLocalPublishedNotes, saveLocalPublishedNotes } from '../utils/supabase';
import { FileNode } from '../utils/fileSystem';

interface PublishNoteModalProps {
  activeFile: FileNode | null;
  content: string;
  user: {
    username: string;
    nickname: string;
    college: string;
    department: string;
    grade: string;
    isSupabaseUser?: boolean;
  } | null;
  onClose: () => void;
  onSuccess?: (title: string) => void;
}

export const PublishNoteModal: React.FC<PublishNoteModalProps> = ({
  activeFile,
  content,
  user,
  onClose,
  onSuccess,
}) => {
  const defaultTitle = activeFile ? activeFile.name.replace(/\.md$/i, '') : '未命名筆記';
  const [title, setTitle] = useState(defaultTitle);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Anyone logged in can publish (either to cloud or locally)
  const canPublish = !!user; 
  const isLocalMode = !isSupabaseConfigured() || !user?.isSupabaseUser;

  const handlePublish = async () => {
    if (!title.trim()) {
      setError('請輸入筆記標題');
      return;
    }
    if (!user) {
      setError('請先登入帳戶後再進行發布。');
      return;
    }

    setIsPublishing(true);
    setError('');

    // Local Storage publish fallback
    if (isLocalMode) {
      try {
        const localNotes = getLocalPublishedNotes();
        const newNote = {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
          user_id: `local_${user.username}`,
          author_username: user.username,
          author_nickname: user.nickname,
          title: title.trim(),
          content: content,
          note_path: activeFile?.path || '',
          created_at: new Date().toISOString(),
          is_public: true,
        };
        localNotes.push(newNote);
        saveLocalPublishedNotes(localNotes);

        setSuccess(true);
        setIsPublishing(false);
        if (onSuccess) onSuccess(title.trim());
        setTimeout(() => onClose(), 2000);
      } catch (err: any) {
        setError(`本地發布失敗：${err.message || err}`);
        setIsPublishing(false);
      }
      return;
    }

    // Supabase cloud publish flow
    if (!supabase) {
      setError('Supabase 未設定，無法發布。');
      setIsPublishing(false);
      return;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setError('無法取得登入資訊，請重新登入。');
        setIsPublishing(false);
        return;
      }

      const { error: insertError } = await supabase.from('published_notes').insert({
        user_id: authUser.id,
        author_username: user.username,
        author_nickname: user.nickname,
        title: title.trim(),
        content: content,
        note_path: activeFile?.path || '',
        is_public: true,
      });

      if (insertError) {
        setError(`發布失敗：${insertError.message}`);
        setIsPublishing(false);
        return;
      }

      setSuccess(true);
      setIsPublishing(false);
      if (onSuccess) onSuccess(title.trim());
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setError(`發布時發生錯誤：${err.message || err}`);
      setIsPublishing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '480px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>
              發布筆記到社群
            </span>
          </div>
          <button className="theme-toggle-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {success ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '24px 0',
                color: 'var(--success)',
              }}
            >
              <Check size={40} />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>發布成功！</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                其他政大同學現在可以在「線上探索 → 社群筆記」看到你的筆記。
              </span>
            </div>
          ) : (
            <>
              {!canPublish ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    marginBottom: '16px',
                  }}
                >
                  <AlertCircle size={15} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '13px', color: 'var(--danger)', lineHeight: '1.5' }}>
                    請先註冊並登入政大 Hub 帳戶才能發布筆記。
                  </span>
                </div>
              ) : isLocalMode ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    marginBottom: '16px',
                  }}
                >
                  <Globe size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '13px', color: 'var(--accent)', lineHeight: '1.5' }}>
                    本地測試模式：發布的筆記將儲存於瀏覽器本地快取，僅能於本機檢視與測試「進入森林」相關功能。
                  </span>
                </div>
              ) : null}

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}
                >
                  筆記標題
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="輸入要顯示給大家看的標題"
                  style={{ width: '100%' }}
                  disabled={!canPublish}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}
                >
                  筆記預覽（前 200 字）
                </label>
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    maxHeight: '100px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {content.slice(0, 200) || '（筆記內容為空）'}
                  {content.length > 200 && '…'}
                </div>
              </div>

              {user && (
                <div style={{ marginBottom: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  將以 <strong style={{ color: 'var(--text-primary)' }}>{user.nickname}</strong>（{user.username}）的名義發布。
                </div>
              )}

              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--danger-bg)',
                    border: '1px solid var(--success-border)',
                    marginBottom: '16px',
                  }}
                >
                  <AlertCircle size={15} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '13px', color: 'var(--danger)' }}>{error}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button className="btn" onClick={onClose} disabled={isPublishing}>
                  取消
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handlePublish}
                  disabled={!canPublish || isPublishing}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      發布中...
                    </>
                  ) : (
                    <>
                      <Globe size={14} />
                      發布筆記
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
