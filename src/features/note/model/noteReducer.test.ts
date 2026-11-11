import { demoEncounter } from '../data/demoEncounter';
import type { NoteAction, NoteState } from './noteReducer';
import { canSign, createNoteReducer, initialNoteState, nextOpenQuestion, openQuestions } from './noteReducer';

const { fields } = demoEncounter;
const reducer = createNoteReducer(fields);
const run = (...actions: NoteAction[]) => actions.reduce(reducer, initialNoteState(fields));

const toReview = (): NoteState => run({ type: 'transcribed' }, { type: 'draft' }, { type: 'review' });

const answerAll: NoteAction[] = [
  { type: 'choose', id: 'date', choice: 'mar-2021', value: 'March 2021' },
  { type: 'choose', id: 'pain', choice: 'not-assessed', value: 'Not assessed' },
  { type: 'choose', id: 'k', choice: 'K3', value: 'K3' },
];

describe('noteReducer', () => {
  it('starts recording with every field empty', () => {
    const s = initialNoteState(fields);
    expect(s.phase).toBe('recording');
    expect(Object.values(s.fields).every((f) => f.status === 'empty')).toBe(true);
  });

  it('moves through the recording phases in order only', () => {
    expect(run({ type: 'draft' }).phase).toBe('recording');
    expect(run({ type: 'transcribed' }).phase).toBe('transcribed');
    expect(run({ type: 'transcribed' }, { type: 'resume' }).phase).toBe('recording');
    expect(run({ type: 'transcribed' }, { type: 'draft' }).phase).toBe('drafting');
  });

  it('reveals one field at a time while drafting', () => {
    const s = run(
      { type: 'transcribed' },
      { type: 'draft' },
      { type: 'reveal', id: 'reason' },
      { type: 'reveal', id: 'date' },
    );
    expect(s.fields.reason).toEqual({ value: fields[0]!.draft, status: 'drafted' });
    expect(s.fields.date?.status).toBe('needs');
    expect(s.fields.level?.status).toBe('empty');
  });

  it('ignores reveals outside drafting', () => {
    expect(run({ type: 'reveal', id: 'reason' }).fields.reason?.status).toBe('empty');
  });

  it('drafts cited fields and turns the rest into questions on review', () => {
    const s = toReview();
    expect(s.phase).toBe('review');
    expect(openQuestions(fields, s.fields)).toEqual(['date', 'pain', 'k']);
    expect(s.current).toBe('date');
    expect(s.fields.level).toEqual({ value: 'Transtibial, left', status: 'drafted' });
  });

  it('moves to the next open question after each answer, and wraps round', () => {
    let s = reducer(toReview(), {
      type: 'choose',
      id: 'pain',
      choice: 'not-assessed',
      value: 'Not assessed',
    });
    expect(s.current).toBe('k');
    s = reducer(s, { type: 'choose', id: 'k', choice: 'K3', value: 'K3' });
    expect(s.current).toBe('date');
    s = reducer(s, { type: 'choose', id: 'date', choice: 'mar-2021', value: 'March 2021' });
    expect(s.current).toBeNull();
    expect(s.fields.date).toEqual({ value: 'March 2021', status: 'decided', choice: 'mar-2021' });
  });

  it('marks an edit, and an edit back to the draft as drafted again', () => {
    let s = reducer(toReview(), { type: 'edit', id: 'goals', value: 'Walk the dog, 2 km.' });
    expect(s.fields.goals?.status).toBe('edited');
    s = reducer(s, { type: 'edit', id: 'goals', value: fields.find((f) => f.id === 'goals')!.draft! });
    expect(s.fields.goals?.status).toBe('drafted');
  });

  it('does not let a question be edited as free text', () => {
    const s = toReview();
    expect(reducer(s, { type: 'edit', id: 'date', value: 'whenever' })).toBe(s);
  });

  it('reverts an edit to the draft', () => {
    const s = run(
      { type: 'transcribed' },
      { type: 'draft' },
      { type: 'review' },
      { type: 'edit', id: 'reason', value: 'Changed' },
      { type: 'revert', id: 'reason' },
    );
    expect(s.fields.reason?.status).toBe('drafted');
  });

  it('reopens a decided question and focuses it', () => {
    const s = [...answerAll, { type: 'reopen', id: 'k' } as NoteAction].reduce(reducer, toReview());
    expect(s.fields.k?.status).toBe('needs');
    expect(s.current).toBe('k');
  });

  it('refuses to sign while a question is open', () => {
    const s = reducer(toReview(), { type: 'sign', at: '14:02' });
    expect(s.phase).toBe('review');
    expect(s.signedAt).toBeUndefined();
  });

  it('signs with the time it is given, then files and reopens the note', () => {
    const ready = answerAll.reduce(reducer, toReview());
    expect(canSign(fields, ready)).toBe(true);
    const signed = reducer(ready, { type: 'sign', at: '14:02' });
    expect(signed).toMatchObject({ phase: 'signing', signedAt: '14:02', current: null });
    const filed = reducer(signed, { type: 'file' });
    expect(filed.phase).toBe('filed');
    expect(reducer(filed, { type: 'open-note' }).phase).toBe('note');
    expect(reducer(reducer(filed, { type: 'open-note' }), { type: 'to-episode' }).phase).toBe('filed');
  });

  it('cannot file or open a note that was never signed', () => {
    expect(reducer(toReview(), { type: 'file' }).phase).toBe('review');
    expect(reducer(toReview(), { type: 'open-note' }).phase).toBe('review');
  });

  it('resets to the start', () => {
    const s = reducer(answerAll.reduce(reducer, toReview()), { type: 'reset' });
    expect(s).toEqual(initialNoteState(fields));
  });
});

describe('nextOpenQuestion', () => {
  it('returns null when nothing is open', () => {
    expect(nextOpenQuestion(fields, initialNoteState(fields).fields)).toBeNull();
  });
});
