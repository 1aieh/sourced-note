import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { ActionIcon } from '@mantine/core';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_OUT } from '@/shared/motion';
import { ActionButton } from '../ActionButton/ActionButton';
import { IconCheck, IconMic, IconPause } from '../icons';
import { Wave } from './Wave';
import classes from './Recorder.module.css';

export type RecorderMode = 'idle' | 'live' | 'paused' | 'done' | 'summary';

const LABEL: Record<RecorderMode, string> = {
  idle: 'Ready to record',
  live: 'Recording',
  paused: 'Paused',
  done: 'Transcribed',
  summary: 'Visit recording',
};

export type RecorderProps = {
  mode: RecorderMode;
  /** Someone is talking right now: the level rises. */
  speaking: boolean;
  /** Visit time, in seconds, the clock should reach by the end of the current turn. */
  clockTo: number;
  /** Seconds the clock takes to get there. */
  clockDuration: number;
  turns: number;
  reduce: boolean;
  /** Put the controls on their own full-width row. */
  stacked: boolean;
  /** Whether there is more of the visit to record after it was transcribed. */
  canResume: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onDraft: () => void;
};

/**
 * The recorder, docked under the transcript like a voice memo: state and
 * clock on the left, the level history in the middle, controls on the right.
 * Once the visit is transcribed, the same place offers the next step.
 */
export function Recorder({
  mode,
  speaking,
  clockTo,
  clockDuration,
  turns,
  reduce,
  stacked,
  canResume,
  onStart,
  onPause,
  onResume,
  onFinish,
  onDraft,
}: RecorderProps) {
  const finished = mode === 'done' || mode === 'summary';
  const clock = useClock(mode === 'live', clockTo, clockDuration, finished);

  let actions: ReactNode = null;
  if (mode === 'idle') {
    actions = (
      <ActionButton
        tone="record"
        onClick={onStart}
        leftSection={<span className={classes.recDot} aria-hidden />}
      >
        Start recording
      </ActionButton>
    );
  } else if (mode === 'live' || mode === 'paused') {
    const live = mode === 'live';
    actions = (
      <>
        <ActionIcon
          className={classes.round}
          variant="default"
          onClick={live ? onPause : onResume}
          aria-label={live ? 'Pause recording' : 'Resume recording'}
        >
          <IconSwap k={live ? 'pause' : 'mic'} reduce={reduce}>
            {live ? <IconPause /> : <IconMic />}
          </IconSwap>
        </ActionIcon>
        <ActionButton tone="secondary" onClick={onFinish}>
          Stop
        </ActionButton>
      </>
    );
  } else if (mode === 'done') {
    actions = (
      <>
        {canResume && (
          <ActionButton tone="quiet" onClick={onResume} leftSection={<IconMic />}>
            Resume
          </ActionButton>
        )}
        <ActionButton tone="primary" onClick={onDraft}>
          Create note
        </ActionButton>
      </>
    );
  }

  return (
    <div className={classes.dock} data-mode={mode} data-stacked={stacked || undefined}>
      <div className={classes.status} aria-live="polite">
        <span className={classes.dot} aria-hidden>
          <AnimatePresence mode="popLayout" initial={false}>
            {finished ? (
              <motion.span
                key="check"
                className={classes.check}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
              >
                <IconCheck />
              </motion.span>
            ) : (
              <motion.span
                key="led"
                className={classes.led}
                exit={{ opacity: 0, scale: 0.25, transition: { duration: 0.15 } }}
              />
            )}
          </AnimatePresence>
        </span>
        <span className={classes.text}>
          <span className={classes.label}>{LABEL[mode]}</span>
          <span className={classes.sub}>
            <span ref={clock} />
            {finished && <span> · {turns} turns</span>}
          </span>
        </span>
      </div>
      <Wave
        className={classes.wave}
        live={mode === 'live'}
        speaking={speaking}
        reduce={reduce}
        filled={finished}
      />
      {mode !== 'summary' && (
        <div className={classes.actions}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={mode === 'paused' ? 'live' : mode}
              className={classes.actionsRow}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: -4, filter: 'blur(4px)', transition: { duration: 0.14 } }
              }
              transition={{ duration: 0.26, ease: EASE_OUT }}
            >
              {actions}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function IconSwap({ k, reduce, children }: { k: string; reduce: boolean; children: ReactNode }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={k}
        className={classes.swap}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
        transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/**
 * A clock that counts up towards `to` over `duration` seconds. It writes
 * straight to the DOM, so ticking never re-renders the recorder.
 */
function useClock(live: boolean, to: number, duration: number, done: boolean) {
  const el = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);
  useEffect(() => {
    const write = () => {
      if (el.current) el.current.textContent = mmss(Math.floor(shown.current));
    };
    if (done) {
      shown.current = Math.max(shown.current, to);
      write();
      return;
    }
    if (!live) {
      write();
      return;
    }
    const from = shown.current;
    const t0 = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const k = Math.min(1, (now - t0) / Math.max(1, duration * 1000));
      shown.current = Math.max(shown.current, from + (to - from) * k);
      write();
      if (k < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [live, to, duration, done]);
  return el;
}

/** The round control's look without behaviour, for the design system sheet. */
export function RoundIconPreview({ children }: { children: ReactNode }) {
  return (
    <span className={classes.round} data-static>
      {children}
    </span>
  );
}
