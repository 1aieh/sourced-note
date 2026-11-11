import { useLayoutEffect, useRef, useState } from 'react';

const STEP = 4;
const BAR = 2;

/**
 * Level history, newest on the right, scrolling left while recording. Drawn
 * to a canvas so it moves on sub-pixel steps instead of jumping bar to bar.
 * The levels are simulated: no microphone is used.
 */
export function Wave({
  className,
  live,
  speaking,
  reduce,
  filled,
}: {
  className?: string | undefined;
  live: boolean;
  speaking: boolean;
  reduce: boolean;
  /** Opened after the visit: start from a recorded history, not a flat line. */
  filled: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef({ live, speaking, reduce });
  const [prefill] = useState(filled);

  useLayoutEffect(() => {
    state.current = { live, speaking, reduce };
  });

  useLayoutEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const hist: number[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let color = '#888';
    let frames = 0;
    let offset = 0;
    let level = 0;
    let last = performance.now();
    let raf = 0;
    let seed = 0;

    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      const n = Math.ceil(w / STEP) + 2;
      while (hist.length < n) {
        const k = hist.length;
        hist.unshift(prefill ? 0.12 + 0.6 * Math.abs(Math.sin(k * 0.61) * Math.sin(k * 0.23 + 1)) : 0.05);
      }
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);

    const sample = (t: number) => {
      const target = state.current.live ? (state.current.speaking ? 0.82 : 0.16) : 0.05;
      level += (target - level) * 0.22;
      seed += 1;
      const n =
        0.45 +
        0.55 * Math.abs(Math.sin(t * 8.3 + seed * 0.7) * Math.sin(t * 2.9 + seed * 0.31)) +
        0.18 * Math.sin(seed * 12.9898);
      return Math.max(0.05, Math.min(1, level * n));
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      const n = hist.length;
      for (let i = 0; i < n; i++) {
        const x = w - (n - 1 - i) * STEP - offset;
        if (x < -BAR) continue;
        const bh = Math.max(2, (hist[i] ?? 0) * h);
        ctx.globalAlpha = Math.min(1, 0.25 + (x / w) * 1.1);
        ctx.beginPath();
        ctx.roundRect(x, (h - bh) / 2, BAR, bh, 1);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const push = (now: number) => {
      hist.push(sample(now / 1000));
      hist.shift();
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (frames++ % 30 === 0) color = getComputedStyle(c).color;
      const { live: l, reduce: r } = state.current;
      if (l && !r) {
        offset += dt * 34;
        while (offset >= STEP) {
          offset -= STEP;
          push(now);
        }
      } else if (l && r && frames % 12 === 0) {
        push(now);
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [prefill]);

  return <canvas ref={canvas} className={className} aria-hidden />;
}
