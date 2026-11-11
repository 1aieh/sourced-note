import type { CSSProperties } from 'react';

/** Cover body copy options, tried at `#tune`. The first is what visitors see. */
export const COVER_COPY: { value: string; label: string; text: string }[] = [
  {
    value: 'source',
    label: 'Shows its source',
    text: 'Record a visit. The note writes itself, and each line shows its source. Answer what it cannot know, then sign.',
  },
  {
    value: 'steps',
    label: 'Four steps',
    text: 'Record the visit. Check each line against what was said. Answer what the draft cannot know. Sign.',
  },
  {
    value: 'asks',
    label: 'Asks, never guesses',
    text: 'Record a visit and get a note that cites the transcript for every line, and asks before it guesses.',
  },
  {
    value: 'trust',
    label: 'Trust and speed',
    text: 'A clinical note drafted from the visit, sourced line by line, so you can check it fast and sign with confidence.',
  },
  {
    value: 'yours',
    label: 'Your decision',
    text: 'The note drafts itself from the visit and shows where each line came from. The clinical decisions stay yours.',
  },
];

/** Cover spacing in px. `links` is the gap from the links to the cover's bottom edge. */
export const COVER_SPACE = { pill: 16, title: 20, cta: 28, links: 60, titleSize: 80, subWidth: 30 };
export type CoverSpace = typeof COVER_SPACE;

export function coverVars(sp: CoverSpace): CSSProperties {
  return {
    '--cv-pill': `${sp.pill}px`,
    '--cv-title': `${sp.title}px`,
    '--cv-cta': `${sp.cta}px`,
    '--cv-links': `${sp.links}px`,
    '--cv-h1': `${sp.titleSize}px`,
    '--cv-sub': `${sp.subWidth}em`,
  } as CSSProperties;
}

export const LOOKS = ['glass', 'mist', 'flow', 'off'] as const;
export type Look = (typeof LOOKS)[number];

export type CoverBgSettings = {
  look: Look;
  /** Canvas opacity. */
  strength: number;
  /** Multiplier on each look's own pace. */
  speed: number;
  /** Paper wash over the centre, 0 to 1. */
  veil: number;
  /** A soft colour that follows the pointer. */
  cursor: boolean;
  /** Light-mode base colour. */
  light: string;
  /** Light-mode second colour. */
  tone: string;
  /** Light-mode cursor glow. */
  glow: string;
  brightness: number;
  saturation: number;
};

export const COVER_BG: CoverBgSettings = {
  look: 'glass',
  strength: 0.75,
  speed: 1,
  veil: 0.4,
  cursor: true,
  light: '#eef0ff',
  tone: '#c9c3ff',
  glow: '#7f6bff',
  brightness: 1.04,
  saturation: 1.55,
};

export type CoverTune = { copy: string; style: CSSProperties };
