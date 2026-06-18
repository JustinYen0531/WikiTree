import React, { useMemo, useState } from 'react';
import { AlertCircle, Check, FileText, Globe, Hash, Loader2, Tag, X } from 'lucide-react';
import { supabase, isSupabaseConfigured, getLocalPublishedNotes, saveLocalPublishedNotes } from '../utils/supabase';
import { FileNode } from '../utils/fileSystem';

type PublishCategory = 'course' | 'exam' | 'certification' | 'general' | 'custom';

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

const categoryOptions: Array<{
  value: PublishCategory;
  label: string;
  codeLabel: string;
  codePlaceholder: string;
  titlePlaceholder: string;
}> = [
  {
    value: 'course',
    label: '課程筆記',
    codeLabel: '課程代號',
    codePlaceholder: '例如：306001001',
    titlePlaceholder: '例如：資料結構',
  },
  {
    value: 'exam',
    label: '英文檢定 / 考試',
    codeLabel: '考試代號',
    codePlaceholder: '例如：TOEIC、IELTS、GEPT',
    titlePlaceholder: '例如：TOEIC 聽力技巧',
  },
  {
    value: 'certification',
    label: '證照',
    codeLabel: '證照代號',
    codePlaceholder: '例如：CFA、CPA、FRM',
    titlePlaceholder: '例如：CFA Level 1',
  },
  {
    value: 'general',
    label: '通用學習',
    codeLabel: '主題代號',
    codePlaceholder: '例如：writing、statistics',
    titlePlaceholder: '例如：學術寫作',
  },
  {
    value: 'custom',
    label: '自訂分類',
    codeLabel: '分類代號',
    codePlaceholder: '例如：research-method',
    titlePlaceholder: '例如：研究方法',
  },
];


export const PublishNoteModal: React.FC<PublishNoteModalProps> = ({
  activeFile,
  content,
  user,
  onClose,
  onSuccess,
}) => {
  const defaultTitle = activeFile ? activeFile.name.replace(/\.md$/i, '') : '未命名筆記';
  const [title, setTitle] = useState(defaultTitle);
  const [category, setCategory] = useState<PublishCategory>('course');
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryTitle, setCategoryTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [publishedNumber, setPublishedNumber] = useState<number | null>(null);

  const canPublish = !!user;
  const isLocalMode = !isSupabaseConfigured() || !user?.isSupabaseUser;
  const selectedCategory = categoryOptions.find((option) => option.value === category) || categoryOptions[0];
  const tags = useMemo(
    () =>
      tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsText]
  );

  const publishPayload = {
    author_username: user?.username || '',
    author_nickname: user?.nickname || '',
    title: title.trim(),
    content,
    note_path: activeFile?.path || '',
    category,
    category_label: selectedCategory.label,
    category_code: categoryCode.trim(),
    category_title: categoryTitle.trim(),
    description: description.trim(),
    tags,
    is_public: true,
  };

  const validate = () => {
    if (!title.trim()) return '請填寫筆記標題。';
    if (!categoryCode.trim()) return `請填寫${selectedCategory.codeLabel}，之後大家才能用 ID 或分類找到這篇筆記。`;
    if (!user) return '請先登入 NCCU Hub 帳號再發布筆記。';
    return '';
  };

  const handlePublish = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsPublishing(true);
    setError('');

    if (isLocalMode) {
      try {
        const localNotes = getLocalPublishedNotes();
        localNotes.push({
          ...publishPayload,
          user_id: `local_${user!.username}`,
          created_at: new Date().toISOString(),
        });
        saveLocalPublishedNotes(localNotes);

        setSuccess(true);
        setIsPublishing(false);
        onSuccess?.(title.trim());
        setTimeout(() => onClose(), 1600);
      } catch (err: any) {
        setError(`本機發布失敗：${err.message || err}`);
        setIsPublishing(false);
      }
      return;
    }

    if (!supabase) {
      setError('Supabase 尚未設定，無法發布到社群。');
      setIsPublishing(false);
      return;
    }

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setError('登入狀態已過期，請重新登入後再發布。');
        setIsPublishing(false);
        return;
      }

      const { data: insertedNote, error: insertError } = await supabase
        .from('published_notes')
        .insert({ ...publishPayload, user_id: authUser.id })
        .select('note_number')
        .single();

      if (insertError) {
        setError(`發布失敗：${insertError.message}`);
        setIsPublishing(false);
        return;
      }

      setPublishedNumber(insertedNote?.note_number ?? null);
      setSuccess(true);
      setIsPublishing(false);
      onSuccess?.(title.trim());
      setTimeout(() => onClose(), 2400);
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
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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
          <button className="theme-toggle-btn" onClick={onClose} aria-label="關閉發布視窗">
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {success ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '28px 0',
                color: 'var(--success)',
              }}
            >
              <Check size={42} />
              <span style={{ fontSize: '15px', fontWeight: '700' }}>發布成功！</span>
              {publishedNumber !== null && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <Hash size={16} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {publishedNumber}
                  </span>
                </div>
              )}
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                {publishedNumber !== null
                  ? `這是你的筆記編號，其他人可以用 #${publishedNumber} 找到它。`
                  : '你的筆記已發布到社群。'}
              </span>
            </div>
          ) : (
            <>
              {!canPublish && (
                <Notice tone="danger" icon={<AlertCircle size={15} />}>
                  請先登入 NCCU Hub 帳號，才能發布筆記。
                </Notice>
              )}

              {isLocalMode && canPublish && (
                <Notice tone="info" icon={<Globe size={15} />}>
                  目前會發布到本機測試資料；設定 Supabase 並登入雲端帳號後，會同步發布到社群資料庫。
                </Notice>
              )}

              <div style={{ display: 'grid', gap: '14px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Hash size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  發布後系統自動分配 <strong style={{ color: 'var(--text-primary)' }}>#1 ~ #99999</strong> 編號，其他人可以用這個號碼找到你的筆記。
                </div>

                <Field label="筆記標題">
                  <input
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="輸入社群中顯示的標題"
                    disabled={!canPublish}
                    style={{ width: '100%' }}
                  />
                </Field>

                <Field label="筆記分類">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '8px' }}>
                    {categoryOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`btn ${category === option.value ? 'btn-primary' : ''}`}
                        onClick={() => setCategory(option.value)}
                        disabled={!canPublish}
                        style={{ padding: '8px 6px', fontSize: '12px', minWidth: 0 }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px' }}>
                  <Field label={selectedCategory.codeLabel}>
                    <input
                      type="text"
                      className="form-input"
                      value={categoryCode}
                      onChange={(event) => setCategoryCode(event.target.value)}
                      placeholder={selectedCategory.codePlaceholder}
                      disabled={!canPublish}
                      style={{ width: '100%' }}
                    />
                  </Field>

                  <Field label="分類名稱">
                    <input
                      type="text"
                      className="form-input"
                      value={categoryTitle}
                      onChange={(event) => setCategoryTitle(event.target.value)}
                      placeholder={selectedCategory.titlePlaceholder}
                      disabled={!canPublish}
                      style={{ width: '100%' }}
                    />
                  </Field>
                </div>

                <Field label="補充說明">
                  <textarea
                    className="form-input"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="例如：期中考重點、老師上課補充、適合初學者..."
                    disabled={!canPublish}
                    rows={3}
                    style={{ width: '100%', resize: 'vertical', minHeight: '76px' }}
                  />
                </Field>

                <Field label="標籤">
                  <input
                    type="text"
                    className="form-input"
                    value={tagsText}
                    onChange={(event) => setTagsText(event.target.value)}
                    placeholder="用逗號分隔，例如：期中考, 重點整理, 英文"
                    disabled={!canPublish}
                    style={{ width: '100%' }}
                  />
                </Field>

                <Field label="內容預覽（前 200 字）">
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      maxHeight: '110px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {content.slice(0, 200) || '這篇筆記目前沒有內容。'}
                    {content.length > 200 && '...'}
                  </div>
                </Field>

                {user && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                    <FileText size={13} />
                    將以 <strong style={{ color: 'var(--text-primary)' }}>{user.nickname}</strong>（{user.username}）發布
                  </div>
                )}
              </div>

              {error && (
                <div style={{ marginTop: '16px' }}>
                  <Notice tone="danger" icon={<AlertCircle size={15} />}>
                    {error}
                  </Notice>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button className="btn" onClick={onClose} disabled={isPublishing}>
                  取消
                </button>
                <button className="btn btn-primary" onClick={handlePublish} disabled={!canPublish || isPublishing}>
                  {isPublishing ? (
                    <>
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      發布中...
                    </>
                  ) : (
                    <>
                      <Tag size={14} />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: '6px' }}>
      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>{label}</span>
      {children}
    </label>
  );
}

function Notice({
  tone,
  icon,
  children,
}: {
  tone: 'info' | 'danger';
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const isDanger = tone === 'danger';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '10px 12px',
        borderRadius: '8px',
        backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        border: isDanger ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)',
        marginBottom: '16px',
        color: isDanger ? 'var(--danger)' : 'var(--accent)',
      }}
    >
      <span style={{ flexShrink: 0, marginTop: '1px' }}>{icon}</span>
      <span style={{ fontSize: '13px', lineHeight: '1.5' }}>{children}</span>
    </div>
  );
}
