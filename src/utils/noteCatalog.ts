export type NoteCategoryType = 'course' | 'exam' | 'certification' | 'custom';

export interface NoteTarget {
  type: NoteCategoryType;
  id: string;
  title: string;
  subtitle?: string;
}

export interface NoteAssignment extends NoteTarget {
  notePath: string;
  assignedAt: string;
}

const STORAGE_KEY = 'nccu_hub_note_assignments';

const targetKey = (target: Pick<NoteTarget, 'type' | 'id'>) => `${target.type}:${target.id}`;

export const getNoteTargetKey = targetKey;

export function loadNoteAssignments(workspace?: string): NoteAssignment[] {
  try {
    const scopedKey = workspace ? `${STORAGE_KEY}:${workspace}` : STORAGE_KEY;
    const legacyOwner = localStorage.getItem(`${STORAGE_KEY}:legacy-owner`);
    const raw = localStorage.getItem(scopedKey) || (workspace && (!legacyOwner || legacyOwner === workspace) ? localStorage.getItem(STORAGE_KEY) : null);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNoteAssignments(assignments: NoteAssignment[], workspace?: string) {
  if (workspace && !localStorage.getItem(`${STORAGE_KEY}:legacy-owner`)) {
    localStorage.setItem(`${STORAGE_KEY}:legacy-owner`, workspace);
  }
  localStorage.setItem(workspace ? `${STORAGE_KEY}:${workspace}` : STORAGE_KEY, JSON.stringify(assignments));
}

export function assignNoteToTarget(
  assignments: NoteAssignment[],
  notePath: string,
  target: NoteTarget
): NoteAssignment[] {
  const key = targetKey(target);
  const withoutDuplicate = assignments.filter(
    (assignment) => !(assignment.notePath === notePath && targetKey(assignment) === key)
  );

  return [
    ...withoutDuplicate,
    {
      ...target,
      notePath,
      assignedAt: new Date().toISOString(),
    },
  ];
}

export function removeNoteAssignment(
  assignments: NoteAssignment[],
  notePath: string,
  target: Pick<NoteTarget, 'type' | 'id'>
): NoteAssignment[] {
  const key = targetKey(target);
  return assignments.filter(
    (assignment) => !(assignment.notePath === notePath && targetKey(assignment) === key)
  );
}
