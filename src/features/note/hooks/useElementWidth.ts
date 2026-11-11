import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

/** The element's content width, kept current with a ResizeObserver. */
export function useElementWidth(ref: RefObject<HTMLElement | null>, initial = 1200): number {
  const [width, setWidth] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}
