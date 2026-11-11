/**
 * Every timing and look the workspace exposes. Visitors get the defaults;
 * the playground (`#play`) tunes them live.
 */
export type NoteSettings = {
  /** Seconds of pause between transcript turns while recording. */
  turnPace: number;
  /** Seconds between words as a turn is transcribed. */
  wordPace: number;
  /** Turns that arrive at full pace before the transcript speeds up. */
  rampAfter: number;
  /** How much faster each later turn gets, 0 to 1. Lower is a steeper ramp. */
  rampDecay: number;
  /** Seconds between fields while drafting. */
  stagger: number;
  /** Seconds for a drafted value to settle in. */
  reveal: number;
  /** Blur in px a drafted value starts from. */
  revealBlur: number;
  /** Seconds the transcript takes to slide aside for the paper. */
  layoutShift: number;
  /** Seconds to press and hold to sign. */
  holdToSign: number;
  /** Seconds the signature takes to draw. */
  signatureDraw: number;
  /** Seconds the source threads take to draw. */
  threadDraw: number;
  showThread: boolean;
  threadBend: number;
  threadWidth: number;
  /** 0 to 1, strength of the source highlight in the transcript. */
  highlight: number;
  accentLight: string;
  accentDark: string;
  paperLight: string;
  paperDark: string;
  /** Share of the width the transcript takes on wide screens. */
  transcriptShare: number;
  fontSize: number;
  radius: number;
  /** Start recording by itself when the workspace mounts. */
  autoStart: boolean;
};

export const defaultSettings: NoteSettings = {
  turnPace: 0.18,
  wordPace: 0.02,
  rampAfter: 3,
  rampDecay: 0.5,
  stagger: 0.4,
  reveal: 0.32,
  revealBlur: 4,
  layoutShift: 0.62,
  holdToSign: 1.1,
  signatureDraw: 0.9,
  threadDraw: 0.28,
  showThread: true,
  threadBend: 0.5,
  threadWidth: 1.25,
  highlight: 0.16,
  accentLight: '#3450D1',
  accentDark: '#8A9DFF',
  paperLight: '#FFFFFF',
  paperDark: '#191C21',
  transcriptShare: 0.4,
  fontSize: 15,
  radius: 10,
  autoStart: true,
};

/** Widths below this get the one-column phone layout. */
export const COMPACT_BELOW = 820;
