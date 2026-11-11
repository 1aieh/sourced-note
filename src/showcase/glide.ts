const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** A slow, gentle page scroll to an element, eased in and out. Jumps with reduced motion. */
export function glideTo(id: string, reduce: boolean) {
  const el = document.getElementById(id);
  if (!el) return;
  const to = el.getBoundingClientRect().top + window.scrollY - 24;
  if (reduce) {
    window.scrollTo(0, to);
    return;
  }
  const from = window.scrollY;
  const d = to - from;
  const duration = Math.min(1600, 700 + Math.abs(d) * 0.25);
  const t0 = performance.now();
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, from + d * easeInOutCubic(t));
    if (t < 1) requestAnimationFrame(step);
    else html.style.scrollBehavior = prev;
  };
  requestAnimationFrame(step);
}
