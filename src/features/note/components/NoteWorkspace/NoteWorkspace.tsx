import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Avatar, Badge, Switch, Tooltip, UnstyledButton, useComputedColorScheme } from '@mantine/core';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_OUT } from '@/shared/motion';
import { SCROLL_AREA, revealIn } from '@/shared/scroll';
import { NoteProvider } from '../../NoteProvider';
import { useNote } from '../../context';
import { useColumnFlip } from '../../hooks/useColumnFlip';
import { useDraftingSequence } from '../../hooks/useDraftingSequence';
import { useElementWidth } from '../../hooks/useElementWidth';
import { useTranscriptStream } from '../../hooks/useTranscriptStream';
import { fieldForSpan, formatClock } from '../../model/encounter';
import type { NoteAction, NoteState } from '../../model/noteReducer';
import { createNoteReducer, initialNoteState, openQuestions } from '../../model/noteReducer';
import { statusLabel, statusTone } from '../../model/status';
import type { Encounter, Field } from '../../model/types';
import type { NoteSettings } from '../../settings';
import { COMPACT_BELOW, defaultSettings } from '../../settings';
import { Episode } from '../Episode/Episode';
import { IconBack, IconTranscript } from '../icons';
import { Paper } from '../Paper/Paper';
import type { RecorderMode } from '../Recorder/Recorder';
import { Recorder } from '../Recorder/Recorder';
import { Sheet } from '../Sheet/Sheet';
import { SourceThread } from '../SourceThread/SourceThread';
import { StatusPill } from '../StatusPill/StatusPill';
import { TranscriptBody } from '../Transcript/TranscriptBody';
import classes from './NoteWorkspace.module.css';

/** Where a fresh workspace begins. The playground uses the later ones to jump ahead. */
export type StartAt = 'recording' | 'review' | 'ready' | 'filed';

export type NoteWorkspaceProps = {
  encounter: Encounter;
  settings?: NoteSettings;
  startAt?: StartAt;
  /** Called with the time the note was signed, `HH:mm`. Nothing is sent anywhere by the workspace itself. */
  onSigned?: (signedAt: string) => void;
};

/**
 * The whole product surface: record a visit, draft the note from it, settle
 * what the draft could not decide, sign, and see the note filed into the
 * patient's episode. Fills its container; give it a height.
 */
export function NoteWorkspace({
  encounter,
  settings = defaultSettings,
  startAt = 'recording',
  onSigned,
}: NoteWorkspaceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(rootRef);
  const compact = width < COMPACT_BELOW;
  const scheme = useComputedColorScheme('light');
  // "Start again" remounts the inner workspace, which resets every piece of state at once.
  const [run, setRun] = useState(0);

  const share = settings.transcriptShare;
  const style = {
    '--tw': `${Math.round(Math.min(640, width * share))}px`,
    '--pw': `${Math.round(Math.min(740, width * (1 - share) - 40))}px`,
    '--sn-accent': scheme === 'dark' ? settings.accentDark : settings.accentLight,
    '--sn-paper': scheme === 'dark' ? settings.paperDark : settings.paperLight,
    '--hl': String(settings.highlight),
    '--fs': `${settings.fontSize}px`,
    '--r': `${settings.radius}px`,
  } as CSSProperties;

  return (
    <div ref={rootRef} className={classes.root} data-note-compact={compact || undefined} style={style}>
      <NoteProvider encounter={encounter} settings={settings} compact={compact}>
        <Workspace
          key={run}
          startAt={run ? 'recording' : startAt}
          onSigned={onSigned}
          onRestart={() => setRun((n) => n + 1)}
        />
      </NoteProvider>
    </div>
  );
}

const ANSWER_ALL = (fields: Field[]): NoteAction[] =>
  fields
    .filter((f) => f.kind !== 'cited')
    .map((f) => {
      const o = f.options?.find((x) => !x.freeText) ?? f.options?.[0];
      return { type: 'choose', id: f.id, choice: o?.id ?? '', value: o?.value ?? o?.label ?? '' };
    });

function startState(fields: Field[], startAt: StartAt): NoteState {
  const reduce = createNoteReducer(fields);
  const steps: NoteAction[] = [];
  if (startAt !== 'recording') steps.push({ type: 'transcribed' }, { type: 'draft' }, { type: 'review' });
  if (startAt === 'ready' || startAt === 'filed') steps.push(...ANSWER_ALL(fields));
  if (startAt === 'filed') steps.push({ type: 'sign', at: formatClock(new Date()) }, { type: 'file' });
  return steps.reduce(reduce, initialNoteState(fields));
}

function Workspace({
  startAt,
  onSigned,
  onRestart,
}: {
  startAt: StartAt;
  onSigned?: ((signedAt: string) => void) | undefined;
  onRestart: () => void;
}) {
  const { encounter, index, settings: t, reduce, compact } = useNote();
  const { fields } = encounter;
  const reducer = useMemo(() => createNoteReducer(fields), [fields]);
  const [s, dispatch] = useReducer(reducer, undefined, () => startState(fields, startAt));
  const workRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  const [hoverField, setHoverField] = useState<string | null>(null);
  const [hoverSpan, setHoverSpan] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{ open: boolean; focus?: string[] }>({ open: false });
  // Evidence (the transcript beside a reopened note) only applies while the note is open.
  const [evidenceToggle, setEvidence] = useState(false);
  const [pulse, setPulse] = useState(0);

  const { phase, current } = s;
  const evidence = phase === 'note' && evidenceToggle;
  const recordingPhase = phase === 'recording' || phase === 'transcribed';
  const paperPhase = phase === 'drafting' || phase === 'review' || phase === 'signing' || phase === 'note';
  const split =
    !compact &&
    (phase === 'drafting' || phase === 'review' || phase === 'signing' || (phase === 'note' && evidence));
  const showTranscript = compact ? recordingPhase : recordingPhase || split || phase === 'note';
  const open = openQuestions(fields, s.fields).length;
  const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth';

  /* ------------------------------------------------------------ recording */
  const onTranscribed = useCallback(() => dispatch({ type: 'transcribed' }), []);
  const stream = useTranscriptStream({
    encounter,
    settings: t,
    reduce,
    recording: phase === 'recording',
    start: startAt === 'recording' ? 'idle' : 'complete',
    onComplete: onTranscribed,
  });
  const recorderMode: RecorderMode =
    phase === 'transcribed'
      ? 'done'
      : phase === 'recording'
        ? !stream.started
          ? 'idle'
          : stream.paused
            ? 'paused'
            : 'live'
        : 'summary';

  /* ------------------------------------------------------------ drafting */
  const drafting = useDraftingSequence({
    active: phase === 'drafting',
    fields,
    stagger: t.stagger,
    leadIn: t.layoutShift + 0.45,
    reduce,
    onReveal: (id) => dispatch({ type: 'reveal', id }),
    onDone: () => dispatch({ type: 'review' }),
  });

  /* ------------------------------------------------------------ which source is lit */
  const linking = phase === 'drafting' || phase === 'review' || (phase === 'note' && (evidence || compact));
  const activeField = linking
    ? (drafting ?? hoverField ?? (hoverSpan ? fieldForSpan(fields, hoverSpan) : null))
    : null;
  const activeSpans = useMemo(
    () => (activeField ? (index.fieldById[activeField]?.sources ?? []) : []),
    [activeField, index],
  );
  const usedSpans = useMemo(() => {
    const used = new Set<string>();
    for (const f of fields)
      if (s.fields[f.id]?.status !== 'empty' && f.kind !== 'gap') f.sources.forEach((x) => used.add(x));
    return used;
  }, [fields, s.fields]);

  /* ------------------------------------------------------------ keep things in view */
  const fieldEl = (id: string) => paperRef.current?.querySelector<HTMLElement>(`[data-field="${id}"]`);

  /** Scrolls the transcript so a field's source sits level with the field. */
  const alignSource = useCallback(
    (fieldId: string, b: ScrollBehavior) => {
      const scroller = transcriptRef.current;
      const src = index.fieldById[fieldId]?.sources[0];
      const span = src ? scroller?.querySelector(`[data-span="${src}"]`) : null;
      const anchor = paperRef.current?.querySelector(`[data-field="${fieldId}"] [data-thread-anchor]`);
      if (!scroller || !span || !anchor) return;
      const a = anchor.getBoundingClientRect();
      const r = span.getClientRects()[0] ?? span.getBoundingClientRect();
      scroller.scrollTo({
        top: scroller.scrollTop + (r.top + r.height / 2) - (a.top + a.height / 2),
        behavior: b,
      });
    },
    [index],
  );

  useEffect(() => {
    if (!drafting) return;
    revealIn(paperRef.current?.querySelector(`[data-field="${drafting}"]`), 'nearest', behavior);
    if (compact) return;
    const id = window.setTimeout(() => alignSource(drafting, behavior), reduce ? 0 : 140);
    return () => clearTimeout(id);
  }, [drafting, compact, reduce, behavior, alignSource]);

  useEffect(() => {
    if (!hoverField || !split || drafting) return;
    const id = window.setTimeout(() => alignSource(hoverField, behavior), 140);
    return () => clearTimeout(id);
  }, [hoverField, split, drafting, behavior, alignSource]);

  // The open question is always in view: after drafting, after each answer, and from the pill.
  const scrollToCurrent = useCallback(
    (flash: boolean) => {
      if (!current) return;
      const el = paperRef.current?.querySelector<HTMLElement>(`[data-field="${current}"]`);
      revealIn(el, 'center', behavior);
      if (flash) setPulse((n) => n + 1);
      window.setTimeout(
        () => el?.querySelector<HTMLElement>('[data-first-choice]')?.focus({ preventScroll: true }),
        60,
      );
    },
    [current, behavior],
  );

  const scrollToSign = useCallback(() => {
    const el = paperRef.current?.querySelector<HTMLElement>('[data-sign]');
    revealIn(el, 'center', behavior);
    window.setTimeout(
      () => el?.querySelector<HTMLElement>('[data-hold]')?.focus({ preventScroll: true }),
      60,
    );
  }, [behavior]);

  const prevCurrent = useRef<string | null>(null);
  useEffect(() => {
    const had = prevCurrent.current;
    prevCurrent.current = current;
    if (phase !== 'review' || current === had) return;
    // After the last answer, the signature line is the next thing to do.
    const id = window.setTimeout(() => (current ? scrollToCurrent(false) : had && scrollToSign()), 320);
    return () => clearTimeout(id);
  }, [phase, current, scrollToCurrent, scrollToSign]);

  useEffect(() => {
    if (startAt !== 'ready') return;
    const id = window.setTimeout(scrollToSign, 400);
    return () => clearTimeout(id);
  }, [startAt, scrollToSign]);

  // Once the signature has drawn, the note files itself into the episode.
  useEffect(() => {
    if (!s.signedAt || phase !== 'signing') return;
    const id = window.setTimeout(() => dispatch({ type: 'file' }), (t.signatureDraw + 1.1) * 1000);
    return () => clearTimeout(id);
  }, [s.signedAt, phase, t.signatureDraw]);

  const sign = () => {
    const at = formatClock(new Date());
    dispatch({ type: 'sign', at });
    onSigned?.(at);
  };

  const openSource = (spans: string[]) => {
    const f = spans[0] ? fieldForSpan(fields, spans[0]) : null;
    if (compact || !split || !f) {
      setSheet({ open: true, focus: spans });
      return;
    }
    alignSource(f, behavior);
  };

  /* ------------------------------------------------------------ layout */
  const share = t.transcriptShare;
  const columns = compact
    ? '1fr'
    : recordingPhase
      ? '1fr 0fr'
      : split
        ? `${share}fr ${1 - share}fr`
        : '0fr 1fr';
  const { left: flipLeft, right: flipRight } = useColumnFlip(columns, t.layoutShift, reduce);

  const scrollArea = { [SCROLL_AREA]: true };

  return (
    <>
      <header className={classes.top}>
        <div className={classes.brand}>
          <span className={classes.mark} aria-hidden />
          <span className={classes.org}>{encounter.visit.organisation}</span>
          <span className={classes.crumb} aria-hidden>
            /
          </span>
          <span className={classes.crumbHere}>Visits</span>
        </div>
        <div className={classes.topRight}>
          {compact && !recordingPhase && phase !== 'filed' && (
            <UnstyledButton className={classes.ghost} onClick={() => setSheet({ open: true })}>
              <IconTranscript /> Transcript
            </UnstyledButton>
          )}
          <Tooltip
            label="Sample patient. The transcription and draft are scripted; no AI runs here."
            withArrow
            multiline
            w={220}
          >
            <Badge className={classes.env} variant="outline" radius="xl" tabIndex={0}>
              Demo · simulated AI
            </Badge>
          </Tooltip>
          <Avatar
            classNames={{ placeholder: classes.mePlaceholder }}
            size={26}
            radius="xl"
            aria-label={`Signed in as ${encounter.visit.clinician}`}
          >
            {encounter.visit.clinicianInitials}
          </Avatar>
        </div>
      </header>

      <div className={classes.context}>
        <div className={classes.who}>
          <span className={classes.name}>
            {encounter.patient.name}, {encounter.patient.age}
          </span>
          <span className={classes.visit}>
            {encounter.visit.title} · {encounter.visit.date}
          </span>
        </div>
        <StatusPill
          label={statusLabel(phase, open, Boolean(s.signedAt), stream)}
          tone={statusTone(phase, open, Boolean(s.signedAt), stream)}
          states={
            phase === 'drafting' || phase === 'review'
              ? fields.map((f) => s.fields[f.id]?.status ?? 'empty')
              : null
          }
          onClick={phase === 'review' ? (open ? () => scrollToCurrent(true) : scrollToSign) : undefined}
          hint={phase === 'review' ? (open ? 'Go to the open question' : 'Go to the signature') : undefined}
          reduce={reduce}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {phase === 'filed' ? (
          <motion.div
            key="episode"
            className={`${classes.stage} ${classes.scroll}`}
            {...scrollArea}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.18 } }
            }
          >
            <Episode
              signedAt={s.signedAt}
              onOpenNote={() => {
                setEvidence(false);
                dispatch({ type: 'open-note' });
              }}
              onRestart={onRestart}
            />
          </motion.div>
        ) : (
          <motion.div
            key="work"
            ref={workRef}
            className={classes.work}
            style={{ gridTemplateColumns: columns }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={
              reduce
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scale: 0.97,
                    y: 16,
                    filter: 'blur(6px)',
                    transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
                  }
            }
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            {showTranscript && (
              <section className={classes.col} aria-label="Visit transcript">
                <div ref={flipLeft} className={classes.transcriptCol}>
                  <div
                    ref={transcriptRef}
                    className={`${classes.scroll} ${classes.transcriptScroll}`}
                    {...scrollArea}
                  >
                    {stream.visible === 0 && phase === 'recording' && (
                      <p className={classes.listening}>
                        {stream.started ? 'Listening…' : 'The transcript shows here when you record.'}
                      </p>
                    )}
                    <TranscriptBody
                      turns={stream.turns.slice(0, stream.visible)}
                      wordPace={stream.wordGap}
                      follow={phase === 'recording'}
                      paused={stream.paused}
                      tailRoom={!recordingPhase}
                      activeSpans={activeSpans}
                      usedSpans={usedSpans}
                      onSpanEnter={setHoverSpan}
                      onSpanLeave={() => setHoverSpan(null)}
                      onSpanClick={(id) => {
                        const f = fieldForSpan(fields, id);
                        if (f) revealIn(fieldEl(f), 'center', behavior);
                      }}
                    />
                  </div>
                  <Recorder
                    mode={recorderMode}
                    speaking={stream.speaking}
                    clockTo={stream.clockTo}
                    clockDuration={stream.nextIn}
                    turns={stream.turns.length}
                    reduce={reduce}
                    stacked={compact}
                    canResume={stream.canResume}
                    onStart={stream.begin}
                    onPause={stream.pause}
                    onResume={() => {
                      if (phase === 'transcribed') {
                        stream.resumeAfterDone();
                        dispatch({ type: 'resume' });
                      } else stream.unpause();
                    }}
                    onFinish={stream.finish}
                    onDraft={() => dispatch({ type: 'draft' })}
                  />
                </div>
              </section>
            )}

            {(!compact || !recordingPhase) && (
              <section className={classes.col} aria-label="Encounter note">
                <div ref={paperRef} className={`${classes.scroll} ${classes.deskScroll}`} {...scrollArea}>
                  <div ref={flipRight} className={classes.paperCol}>
                    {compact && phase === 'drafting' && (
                      <Ticker spanId={drafting ? index.fieldById[drafting]?.sources[0] : undefined} />
                    )}
                    {phase === 'note' && (
                      <div className={classes.docbar}>
                        <UnstyledButton
                          className={classes.back}
                          onClick={() => dispatch({ type: 'to-episode' })}
                        >
                          <IconBack /> Episode
                        </UnstyledButton>
                        <Switch
                          classNames={{ root: classes.evidence, label: classes.evidenceLabel }}
                          labelPosition="left"
                          label="Evidence"
                          size="xs"
                          checked={evidence}
                          onChange={() => (compact ? setSheet({ open: true }) : setEvidence((e) => !e))}
                        />
                      </div>
                    )}
                    {paperPhase && (
                      <Paper
                        fields={s.fields}
                        phase={phase}
                        current={s.current}
                        open={open}
                        pulse={pulse}
                        activeField={split || compact ? activeField : null}
                        drafting={drafting}
                        signedAt={s.signedAt}
                        onHover={setHoverField}
                        onActivate={(id) => dispatch({ type: 'activate', id })}
                        onChoose={(id, choice, value) => dispatch({ type: 'choose', id, choice, value })}
                        onEdit={(id, value) => dispatch({ type: 'edit', id, value })}
                        onRevert={(id) => dispatch({ type: 'revert', id })}
                        onReopen={(id) => dispatch({ type: 'reopen', id })}
                        onSource={openSource}
                        onSign={sign}
                      />
                    )}
                  </div>
                </div>
              </section>
            )}

            {split && t.showThread && (
              <SourceThread
                container={workRef}
                fieldId={activeField}
                spans={activeSpans}
                transcript={transcriptRef}
                paper={paperRef}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={sheet.open} onClose={() => setSheet({ open: false })} title="Transcript" reduce={reduce}>
        <TranscriptBody
          turns={stream.turns}
          activeSpans={sheet.focus ?? []}
          usedSpans={usedSpans}
          scrollTo={sheet.focus?.[0]}
          stacked
        />
      </Sheet>
    </>
  );
}

/** On phones, while drafting: the line the draft is reading right now. */
function Ticker({ spanId }: { spanId?: string | undefined }) {
  const { index, reduce } = useNote();
  return (
    <div className={classes.ticker} aria-hidden>
      <span className={classes.tickerLabel}>Reading</span>
      <AnimatePresence mode="popLayout" initial={false}>
        {spanId && (
          <motion.span
            key={spanId}
            className={classes.tickerText}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: 'blur(3px)' }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
          >
            <span className={classes.tickerTime}>{index.spanTurn[spanId]?.time}</span> “
            {index.spanText[spanId]}”
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
