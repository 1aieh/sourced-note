import type { Field, FieldState, Phase } from './types';

/**
 * The note's state machine. Pure: no timers, no DOM and no clock, so every
 * transition is unit tested. Timing lives in the hooks that dispatch.
 */

export type NoteState = {
  phase: Phase;
  /** `HH:mm`, set once the clinician signs. */
  signedAt?: string;
  fields: Record<string, FieldState>;
  /** The open question in focus during review. */
  current: string | null;
};

export type NoteAction =
  | { type: 'reset' }
  | { type: 'transcribed' }
  | { type: 'resume' }
  | { type: 'draft' }
  | { type: 'reveal'; id: string }
  | { type: 'review' }
  | { type: 'choose'; id: string; choice: string; value: string }
  | { type: 'edit'; id: string; value: string }
  | { type: 'revert'; id: string }
  | { type: 'reopen'; id: string }
  | { type: 'activate'; id: string | null }
  | { type: 'sign'; at: string }
  | { type: 'file' }
  | { type: 'open-note' }
  | { type: 'to-episode' };

const EMPTY: FieldState = { value: '', status: 'empty' };

export function initialNoteState(fields: Field[]): NoteState {
  return { phase: 'recording', current: null, fields: Object.fromEntries(fields.map((f) => [f.id, EMPTY])) };
}

/** What the draft puts on the paper: a cited value, or an open question. */
export function draftedState(field: Field): FieldState {
  return field.kind === 'cited'
    ? { value: field.draft ?? '', status: 'drafted' }
    : { value: '', status: 'needs' };
}

/** Ids of fields still waiting on the clinician, in note order. */
export function openQuestions(fields: Field[], state: Record<string, FieldState>): string[] {
  return fields.filter((f) => state[f.id]?.status === 'needs').map((f) => f.id);
}

/** The next open question after `after`, wrapping round to the first. */
export function nextOpenQuestion(
  fields: Field[],
  state: Record<string, FieldState>,
  after?: string,
): string | null {
  const open = openQuestions(fields, state);
  if (!after) return open[0] ?? null;
  const order = fields.map((f) => f.id);
  const from = order.indexOf(after);
  return open.find((id) => order.indexOf(id) > from) ?? open[0] ?? null;
}

export function canSign(fields: Field[], state: NoteState): boolean {
  return state.phase === 'review' && openQuestions(fields, state.fields).length === 0;
}

export function createNoteReducer(fields: Field[]) {
  const byId = Object.fromEntries(fields.map((f) => [f.id, f]));

  return function noteReducer(s: NoteState, a: NoteAction): NoteState {
    const set = (id: string, v: FieldState): NoteState => ({ ...s, fields: { ...s.fields, [id]: v } });
    const field = 'id' in a && a.id ? byId[a.id] : undefined;

    switch (a.type) {
      case 'reset':
        return initialNoteState(fields);
      case 'transcribed':
        return s.phase === 'recording' ? { ...s, phase: 'transcribed' } : s;
      case 'resume':
        return s.phase === 'transcribed' ? { ...s, phase: 'recording' } : s;
      case 'draft':
        return s.phase === 'transcribed' ? { ...s, phase: 'drafting' } : s;
      case 'reveal':
        return field && s.phase === 'drafting' && s.fields[a.id]?.status === 'empty'
          ? set(a.id, draftedState(field))
          : s;
      case 'review': {
        if (s.phase !== 'drafting') return s;
        const next = { ...s.fields };
        for (const f of fields) if (next[f.id]?.status === 'empty') next[f.id] = draftedState(f);
        return { ...s, phase: 'review', fields: next, current: nextOpenQuestion(fields, next) };
      }
      case 'choose': {
        if (!field || s.phase !== 'review') return s;
        const next = {
          ...s.fields,
          [a.id]: { value: a.value, status: 'decided' as const, choice: a.choice },
        };
        return { ...s, fields: next, current: nextOpenQuestion(fields, next, a.id) };
      }
      case 'edit':
        if (!field || field.kind !== 'cited' || s.phase !== 'review') return s;
        return set(a.id, { value: a.value, status: a.value === field.draft ? 'drafted' : 'edited' });
      case 'revert':
        return field && s.phase === 'review' ? set(a.id, draftedState(field)) : s;
      case 'reopen':
        if (!field || field.kind === 'cited' || s.phase !== 'review') return s;
        return { ...set(a.id, { value: '', status: 'needs' }), current: a.id };
      case 'activate':
        return s.phase === 'review' ? { ...s, current: a.id } : s;
      case 'sign':
        return canSign(fields, s) ? { ...s, phase: 'signing', current: null, signedAt: a.at } : s;
      case 'file':
        return s.signedAt && s.phase === 'signing' ? { ...s, phase: 'filed' } : s;
      case 'open-note':
        return s.signedAt && s.phase === 'filed' ? { ...s, phase: 'note' } : s;
      case 'to-episode':
        return s.signedAt && s.phase === 'note' ? { ...s, phase: 'filed' } : s;
    }
  };
}
