import { useState } from 'react';
import { DialRoot, useDialKit } from 'dialkit';
import 'dialkit/styles.css';
import type { NoteSettings, StartAt } from '@/features/note';
import { NoteWorkspace, defaultSettings, demoEncounter } from '@/features/note';
import classes from './Playground.module.css';

const FRAMES: Record<string, { w: number; h: number } | null> = {
  fill: null,
  'phone 390': { w: 390, h: 844 },
  'tablet 820': { w: 820, h: 1180 },
  'laptop 1280': { w: 1280, h: 800 },
};

const d = defaultSettings;

/** `#play`: every timing and look in a DialKit panel, device frames, and jumps to each step. */
export default function Playground() {
  // Each jump remounts the workspace at that step.
  const [run, setRun] = useState<{ n: number; at: StartAt }>({ n: 0, at: 'recording' });
  const jump = (at: StartAt) => setRun((r) => ({ n: r.n + 1, at }));

  const v = useDialKit(
    'Sourced note',
    {
      flow: {
        replay: { type: 'action' },
        skipToReview: { type: 'action', label: 'Skip to questions' },
        resolveAll: { type: 'action', label: 'Answer all' },
        filed: { type: 'action', label: 'Go to episode' },
        autoStart: d.autoStart,
      },
      frame: { type: 'select', options: Object.keys(FRAMES), default: 'fill' },
      timing: {
        turnPace: [d.turnPace, 0, 1, 0.02],
        wordPace: [d.wordPace, 0, 0.08, 0.002],
        rampAfter: [d.rampAfter, 0, 11, 1],
        rampDecay: [d.rampDecay, 0.2, 1, 0.05],
        layoutShift: [d.layoutShift, 0.2, 1.2, 0.02],
        stagger: [d.stagger, 0.12, 1.2, 0.02],
        reveal: [d.reveal, 0.08, 0.8, 0.02],
        revealBlur: [d.revealBlur, 0, 12, 0.5],
        holdToSign: [d.holdToSign, 0.4, 2.5, 0.05],
        signatureDraw: [d.signatureDraw, 0.3, 2, 0.05],
      },
      sources: {
        showThread: d.showThread,
        threadDraw: [d.threadDraw, 0, 1, 0.02],
        threadBend: [d.threadBend, 0, 1, 0.05],
        threadWidth: [d.threadWidth, 0.5, 3, 0.25],
        highlight: [d.highlight, 0.04, 0.4, 0.01],
      },
      colour: {
        accentLight: d.accentLight,
        accentDark: d.accentDark,
        paperLight: d.paperLight,
        paperDark: d.paperDark,
      },
      layout: {
        transcriptShare: [d.transcriptShare, 0.3, 0.55, 0.01],
        fontSize: [d.fontSize, 13, 18, 0.5],
        radius: [d.radius, 0, 20, 1],
      },
    },
    {
      persist: true,
      onAction: (path) => {
        if (path.endsWith('replay')) jump('recording');
        if (path.endsWith('skipToReview')) jump('review');
        if (path.endsWith('resolveAll')) jump('ready');
        if (path.endsWith('filed')) jump('filed');
      },
    },
  );

  const settings: NoteSettings = {
    ...d,
    ...v.timing,
    ...v.sources,
    ...v.colour,
    ...v.layout,
    autoStart: v.flow.autoStart,
  };
  const frame = FRAMES[v.frame as string];
  const workspace = (
    <NoteWorkspace key={run.n} encounter={demoEncounter} settings={settings} startAt={run.at} />
  );

  return (
    <div className={classes.playground} data-framed={frame ? true : undefined}>
      {frame ? (
        <div className={classes.stage}>
          <div className={classes.frame} style={{ width: frame.w, height: frame.h }}>
            {workspace}
          </div>
          <span className={classes.caption}>
            {v.frame as string} × {frame.h}
          </span>
        </div>
      ) : (
        <div className={classes.fill}>{workspace}</div>
      )}
      <DialRoot position="top-right" defaultOpen productionEnabled />
    </div>
  );
}
