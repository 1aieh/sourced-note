import type { Encounter, Field, FieldState, Turn } from './types';

/** Lookups derived once from an encounter, so components never scan the transcript. */
export type EncounterIndex = {
  fieldById: Record<string, Field>;
  spanText: Record<string, string>;
  spanTurn: Record<string, Turn>;
};

export function indexEncounter(encounter: Encounter): EncounterIndex {
  const spanText: Record<string, string> = {};
  const spanTurn: Record<string, Turn> = {};
  for (const turn of [...encounter.transcript, ...(encounter.addendum ? [encounter.addendum] : [])]) {
    for (const seg of turn.segments) {
      if (!seg.span) continue;
      spanText[seg.span] = seg.text;
      spanTurn[seg.span] = turn;
    }
  }
  return { fieldById: Object.fromEntries(encounter.fields.map((f) => [f.id, f])), spanText, spanTurn };
}

/** The first field that cites a span. */
export function fieldForSpan(fields: Field[], span: string): string | null {
  return fields.find((f) => f.sources.includes(span))?.id ?? null;
}

/** The distinct transcript times for a set of spans, in order. */
export function spanTimes(index: EncounterIndex, spans: string[]): string[] {
  return [...new Set(spans.map((s) => index.spanTurn[s]?.time).filter((t): t is string => Boolean(t)))];
}

/** The sources a field shows once settled. A resolved conflict cites only the chosen side. */
export function settledSources(field: Field, state: FieldState): string[] {
  if (state.status === 'decided' && field.kind === 'conflict') {
    return field.options?.find((o) => o.id === state.choice)?.sources ?? field.sources;
  }
  return field.sources;
}

/** `mm:ss` → seconds. */
export function toSeconds(time: string): number {
  const [m = 0, s = 0] = time.split(':').map(Number);
  return m * 60 + s;
}

/** A wall-clock time as `HH:mm`, for the signature stamp. */
export function formatClock(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** Finds broken references in an encounter: sources and options that point at nothing. */
export function validateEncounter(encounter: Encounter): string[] {
  const { spanText } = indexEncounter(encounter);
  const problems: string[] = [];
  for (const field of encounter.fields) {
    for (const span of field.sources)
      if (!(span in spanText)) problems.push(`${field.id} cites missing span ${span}`);
    for (const option of field.options ?? []) {
      for (const span of option.sources)
        if (!(span in spanText)) problems.push(`${field.id}/${option.id} cites missing span ${span}`);
    }
    if (field.kind === 'cited' && !field.draft) problems.push(`${field.id} is cited but has no draft`);
    if (field.kind !== 'cited' && !field.options?.length)
      problems.push(`${field.id} asks a question with no options`);
  }
  if (!encounter.episode.docs.some((d) => d.id === encounter.noteDocId))
    problems.push('episode has no note document');
  return problems;
}
