/** Marks an element as a scroll container that `revealIn` may move. */
export const SCROLL_AREA = 'data-scroll-area';

/**
 * Scrolls an element into view inside its own scroll container only.
 * `scrollIntoView` also scrolls every ancestor, including the page the
 * workspace is embedded in, which would yank the host page around.
 */
export function revealIn(
  el: Element | null | undefined,
  block: 'center' | 'nearest',
  behavior: ScrollBehavior = 'auto',
) {
  if (!el) return;
  const scroller = el.closest<HTMLElement>(`[${SCROLL_AREA}]`);
  if (!scroller) return;
  const s = scroller.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  let delta = 0;
  if (block === 'center') delta = r.top + r.height / 2 - (s.top + s.height / 2);
  else if (r.top < s.top) delta = r.top - s.top - 8;
  else if (r.bottom > s.bottom) delta = Math.min(r.bottom - s.bottom + 8, r.top - s.top - 8);
  if (Math.abs(delta) > 1) scroller.scrollTo({ top: scroller.scrollTop + delta, behavior });
}
