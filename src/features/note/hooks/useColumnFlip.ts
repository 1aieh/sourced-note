import { useLayoutEffect, useRef } from 'react';

const SHIFT_EASE = 'cubic-bezier(0.77, 0, 0.175, 1)';
const ENTER_EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

/**
 * Layout changes glide instead of reflowing (FLIP). Both columns keep a fixed
 * measure, so the text never rewraps: the grid snaps to its new columns and
 * each column slides from where it was. A transcript column that appears
 * from nothing fades in from the left.
 */
export function useColumnFlip(columns: string, duration: number, reduce: boolean) {
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const prev = useRef<{ columns: string; left?: number | undefined; right?: number | undefined }>({
    columns: '',
  });

  // Runs after every render, on purpose: it compares positions across commits.
  useLayoutEffect(() => {
    const l = left.current?.getBoundingClientRect().left;
    const r = right.current?.getBoundingClientRect().left;
    const was = prev.current;
    if (was.columns && was.columns !== columns && !reduce) {
      const opts: KeyframeAnimationOptions = { duration: duration * 1000, easing: SHIFT_EASE };
      if (was.columns.startsWith('0fr') && left.current) {
        left.current.animate(
          [
            { opacity: 0, transform: 'translateX(-24px)' },
            { opacity: 1, transform: 'none' },
          ],
          {
            ...opts,
            easing: ENTER_EASE,
          },
        );
      } else if (left.current && was.left != null && l != null && Math.abs(was.left - l) > 1) {
        left.current.animate([{ transform: `translateX(${was.left - l}px)` }, { transform: 'none' }], opts);
      }
      if (right.current && was.right != null && r != null && Math.abs(was.right - r) > 1) {
        right.current.animate([{ transform: `translateX(${was.right - r}px)` }, { transform: 'none' }], opts);
      }
    }
    prev.current = { columns, left: l, right: r };
  });

  return { left, right };
}
