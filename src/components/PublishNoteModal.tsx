import React, { useState } from 'react';
import { X, Globe, Check, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
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

  const canPublish = isSupabaseConfigured() && user?.isSupabaseUser;

  const handlePublish = async () => {
    if (!title.trim()) {
      setError('請輸入筆記標題');
      return;
    }
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase 未設定，無法發布。');
      return;
    }
    if (!user?.isSupabaseUser) {
      setError('請使用政大雲端帳戶登入後才能發布筆記。');
      return;
    }

    setIsPublishing(true);
    setError('');

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
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(12px)',
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
          borderRadius: '4px',
          boxShadow: 'none',
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
              BROADCAST LEAF
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
                color: 'var(--text-primary)',
              }}
            >
              <Check size={40} />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>SIGNAL SENT</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                其他探索者現在可以在共享星域看見這片知識葉片。
              </span>
            </div>
          ) : (
            <>
              {!canPublish && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(255, 255, 255, 0.055)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '16px',
                  }}
                >
                  <AlertCircle size={15} style={{ color: 'rgba(255,255,255,0.72)', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {!isSupabaseConfigured()
                      ? '此環境未連線至 Supabase，無法發布。'
                      : '請使用政大雲端帳戶（@g.nccu.edu.tw）登入後才能發布筆記。'}
                  </span>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}
                >
                  LEAF TITLE
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="輸入要顯示給探索者看的標題"
                  style={{ width: '100%' }}
                  disabled={!canPublish}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}
                >
                  LEAF PREVIEW / FIRST 200 GLYPHS
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
                  將以 <strong style={{ color: 'var(--text-primary)' }}>{user.nickname}</strong>（{user.username}）的訊號署名發送。
                </div>
              )}

              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(255, 255, 255, 0.055)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '16px',
                  }}
                >
                  <AlertCircle size={15} style={{ color: 'rgba(255,255,255,0.72)', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{error}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button className="btn" onClick={onClose} disabled={isPublishing}>
                  CANCEL
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handlePublish}
                  disabled={!canPublish || isPublishing}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      SENDING...
                    </>
                  ) : (
                    <>
                      <Globe size={14} />
                      SEND SIGNAL
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
