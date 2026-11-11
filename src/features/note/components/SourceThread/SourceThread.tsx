import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_OUT } from '@/shared/motion';
import { useNote } from '../../context';
import classes from './SourceThread.module.css';

type Line = { id: string; d: string; x1: number; y1: number };

/**
 * A thin line from each source sentence in the transcript to the field that
 * cites it. Positions are measured from the DOM, so it follows both columns
 * as they scroll and the layout as it resizes.
 */
export function SourceThread({
  container,
  fieldId,
  spans,
  transcript,
  paper,
}: {
  container: RefObject<HTMLElement | null>;
  fieldId: string | null;
  spans: string[];
  transcript: RefObject<HTMLElement | null>;
  paper: RefObject<HTMLElement | null>;
}) {
  const { settings, reduce } = useNote();
  const [lines, setLines] = useState<Line[]>([]);
  const bend = settings.threadBend;

  useEffect(() => {
    const root = container.current;
    const tScroll = transcript.current;
    const pScroll = paper.current;
    if (!root || !tScroll || !pScroll || !fieldId || spans.length === 0) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const box = root.getBoundingClientRect();
      const anchor = root.querySelector(`[data-field="${fieldId}"] [data-thread-anchor]`);
      if (!anchor) return setLines([]);
      const a = anchor.getBoundingClientRect();
      const tb = tScroll.getBoundingClientRect();
      const pb = pScroll.getBoundingClientRect();
      if (a.top < pb.top || a.bottom > pb.bottom) return setLines([]);
      const x2 = a.left - box.left - 6;
      const y2 = a.top + a.height / 2 - box.top;
      const next: Line[] = [];
      for (const id of spans) {
        const r = tScroll.querySelector(`[data-span="${id}"]`)?.getClientRects()[0];
        if (!r || r.top < tb.top + 4 || r.bottom > tb.bottom - 4) continue;
        const x1 = tb.right - box.left - 10;
        const y1 = r.top + r.height / 2 - box.top;
        const dx = (x2 - x1) * bend;
        next.push({ id, x1, y1, d: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}` });
      }
      setLines(next);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    const scrollers = [tScroll, pScroll];
    scrollers.forEach((el) => el.addEventListener('scroll', schedule, { passive: true }));
    window.addEventListener('resize', schedule);
    // Smooth scrolling moves the source after this effect runs; follow it for a moment.
    const until = performance.now() + 700;
    let follow = 0;
    const tick = () => {
      measure();
      if (performance.now() < until) follow = requestAnimationFrame(tick);
    };
    follow = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(follow);
      scrollers.forEach((el) => el.removeEventListener('scroll', schedule));
      window.removeEventListener('resize', schedule);
    };
  }, [container, transcript, paper, fieldId, spans, bend]);

  const shown = fieldId && spans.length ? lines : [];

  return (
    <svg className={classes.thread} aria-hidden>
      <AnimatePresence>
        {shown.map((l) => (
          <motion.g
            key={`${fieldId}-${l.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
          >
            <motion.path
              d={l.d}
              fill="none"
              stroke="var(--sn-accent)"
              strokeWidth={settings.threadWidth}
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: settings.threadDraw, ease: EASE_OUT }}
            />
            <circle cx={l.x1} cy={l.y1} r={2.5} fill="var(--sn-accent)" />
          </motion.g>
        ))}
      </AnimatePresence>
    </svg>
  );
}
