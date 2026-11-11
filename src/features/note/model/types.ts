/**
 * The domain of an encounter note. Everything the UI renders is described by
 * these types, so a real transcription and drafting service only has to
 * return data in this shape. See README, "Plugging in a real backend".
 */

export type Speaker = 'Clinician' | 'Patient';

/** A run of transcript text. `span` marks text that a field can cite. */
export type Segment = { text: string; span?: string };

/** One speaker turn, timestamped as `mm:ss` from the start of the visit. */
export type Turn = { id: string; speaker: Speaker; time: string; segments: Segment[] };

/**
 * How a drafted field relates to the transcript.
 * - cited: drafted, and every claim points at a line.
 * - conflict: the transcript holds two answers. The clinician picks one.
 * - gap: the conversation never covered it. The draft leaves it empty on purpose.
 * - judgment: a clinical call the draft must not make. It shows related lines only.
 */
export type FieldKind = 'cited' | 'conflict' | 'gap' | 'judgment';

/** An answer the clinician can pick for a field the draft could not decide. */
export type FieldOption = {
  id: string;
  label: string;
  detail: string;
  /** The value written to the note when picked. Defaults to `label`. */
  value?: string;
  /** Opens a free-text input instead of writing a value. */
  freeText?: boolean;
  sources: string[];
};

export type Field = {
  id: string;
  label: string;
  kind: FieldKind;
  /** The drafted value, for cited fields. */
  draft?: string;
  /** Transcript spans the field cites, or that help with a decision. */
  sources: string[];
  options?: FieldOption[];
  /** The question asked of the clinician when the draft cannot decide. */
  question?: string;
  /** One quiet line of context under the question. */
  prompt?: string;
};

export type Patient = {
  name: string;
  age: number;
  born: string;
  record: string;
  episode: string;
};

export type Visit = {
  title: string;
  date: string;
  clinician: string;
  clinicianInitials: string;
  organisation: string;
  /** Visit length in seconds, for the recorder clock. */
  length: number;
};

export type DocState = 'done' | 'todo' | 'blocked' | 'new';

/** A document in the patient's episode. */
export type EpisodeDoc = { id: string; title: string; detail: string; state: DocState };

export type PathwayStep = { label: string; when: string; state: 'done' | 'now' | 'next' | 'later' };

/** Everything known about one visit: who, what was said, and what the note asks for. */
export type Encounter = {
  patient: Patient;
  visit: Visit;
  transcript: Turn[];
  /** Said after recording resumes. Nothing in the note cites it. */
  addendum?: Turn;
  fields: Field[];
  /** The note's own document id inside `episode.docs`. */
  noteDocId: string;
  episode: { docs: EpisodeDoc[]; pathway: PathwayStep[] };
};

/** Where a field stands on the paper. */
export type FieldStatus = 'empty' | 'drafted' | 'needs' | 'decided' | 'edited';

export type FieldState = { value: string; status: FieldStatus; choice?: string };

/**
 * recording → transcribed → drafting → review → signing → filed ⇄ note
 * The visit is recorded, the note is drafted and settled, signed, filed into
 * the patient's episode, and can then be reopened for reference.
 */
export type Phase = 'recording' | 'transcribed' | 'drafting' | 'review' | 'signing' | 'filed' | 'note';
