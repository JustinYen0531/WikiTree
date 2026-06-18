import React, { useEffect, useState } from 'react';
import {
  X,
  TreePine,
  Droplets,
  MessageSquare,
  CalendarDays,
  FileText,
  ChevronRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { fetchUserForestData, isSupabaseConfigured, supabase } from '../utils/supabase';

interface ForestDashboardProps {
  user: {
    id?: string;
    username: string;
    nickname: string;
    college: string;
    department: string;
    grade: string;
    isSupabaseUser?: boolean;
  } | null;
  onClose: () => void;
}

export const ForestDashboard: React.FC<ForestDashboardProps> = ({ user, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [waterings, setWaterings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    setLoading(true);

    const loadForestData = async () => {
      let userId = user.id;

      if (!userId && user.isSupabaseUser && isSupabaseConfigured() && supabase) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        userId = authUser?.id;
      }

      return fetchUserForestData(userId || `local_${user.username}`, user.username);
    };

    loadForestData()
      .then((data) => {
        if (!isMounted) return;
        setNotes(data.notes || []);
        setWaterings(data.waterings || []);
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load forest data:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) return null;

  // Calculate statistics
  const totalNotes = notes.length;
  const totalWaterings = waterings.length;
  const totalMessages = messages.length;

  // Find the selected note details
  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  const selectedNoteWaterings = waterings.filter((w) => w.note_id === selectedNoteId);
  const selectedNoteMessages = messages.filter((m) => m.note_id === selectedNoteId);

  // Group waterings by note to show individual note watering counts
  const getNoteWateringCount = (noteId: string) => {
    return waterings.filter((w) => w.note_id === noteId).length;
  };

  // Group messages by note to show individual note message counts
  const getNoteMessageCount = (noteId: string) => {
    return messages.filter((m) => m.note_id === noteId).length;
  };

  // Create unified activity timeline (sorted by created_at descending)
  const timelineActivities = [
    ...waterings.map((w) => ({
      id: `w_${w.id}`,
      type: 'watering',
      noteTitle: notes.find((n) => n.id === w.note_id)?.title || '已發布筆記',
      senderNickname: '有同學', // Watering is anonymous or general
      content: '幫您的筆記澆了水！',
      date: new Date(w.created_at),
    })),
    ...messages.map((m) => ({
      id: `m_${m.id}`,
      type: 'message',
      noteTitle: notes.find((n) => n.id === m.note_id)?.title || '已發布筆記',
      senderNickname: m.sender_nickname,
      content: `在您的筆記留言：『${m.content}』`,
      date: new Date(m.created_at),
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="forest-dashboard-card"
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '960px',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TreePine size={24} style={{ color: '#2e7d32' }} />
            <div>
              <span
                style={{
                  fontWeight: '700',
                  fontSize: '18px',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {user.nickname} 的個人森林
                <span
                  style={{
                    fontSize: '11px',
                    backgroundColor: 'rgba(46, 125, 50, 0.15)',
                    color: '#2e7d32',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '600',
                  }}
                >
                  {user.isSupabaseUser ? '雲端同步' : '本地測試'}
                </span>
              </span>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                在這裡，您可以細數您種下的每一棵樹（發布的筆記），以及同學們為您澆灌的雨水與留下的足跡。
              </p>
            </div>
          </div>
          <button className="theme-toggle-btn" onClick={onClose} style={{ padding: '8px' }}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            <TreePine size={36} style={{ color: '#2e7d32', animation: 'pulse 1.5s infinite' }} />
            <span>正在開啟森林...</span>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Stats Dashboard Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: 'var(--bg-primary)',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              {/* Stat Card 1 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1), rgba(27, 94, 32, 0.05))',
                  border: '1px solid rgba(46, 125, 50, 0.2)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(46, 125, 50, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2e7d32',
                  }}
                >
                  <TreePine size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    已種植樹木 (已發布筆記)
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {totalNotes} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>棵</span>
                  </div>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(30, 144, 255, 0.1), rgba(30, 144, 255, 0.05))',
                  border: '1px solid rgba(30, 144, 255, 0.2)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(30, 144, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1e90ff',
                  }}
                >
                  <Droplets size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    累積雨露 (澆水次數)
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {totalWaterings} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>滴</span>
                  </div>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.03))',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--danger)',
                  }}
                >
                  <MessageSquare size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    訪客留言 (留言數量)
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {totalMessages} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>條</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Content Panels */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Left Column - Notes List */}
              <div
                style={{
                  width: '38%',
                  borderRight: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-secondary)',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  🌲 我的樹木 (已發布筆記清單)
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                  {totalNotes === 0 ? (
                    <div
                      style={{
                        padding: '40px 16px',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                      }}
                    >
                      <Sparkles size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                      <p style={{ margin: 0 }}>您的個人森林空空如也。</p>
                      <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        到創意工房發布您的第一篇筆記吧！
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {/* Unified/Overview view option */}
                      <button
                        onClick={() => setSelectedNoteId(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: selectedNoteId === null ? '#2e7d32' : 'transparent',
                          backgroundColor: selectedNoteId === null ? 'var(--bg-primary)' : 'transparent',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (selectedNoteId !== null) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
                        }}
                        onMouseLeave={(e) => {
                          if (selectedNoteId !== null) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Sparkles size={14} style={{ color: '#2e7d32' }} />
                          <span style={{ fontSize: '13.5px', fontWeight: selectedNoteId === null ? '700' : '500' }}>
                            森林足跡總覽 (Timeline)
                          </span>
                        </div>
                        <ChevronRight size={14} style={{ opacity: 0.5 }} />
                      </button>

                      {notes.map((note) => {
                        const isSelected = selectedNoteId === note.id;
                        const wCount = getNoteWateringCount(note.id);
                        const mCount = getNoteMessageCount(note.id);
                        return (
                          <button
                            key={note.id}
                            onClick={() => setSelectedNoteId(note.id)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              padding: '12px 14px',
                              borderRadius: '8px',
                              border: '1px solid',
                              borderColor: isSelected ? '#2e7d32' : 'transparent',
                              backgroundColor: isSelected ? 'var(--bg-primary)' : 'transparent',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <span
                              style={{
                                fontSize: '13.5px',
                                fontWeight: isSelected ? '700' : '600',
                                marginBottom: '4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                width: '100%',
                              }}
                            >
                              {note.title}
                            </span>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '11px',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <Droplets size={10} style={{ color: '#1e90ff' }} /> {wCount}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <MessageSquare size={10} style={{ color: 'var(--danger)' }} /> {mCount}
                              </span>
                              <span style={{ marginLeft: 'auto' }}>
                                {new Date(note.created_at).toLocaleDateString('zh-TW')}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Activities Timeline or Note Details */}
              <div
                style={{
                  width: '62%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  padding: '24px',
                  backgroundColor: 'var(--bg-primary)',
                }}
              >
                {selectedNoteId === null ? (
                  /* ── Option A: Forest Overview Timeline ── */
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Sparkles size={16} style={{ color: '#2e7d32' }} />
                      森林最近動態
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                      {timelineActivities.length === 0 ? (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'var(--text-secondary)',
                            fontSize: '13px',
                          }}
                        >
                          <Sparkles size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                          <span>目前森林沒有風吹草動。</span>
                          <span style={{ fontSize: '11.5px', opacity: 0.7, marginTop: '2px' }}>
                            有其他同學為您的筆記澆水或留言時會顯示在這裡。
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            paddingLeft: '8px',
                            borderLeft: '2px solid var(--border-color)',
                          }}
                        >
                          {timelineActivities.map((act) => (
                            <div
                              key={act.id}
                              style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                fontSize: '12.5px',
                              }}
                            >
                              {/* Dot decorator */}
                              <div
                                style={{
                                  position: 'absolute',
                                  left: '-14px',
                                  top: '4px',
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  backgroundColor: act.type === 'watering' ? '#1e90ff' : 'var(--danger)',
                                  border: '2px solid var(--bg-primary)',
                                }}
                              />
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                                  {act.date.toLocaleDateString('zh-TW')} {act.date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    backgroundColor: 'var(--bg-secondary)',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    maxWidth: '180px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={act.noteTitle}
                                >
                                  《{act.noteTitle}》
                                </span>
                              </div>
                              <div style={{ color: 'var(--text-primary)' }}>
                                <strong style={{ marginRight: '6px' }}>
                                  {act.senderNickname}
                                </strong>
                                {act.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ── Option B: Single Note Inspection View ── */
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {selectedNote ? (
                      <>
                        <div
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            paddingBottom: '14px',
                            marginBottom: '16px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '16px',
                              fontWeight: '700',
                              color: 'var(--text-primary)',
                              marginBottom: '6px',
                            }}
                          >
                            {selectedNote.title}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              fontSize: '11.5px',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <CalendarDays size={12} />
                              發布於 {new Date(selectedNote.created_at).toLocaleDateString('zh-TW')}
                            </span>
                            {selectedNote.note_path && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <FileText size={12} />
                                來源：{selectedNote.note_path.split('/').pop()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Interactive counts for this note */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '16px',
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            backgroundColor: 'var(--bg-secondary)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Droplets size={14} style={{ color: '#1e90ff' }} />
                            獲得 <strong>{selectedNoteWaterings.length}</strong> 滴雨水澆灌
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MessageSquare size={14} style={{ color: 'var(--danger)' }} />
                            累積 <strong>{selectedNoteMessages.length}</strong> 條留言足跡
                          </span>
                        </div>

                        {/* Messages / Comments List */}
                        <div
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: '700',
                              color: 'var(--text-primary)',
                              marginBottom: '10px',
                            }}
                          >
                            💬 此筆記的訪客足跡
                          </div>

                          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                            {selectedNoteMessages.length === 0 ? (
                              <div
                                style={{
                                  padding: '24px 0',
                                  textAlign: 'center',
                                  color: 'var(--text-secondary)',
                                  fontSize: '12px',
                                  fontStyle: 'italic',
                                }}
                              >
                                🐾 此筆記尚無訪客留下留言。
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {selectedNoteMessages.map((msg) => {
                                  const initial = (msg.sender_nickname || '訪').charAt(0).toUpperCase();
                                  return (
                                    <div
                                      key={msg.id}
                                      style={{
                                        display: 'flex',
                                        gap: '10px',
                                        alignItems: 'flex-start',
                                        fontSize: '12.5px',
                                        paddingBottom: '10px',
                                        borderBottom: '1px solid var(--border-color)',
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: '26px',
                                          height: '26px',
                                          borderRadius: '50%',
                                          backgroundColor: 'var(--bg-secondary)',
                                          border: '1px solid var(--border-color)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '11px',
                                          fontWeight: 'bold',
                                          color: 'var(--text-primary)',
                                          flexShrink: 0,
                                        }}
                                      >
                                        {initial}
                                      </div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                          style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '3px',
                                          }}
                                        >
                                          <strong style={{ color: 'var(--text-primary)' }}>
                                            {msg.sender_nickname}
                                          </strong>
                                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                                            {new Date(msg.created_at).toLocaleDateString('zh-TW')}{' '}
                                            {new Date(msg.created_at).toLocaleTimeString('zh-TW', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            })}
                                          </span>
                                        </div>
                                        <div
                                          style={{
                                            color: 'var(--text-primary)',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-all',
                                            lineHeight: '1.5',
                                          }}
                                        >
                                          {msg.content}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-secondary)',
                          fontSize: '13px',
                        }}
                      >
                        載入樹木詳情失敗...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
