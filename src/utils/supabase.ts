import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to check if Supabase is configured and active.
 */
export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};

// =====================================================================
// LOCAL STORAGE FALLBACK HELPERS
// =====================================================================

export const getLocalPublishedNotes = (): any[] => {
  const data = localStorage.getItem('antigravity_local_published_notes');
  return data ? JSON.parse(data) : [];
};

export const saveLocalPublishedNotes = (notes: any[]) => {
  localStorage.setItem('antigravity_local_published_notes', JSON.stringify(notes));
};

export const getLocalWaterings = (): any[] => {
  const data = localStorage.getItem('antigravity_local_note_waterings');
  return data ? JSON.parse(data) : [];
};

export const saveLocalWaterings = (waterings: any[]) => {
  localStorage.setItem('antigravity_local_note_waterings', JSON.stringify(waterings));
};

export const getLocalMessages = (): any[] => {
  const data = localStorage.getItem('antigravity_local_note_messages');
  return data ? JSON.parse(data) : [];
};

export const saveLocalMessages = (messages: any[]) => {
  localStorage.setItem('antigravity_local_note_messages', JSON.stringify(messages));
};

// =====================================================================
// UNIFIED DATABASE & LOCAL STORAGE API
// =====================================================================

/**
 * Fetch all published notes (merges Supabase public notes and local storage notes).
 */
export const fetchAllPublishedNotes = async (): Promise<any[]> => {
  let dbNotes: any[] = [];
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('published_notes')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (!error && data) {
        dbNotes = data;
      } else {
        console.warn('Supabase fetch published notes failed, using fallback:', error);
      }
    } catch (e) {
      console.warn('Supabase fetch notes error, falling back:', e);
    }
  }
  const localNotes = getLocalPublishedNotes();
  // Merge notes by unique ID to avoid duplicates
  const merged = [...dbNotes];
  localNotes.forEach(ln => {
    if (!merged.some(dn => dn.id === ln.id)) {
      merged.push(ln);
    }
  });
  // Sort by created_at descending
  return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

/**
 * Fetch waterings (likes) for a note.
 */
export const fetchWaterings = async (noteId: string): Promise<any[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('note_waterings')
        .select('*')
        .eq('note_id', noteId);
      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn('fetchWaterings DB query failed, using local fallback:', e);
    }
  }
  return getLocalWaterings().filter(w => w.note_id === noteId);
};

/**
 * Toggle watering (like/unlike) for a note.
 */
export const toggleWatering = async (noteId: string, userId: string): Promise<{ watered: boolean; count: number }> => {
  if (isSupabaseConfigured() && supabase && userId && !userId.startsWith('local_')) {
    try {
      // Check if already watered
      const { data, error } = await supabase
        .from('note_waterings')
        .select('id')
        .eq('note_id', noteId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!error) {
        if (data) {
          // Already watered, so delete it
          await supabase
            .from('note_waterings')
            .delete()
            .eq('id', data.id);
          const updated = await fetchWaterings(noteId);
          return { watered: false, count: updated.length };
        } else {
          // Not watered yet, so insert
          await supabase
            .from('note_waterings')
            .insert({ note_id: noteId, user_id: userId });
          const updated = await fetchWaterings(noteId);
          return { watered: true, count: updated.length };
        }
      }
    } catch (e) {
      console.warn('toggleWatering DB query failed, falling back to local:', e);
    }
  }

  // Local Storage Fallback
  const waterings = getLocalWaterings();
  const existingIndex = waterings.findIndex(w => w.note_id === noteId && w.user_id === userId);
  let watered = false;
  if (existingIndex > -1) {
    waterings.splice(existingIndex, 1);
  } else {
    waterings.push({
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      note_id: noteId,
      user_id: userId,
      created_at: new Date().toISOString()
    });
    watered = true;
  }
  saveLocalWaterings(waterings);
  const count = waterings.filter(w => w.note_id === noteId).length;
  return { watered, count };
};

/**
 * Fetch guest messages (comments) for a note.
 */
export const fetchMessages = async (noteId: string): Promise<any[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('note_messages')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: true });
      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn('fetchMessages DB query failed, using local fallback:', e);
    }
  }
  return getLocalMessages()
    .filter(m => m.note_id === noteId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

/**
 * Add a new guest message (comment) to a note.
 */
export const addMessage = async (
  noteId: string,
  userId: string,
  username: string,
  nickname: string,
  content: string
): Promise<any> => {
  if (isSupabaseConfigured() && supabase && userId && !userId.startsWith('local_')) {
    try {
      const { data, error } = await supabase
        .from('note_messages')
        .insert({
          note_id: noteId,
          user_id: userId,
          sender_username: username,
          sender_nickname: nickname,
          content: content.trim()
        })
        .select()
        .single();
      if (!error && data) {
        return data;
      } else {
        console.error('addMessage insert error:', error);
      }
    } catch (e) {
      console.warn('addMessage DB insert failed, falling back to local:', e);
    }
  }

  // Local Storage Fallback
  const messages = getLocalMessages();
  const newMessage = {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    note_id: noteId,
    user_id: userId || 'guest',
    sender_username: username || 'guest',
    sender_nickname: nickname || '訪客',
    content: content.trim(),
    created_at: new Date().toISOString()
  };
  messages.push(newMessage);
  saveLocalMessages(messages);
  return newMessage;
};

/**
 * Fetch all forest dashboard statistics & logs for a specific user.
 */
export const fetchUserForestData = async (
  userId: string,
  username: string
): Promise<{ notes: any[]; waterings: any[]; messages: any[] }> => {
  let notes: any[] = [];
  let waterings: any[] = [];
  let messages: any[] = [];

  const db = supabase;
  const isSupabaseUser = isSupabaseConfigured() && db && userId && !userId.startsWith('local_');

  if (isSupabaseUser) {
    try {
      // 1. Fetch user's published notes
      const { data: userNotes, error: notesError } = await db
        .from('published_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!notesError && userNotes) {
        notes = userNotes;
        const noteIds = notes.map(n => n.id);

        if (noteIds.length > 0) {
          // 2. Fetch all waterings for these notes
          const { data: noteWaterings, error: wateringsError } = await db
            .from('note_waterings')
            .select('*')
            .in('note_id', noteIds);
          if (!wateringsError && noteWaterings) {
            waterings = noteWaterings;
          }

          // 3. Fetch all messages/comments for these notes
          const { data: noteMessages, error: messagesError } = await db
            .from('note_messages')
            .select('*')
            .in('note_id', noteIds)
            .order('created_at', { ascending: false });
          if (!messagesError && noteMessages) {
            messages = noteMessages;
          }
        }
      }
    } catch (e) {
      console.warn('fetchUserForestData DB query failed, combining local data:', e);
    }
  }

  // Always merge with local data matching this user
  const localNotes = getLocalPublishedNotes().filter(n => n.author_username === username);
  localNotes.forEach(ln => {
    if (!notes.some(dn => dn.id === ln.id)) {
      notes.push(ln);
    }
  });

  const allNoteIds = notes.map(n => n.id);
  if (allNoteIds.length > 0) {
    // Merge local waterings
    const localWaterings = getLocalWaterings().filter(w => allNoteIds.includes(w.note_id));
    localWaterings.forEach(lw => {
      if (!waterings.some(dw => dw.id === lw.id)) {
        waterings.push(lw);
      }
    });

    // Merge local messages
    const localMessages = getLocalMessages().filter(m => allNoteIds.includes(m.note_id));
    localMessages.forEach(lm => {
      if (!messages.some(dm => dm.id === lm.id)) {
        messages.push(lm);
      }
    });
  }

  // Sort notes & messages by date
  notes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return { notes, waterings, messages };
};
