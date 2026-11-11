import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { SCROLL_AREA, revealIn } from '@/shared/scroll';
import type { Turn } from '../../model/types';
import { renderWords, splitWords } from './words';

const wordsIn = (text: string) => splitWords(text).filter((w) => !/^\s+$/.test(w)).length;
import classes from './Transcript.module.css';

type SpanHandlers = {
  onSpanEnter?: (id: string) => void;
  onSpanLeave?: () => void;
  onSpanClick?: (id: string) => void;
};

type Props = SpanHandlers & {
  turns: Turn[];
  /** Spans highlighted as the source of the field in focus. */
  activeSpans: string[];
  /** Spans that some field cites. Only these respond to the pointer. */
  usedSpans: Set<string>;
  /** Scroll this span into view once mounted. */
  scrollTo?: string;
  /** Glide to the newest words while they stream in. */
  follow?: boolean;
  paused?: boolean;
  /** Seconds between words for turns that arrive from now on. 0 shows a turn at once. */
  wordPace?: number;
  /** Speaker and time above the words instead of beside them. */
  stacked?: boolean;
  /** Leave room after the last turn so any line can scroll level with its field. */
  tailRoom?: boolean;
};

/** The visit transcript. Cited spans are marks that light up with their field. */
export function TranscriptBody({
  turns,
  activeSpans,
  usedSpans,
  scrollTo,
  follow = false,
  paused = false,
  wordPace = 0,
  stacked = false,
  tailRoom = false,
  ...handlers
}: Props) {
  const ref = useRef<HTMLOListElement>(null);
  // Turns already here on mount appear at once. Only new ones stream in.
  const [seen] = useState(() => turns.length);

  useEffect(() => {
    if (!scrollTo) return;
    const id = window.setTimeout(
      () => revealIn(ref.current?.querySelector(`[data-span="${scrollTo}"]`), 'center'),
      60,
    );
    return () => clearTimeout(id);
  }, [scrollTo]);

  useFollowEnd(ref, follow);

  return (
    <ol
      ref={ref}
      className={classes.turns}
      data-paused={paused || undefined}
      data-stacked={stacked || undefined}
      data-tail-room={tailRoom || undefined}
    >
      {turns.map((turn, i) => (
        <TurnItem
          key={turn.id}
          turn={turn}
          animate={i >= seen}
          wordPace={wordPace}
          activeSpans={activeSpans}
          usedSpans={usedSpans}
          {...handlers}
        />
      ))}
    </ol>
  );
}

/**
 * Follows the end of the transcript with an eased glide, so new lines never
 * jump the page. Scrolling up by hand lets go until you come back down.
 */
function useFollowEnd(ref: React.RefObject<HTMLElement | null>, follow: boolean) {
  useEffect(() => {
    if (!follow) return;
    const scroller = ref.current?.closest<HTMLElement>(`[${SCROLL_AREA}]`);
    if (!scroller) return;
    let held = false;
    let raf = 0;
    const release = (e: WheelEvent | TouchEvent) => {
      if ('deltaY' in e && e.deltaY > 0) return;
      held = true;
    };
    const onScroll = () => {
      if (held && scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop < 24) held = false;
    };
    scroller.addEventListener('wheel', release, { passive: true });
    scroller.addEventListener('touchmove', release, { passive: true });
    scroller.addEventListener('scroll', onScroll, { passive: true });
    const loop = () => {
      if (!held) {
        const d = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop;
        if (d > 0.5) scroller.scrollTop += Math.max(0.5, d * 0.12);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      scroller.removeEventListener('wheel', release);
      scroller.removeEventListener('touchmove', release);
      scroller.removeEventListener('scroll', onScroll);
    };
  }, [ref, follow]);
}

function TurnItem({
  turn,
  animate,
  wordPace,
  activeSpans,
  usedSpans,
  onSpanEnter,
  onSpanLeave,
  onSpanClick,
}: SpanHandlers & {
  turn: Turn;
  animate: boolean;
  wordPace: number;
  activeSpans: string[];
  usedSpans: Set<string>;
}) {
  // The pace is fixed when the turn arrives, so finishing early only speeds up what's left.
  const [pace] = useState(wordPace);
  // Word numbers run on across segments, so the stagger flows through the whole turn.
  const starts = turn.segments.reduce<number[]>((acc, _seg, j) => {
    acc.push(j === 0 ? 0 : acc[j - 1]! + wordsIn(turn.segments[j - 1]!.text));
    return acc;
  }, []);
  const content = turn.segments.map((seg, j) => {
    const nodes: ReactNode = animate ? renderWords(seg.text, starts[j] ?? 0)[0] : seg.text;
    const span = seg.span;
    if (!span) return <span key={j}>{nodes}</span>;
    const used = usedSpans.has(span);
    return (
      <mark
        key={j}
        className={classes.mark}
        data-span={span}
        data-used={used || undefined}
        data-active={activeSpans.includes(span) || undefined}
        onMouseEnter={onSpanEnter && used ? () => onSpanEnter(span) : undefined}
        onMouseLeave={onSpanLeave}
        onClick={onSpanClick && used ? () => onSpanClick(span) : undefined}
      >
        {nodes}
      </mark>
    );
  });

  return (
    <li
      className={classes.turn}
      data-speaker={turn.speaker}
      data-animate={animate || undefined}
      style={{ '--wp': `${pace}s` } as CSSProperties}
    >
      <div className={classes.meta}>
        <span>{turn.speaker}</span>
        <span className={classes.time}>{turn.time}</span>
      </div>
      <p className={classes.text}>{content}</p>
    </li>
  );
}

/** One line of transcript with its cited part lit, for specimens and previews. */
export function SourceQuote({ before, quote }: { before?: string; quote: string }) {
  return (
    <p className={classes.text}>
      {before && <span>{before}</span>}
      <mark className={classes.mark} data-used data-active>
        {quote}
      </mark>
    </p>
  );
}
