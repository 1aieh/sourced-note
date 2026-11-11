import type { FieldStatus, Phase } from './types';

export type StatusTone = 'live' | 'idle' | 'needs' | 'ready' | 'done';

export type RecorderState = { started: boolean; paused: boolean };

/** The words on the status pill, for where the visit stands. */
export function statusLabel(phase: Phase, open: number, signed: boolean, rec: RecorderState): string {
  if (phase === 'recording') return !rec.started ? 'Not started' : rec.paused ? 'Paused' : 'Recording';
  if (phase === 'transcribed') return 'Transcribed';
  if (phase === 'drafting') return 'Writing';
  if (phase === 'review') return open ? `${open} to answer` : 'Ready to sign';
  return signed ? 'Signed' : 'Signing';
}

export function statusTone(phase: Phase, open: number, signed: boolean, rec: RecorderState): StatusTone {
  if (phase === 'recording') return rec.paused ? 'idle' : 'live';
  if (phase === 'review') return open ? 'needs' : 'ready';
  if (signed || phase === 'filed' || phase === 'note') return 'done';
  return 'idle';
}

export type SegmentTone = 'ready' | 'needs' | 'empty';

/** The colour of a field's segment on the status pill. */
export const segmentTone = (s: FieldStatus): SegmentTone =>
  s === 'needs' ? 'needs' : s === 'empty' ? 'empty' : 'ready';
