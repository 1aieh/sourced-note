import type { CSSProperties, ReactNode } from 'react';
import type { Turn } from '../../model/types';

const SPACE = /^\s+$/;

/** Splits text into words and the spaces between them, so each word can arrive on its own. */
export function splitWords(text: string): string[] {
  return text.split(/(\s+)/).filter(Boolean);
}

export function wordCount(turn: Turn): number {
  return turn.segments.reduce((n, s) => n + splitWords(s.text).filter((w) => !SPACE.test(w)).length, 0);
}

/**
 * Renders words as `<span data-word>` numbered from `from`, for staggered
 * animation through the `--i` variable. Returns the nodes and the next number.
 */
export function renderWords(text: string, from: number): [ReactNode[], number] {
  let i = from;
  const nodes = splitWords(text).map((w, k) =>
    SPACE.test(w) ? (
      w
    ) : (
      <span key={k} data-word style={{ '--i': i++ } as CSSProperties}>
        {w}
      </span>
    ),
  );
  return [nodes, i];
}
