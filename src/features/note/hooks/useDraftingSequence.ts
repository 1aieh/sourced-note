import { useEffect, useEffectEvent, useState } from 'react';
import type { Field } from '../model/types';

/**
 * Drafts the note one field at a time: it points at the field's source
 * first, then lets the words resolve, then moves on. Returns the field being
 * drafted right now.
 *
 * With a real drafting service this would reveal fields as the response
 * streams in; the pacing here stands in for that latency.
 */
export function useDraftingSequence({
  active,
  fields,
  stagger,
  leadIn,
  reduce,
  onReveal,
  onDone,
}: {
  active: boolean;
  fields: Field[];
  /** Seconds between fields. */
  stagger: number;
  /** Seconds before the first field, while the layout makes room for the paper. */
  leadIn: number;
  reduce: boolean;
  onReveal: (id: string) => void;
  onDone: () => void;
}): string | null {
  const [current, setCurrent] = useState<string | null>(null);
  const reveal = useEffectEvent(onReveal);
  const done = useEffectEvent(onDone);

  useEffect(() => {
    if (!active) return;
    const step = Math.max(0.12, stagger) * 1000;
    const lead = leadIn * 1000;
    const timers: number[] = [];
    fields.forEach((f, i) => {
      const at = lead + i * step;
      timers.push(window.setTimeout(() => setCurrent(f.id), at));
      timers.push(window.setTimeout(() => reveal(f.id), at + (reduce ? 0 : step * 0.4)));
    });
    timers.push(
      window.setTimeout(
        () => {
          setCurrent(null);
          done();
        },
        lead + fields.length * step + 280,
      ),
    );
    return () => {
      timers.forEach(clearTimeout);
      setCurrent(null);
    };
  }, [active, fields, stagger, leadIn, reduce]);

  return current;
}
