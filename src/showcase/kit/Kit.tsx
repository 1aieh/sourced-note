import type { ReactNode } from 'react';
import type { FieldStatus, StatusTone } from '@/features/note';
import { NoteParts } from '@/features/note';
import classes from './Kit.module.css';

const {
  ActionButton,
  CiteChip,
  EpisodeRow,
  EpisodeStartPreview,
  Glyph,
  HoldButtonPreview,
  IconMic,
  IconPause,
  QuestionCard,
  QuestionOption,
  QuestionRow,
  Recorder,
  RoundIconPreview,
  SignatureHint,
  SignatureLine,
  SignatureMark,
  StatusChip,
  questionClasses,
} = NoteParts;

const noop = () => {};

/**
 * The prototype's parts, laid out with their states the way a design system
 * sheet would show them. Every piece is the real component, so the sheet
 * cannot drift from the product.
 */
export function Kit() {
  return (
    <div className={classes.kit} aria-hidden>
      <KitCard name="Field row" note="5 states" span>
        <div className={classes.rows}>
          <FieldRow status="empty" label="Pain at rest" />
          <FieldRow status="drafted" label="Amputation level" value="Transtibial, left" cite="00:24" />
          <FieldRow
            status="needs"
            label="Date of amputation"
            question="Which amputation date goes on the note?"
          />
          <FieldRow
            status="decided"
            label="Functional level"
            value="K3"
            by="You chose this"
            cite="00:51 · 01:26"
          />
          <FieldRow
            status="edited"
            label="Functional goals"
            value="Walk the dog to the harbour, 2 km"
            by="You changed this"
            cite="00:51"
          />
        </div>
      </KitCard>

      <KitCard name="Question" note="Open, typing, waiting">
        <QuestionCard title="No one talked about pain at rest. What goes on the note?" dense>
          <QuestionOption n={1} label="Not assessed at this visit" focused />
          <QuestionOption n={2} label="Type a value" />
          <span className={`${questionClasses.input} ${classes.input}`}>
            2 out of 10 by evening
            <span className={classes.caret} />
          </span>
        </QuestionCard>
        <QuestionRow>Which functional level did you observe?</QuestionRow>
      </KitCard>

      <KitCard name="Buttons" note="Five kinds">
        <div className={classes.wrap}>
          <ActionButton tone="primary" tabIndex={-1}>
            Create note
          </ActionButton>
          <ActionButton tone="secondary" tabIndex={-1}>
            Stop
          </ActionButton>
          <ActionButton tone="quiet" leftSection={<IconMic />} tabIndex={-1}>
            Resume
          </ActionButton>
          <ActionButton tone="record" leftSection={<span className={classes.recDot} />} tabIndex={-1}>
            Start recording
          </ActionButton>
          <RoundIconPreview>
            <IconPause />
          </RoundIconPreview>
          <RoundIconPreview>
            <IconMic />
          </RoundIconPreview>
          <button className={questionClasses.save} disabled tabIndex={-1}>
            Save
          </button>
        </div>
      </KitCard>

      <KitCard name="Status pill" note="One per phase" span>
        <div className={classes.wrap}>
          {PILLS.map(([tone, label, segments, go]) => (
            <StatusChip key={label} tone={tone} segments={segments} go={go}>
              {label}
            </StatusChip>
          ))}
        </div>
      </KitCard>

      <KitCard name="Recorder" note="Idle, live, transcribed" span>
        <div className={classes.docks}>
          <Recorder {...RECORDER} mode="idle" clockTo={0} turns={0} reduce />
          <Recorder
            {...RECORDER}
            mode="live"
            speaking
            clockTo={42}
            clockDuration={0.01}
            turns={0}
            reduce={false}
          />
          <Recorder {...RECORDER} mode="done" clockTo={91} turns={11} reduce />
        </div>
      </KitCard>

      <KitCard name="Signature" note="4 states">
        <div className={classes.sigs}>
          <SignatureLine short>
            <SignatureHint>Answer 2 questions to sign</SignatureHint>
          </SignatureLine>
          <SignatureLine short ready>
            <HoldButtonPreview progress={0} />
          </SignatureLine>
          <SignatureLine short ready>
            <HoldButtonPreview progress={0.6} />
          </SignatureLine>
          <SignatureLine short>
            <SignatureMark size="sm" />
          </SignatureLine>
        </div>
      </KitCard>

      <KitCard name="Episode row" note="4 states">
        <div className={classes.docs}>
          <EpisodeRow
            outlined
            state="done"
            title="Referral letter"
            detail="Dr. N. Ahlberg · received 2 Nov"
          />
          <EpisodeRow
            outlined
            state="new"
            title="Encounter note"
            detail="Signed by R. Moreau at 14:02"
            chevron
          />
          <EpisodeRow
            outlined
            state="todo"
            title="Functional assessment"
            detail="Gait on flat ground and the ramp"
            action={<EpisodeStartPreview />}
          />
          <EpisodeRow outlined state="blocked" title="Written order" detail="Needs the assessment first" />
        </div>
      </KitCard>
    </div>
  );
}

const RECORDER = {
  speaking: false,
  clockDuration: 1,
  stacked: true,
  canResume: true,
  onStart: noop,
  onPause: noop,
  onResume: noop,
  onFinish: noop,
  onDraft: noop,
};

type Seg = 'ready' | 'needs' | 'empty';
const PILLS: [StatusTone, string, Seg[] | undefined, boolean][] = [
  ['live', 'Recording', undefined, false],
  ['idle', 'Writing', ['ready', 'ready', 'empty', 'empty', 'empty', 'empty', 'empty'], false],
  ['needs', '3 to answer', ['ready', 'ready', 'needs', 'ready', 'ready', 'needs', 'needs'], true],
  ['ready', 'Ready to sign', ['ready', 'ready', 'ready', 'ready', 'ready', 'ready', 'ready'], true],
  ['done', 'Signed', undefined, false],
];

function KitCard({
  name,
  note,
  span,
  children,
}: {
  name: string;
  note: string;
  span?: boolean;
  children: ReactNode;
}) {
  return (
    <article className={classes.card} data-span={span || undefined}>
      <header className={classes.head}>
        <span className={classes.name}>{name}</span>
        <span className={classes.note}>{note}</span>
      </header>
      <div className={classes.body}>{children}</div>
    </article>
  );
}

function FieldRow({
  status,
  label,
  value,
  cite,
  by,
  question,
}: {
  status: FieldStatus;
  label: string;
  value?: string;
  cite?: string;
  by?: string;
  question?: string;
}) {
  return (
    <div className={classes.row} data-status={status}>
      <Glyph status={status} reduce />
      <span className={classes.rowLabel}>{label}</span>
      <span className={classes.rowValue}>
        {status === 'empty' && <span className={classes.skeleton} />}
        {value && <span>{value}</span>}
        {by && <span className={classes.by}>{by}</span>}
        {question && <span className={classes.rowQuestion}>{question}</span>}
      </span>
      <span className={classes.rowCite}>{cite && <CiteChip times={[cite]} />}</span>
    </div>
  );
}
