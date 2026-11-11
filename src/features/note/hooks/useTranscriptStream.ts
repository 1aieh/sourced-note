import { useCallback, useEffect, useEffectEvent, useMemo, useState } from 'react';
import { toSeconds } from '../model/encounter';
import type { Encounter } from '../model/types';
import type { NoteSettings } from '../settings';
import { wordCount } from '../components/Transcript/words';

export type StreamStart = 'idle' | 'complete';

/**
 * Plays the scripted visit back as if it were being transcribed live: turn
 * by turn, word by word, with a pace that eases faster after the first few
 * turns so the whole visit streams in a few seconds.
 *
 * This is the seam for a real transcription service: swap this hook for one
 * that appends turns as they arrive and the rest of the workspace is unchanged.
 */
export function useTranscriptStream({
  encounter,
  settings,
  reduce,
  recording,
  start,
  onComplete,
}: {
  encounter: Encounter;
  settings: NoteSettings;
  reduce: boolean;
  /** The note is in its recording phase. */
  recording: boolean;
  start: StreamStart;
  onComplete: () => void;
}) {
  const { transcript, addendum } = encounter;
  const complete = start === 'complete';
  const [started, setStarted] = useState(complete || settings.autoStart);
  const [paused, setPaused] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [rush, setRush] = useState(complete);
  // The last turn whose speaker has finished; the level drops until the next turn.
  const [quietAt, setQuietAt] = useState(-1);
  const [visible, setVisible] = useState(complete ? transcript.length : 0);

  const turns = useMemo(
    () => (resumed && addendum ? [...transcript, addendum] : transcript),
    [resumed, transcript, addendum],
  );

  const { rampAfter, rampDecay, wordPace, turnPace } = settings;
  const pace = (i: number) =>
    i < rampAfter || i >= transcript.length ? 1 : Math.max(0.08, rampDecay ** (i - rampAfter + 1));
  const k = pace(Math.max(0, visible - 1));
  /** Seconds between words for the turn arriving now. */
  const wordGap = rush || reduce ? 0 : wordPace * k;
  const lastTurn = visible ? turns[visible - 1] : undefined;
  const speakFor = lastTurn ? wordCount(lastTurn) * wordGap + 0.3 * Math.max(0.35, k) : 0;
  /** Seconds until the next turn arrives. */
  const nextIn =
    visible === 0
      ? 0.45
      : rush
        ? 0.04
        : visible === transcript.length && resumed
          ? 0.9
          : speakFor + turnPace * k;
  const live = recording && started && !paused;
  const completed = useEffectEvent(onComplete);

  useEffect(() => {
    if (!live) return;
    const timers: number[] = [];
    if (lastTurn && !rush) timers.push(window.setTimeout(() => setQuietAt(visible), speakFor * 1000));
    if (visible >= turns.length) {
      timers.push(window.setTimeout(() => completed(), (rush ? 0.5 : speakFor + 0.3) * 1000));
    } else {
      timers.push(window.setTimeout(() => setVisible((v) => v + 1), nextIn * 1000));
    }
    return () => timers.forEach(clearTimeout);
  }, [live, visible, turns, rush, speakFor, nextIn, lastTurn]);

  const speaking = live && !rush && Boolean(lastTurn) && quietAt !== visible;

  const visitEnd = resumed && addendum ? toSeconds(addendum.time) + 5 : encounter.visit.length;
  const nextTurn = turns[visible];
  const clockTo = nextTurn ? toSeconds(nextTurn.time) : visitEnd;

  const begin = useCallback(() => setStarted(true), []);
  const pause = useCallback(() => setPaused(true), []);
  const unpause = useCallback(() => setPaused(false), []);
  /** Record more after the visit was transcribed. */
  const resumeAfterDone = useCallback(() => {
    setPaused(false);
    setResumed(true);
    setRush(false);
  }, []);
  /** Stop: everything said so far arrives at once. */
  const finish = useCallback(() => {
    setPaused(false);
    setRush(true);
    setVisible(turns.length);
  }, [turns.length]);

  return {
    turns,
    visible,
    started,
    paused,
    speaking,
    /** Whether the visit can still be resumed after it was transcribed. */
    canResume: Boolean(addendum) && !resumed,
    wordGap,
    nextIn,
    clockTo,
    begin,
    pause,
    unpause,
    resumeAfterDone,
    finish,
  };
}
