import { useEffect, useState } from 'react';
import { Keyboard, Microphone, Quotes, SealQuestion, Signature, Waveform } from '@phosphor-icons/react';
import type { FieldStatus } from '@/features/note';
import { NoteParts } from '@/features/note';
import classes from './Specimens.module.css';

const {
  CiteChip,
  DraftText,
  Glyph,
  Kbd,
  QuestionCard,
  QuestionOption,
  SignatureMark,
  SourceQuote,
  StatusChip,
  StatusSegments,
  questionClasses,
} = NoteParts;

export function CiteSpecimen() {
  return (
    <div>
      <SourceQuote
        before="The socket again. "
        quote="It’s fine first thing, but by mid-afternoon it’s loose and rubbing at the front."
      />
      <svg className={classes.thread} viewBox="0 0 20 28" aria-hidden>
        <path d="M10 0 C 10 12, 10 16, 10 28" />
      </svg>
      <div className={classes.row}>
        <Glyph status="drafted" reduce />
        <span className={classes.rowValue}>Socket loosens by mid-afternoon, rubbing anteriorly.</span>
        <CiteChip times={['00:09']} />
      </div>
    </div>
  );
}

export function QuestionSpecimen() {
  const options = [
    ['March 2021', 'From the referral letter', '00:33'],
    ['March 2023', 'From the patient', '00:24'],
  ] as const;
  return (
    <QuestionCard
      title="Which amputation date goes on the note?"
      prompt="The patient and the referral letter do not agree."
      dense
    >
      {options.map(([label, detail, time], i) => (
        <QuestionOption
          key={label}
          n={i + 1}
          label={label}
          detail={detail}
          source={<span className={questionClasses.optionSource}>{time}</span>}
        />
      ))}
    </QuestionCard>
  );
}

export function SignSpecimen() {
  return (
    <div>
      <div className={classes.row}>
        <Glyph status="decided" reduce />
        <span className={classes.rowValue}>
          <b>K3</b> <span className={classes.dim}>You chose this</span>
        </span>
      </div>
      <div className={classes.signLine}>
        <SignatureMark size="lg" />
      </div>
      <div className={classes.signCaption}>
        <span>R. Moreau, CPO</span>
        <span className={classes.mono}>Signed 14:02</span>
      </div>
    </div>
  );
}

const STATES: [FieldStatus, string][] = [
  ['empty', 'Not written yet'],
  ['drafted', 'Written, with a source'],
  ['needs', 'Needs your answer'],
  ['decided', 'You chose it'],
  ['edited', 'You changed it'],
];

export function StatesSpecimen() {
  return (
    <ul className={classes.states}>
      {STATES.map(([st, label]) => (
        <li key={st}>
          <Glyph status={st} reduce />
          <span>{label}</span>
        </li>
      ))}
      <li className={classes.statesBar}>
        <StatusSegments tones={['ready', 'ready', 'needs', 'ready', 'ready', 'needs', 'empty']} />
        <span className={classes.dim}>2 to answer</span>
      </li>
    </ul>
  );
}

const FILL = 'Type 2 diabetes, control improving. About 6 kg weight loss since the last fitting.';

/** Loops the skeleton-to-text reveal. */
export function FillSpecimen() {
  const [state, setState] = useState<'ghost' | 'in'>('ghost');
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setTimeout(
      () => {
        setState((s) => (s === 'ghost' ? 'in' : 'ghost'));
        setN((x) => x + 1);
      },
      state === 'ghost' ? 1300 : 2600,
    );
    return () => clearTimeout(id);
  }, [state]);
  return (
    <div>
      <div className={classes.rowTop}>
        <Glyph status={state === 'ghost' ? 'empty' : 'drafted'} />
        <span className={classes.rowLabel}>Relevant history</span>
      </div>
      <DraftText key={n} text={FILL} state={state} reading={state === 'ghost'} />
    </div>
  );
}

export function KeysSpecimen() {
  return (
    <div className={classes.keys}>
      <div className={classes.keyRow}>
        {[1, 2, 3, 4].map((k) => (
          <Kbd key={k} className={questionClasses.kbd}>
            {k}
          </Kbd>
        ))}
        <span className={classes.dim}>Answer</span>
      </div>
      <div className={classes.keyRow}>
        <Kbd className={`${questionClasses.kbd} ${classes.kbdWide}`}>Enter</Kbd>
        <span className={classes.dim}>Hold to sign</span>
      </div>
      <div className={classes.keyRow}>
        <StatusChip tone="needs" segments={['ready', 'ready', 'ready', 'ready', 'ready', 'needs', 'ready']}>
          1 to answer
        </StatusChip>
        <span className={classes.dim}>Go to it</span>
      </div>
    </div>
  );
}

export function SystemSpecimen() {
  const colours: [string, string][] = [
    ['--sn-ok', 'Done'],
    ['--sn-needs', 'Open'],
    ['--sn-accent', 'Source'],
    ['--sn-rec', 'Recording'],
    ['--sn-ink', 'Ink'],
  ];
  return (
    <div className={classes.system}>
      <div className={classes.block}>
        <p className={classes.blockLabel}>Colour has a meaning, or it is not used</p>
        <ul className={classes.swatches}>
          {colours.map(([v, l]) => (
            <li key={v}>
              <span className={classes.swatch} style={{ background: `var(${v})` }} />
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={classes.block}>
        <p className={classes.blockLabel}>One type family, two voices</p>
        <div className={classes.type}>
          <span className={classes.typeA}>Encounter note</span>
          <span className={classes.typeSpec}>Geist 600 · 20</span>
          <span className={classes.typeC}>Socket loosens by mid-afternoon.</span>
          <span className={classes.typeSpec}>Geist 400 · 15</span>
          <span className={classes.typeD}>00:09 · 01:12</span>
          <span className={classes.typeSpec}>Geist Mono · 12, tabular</span>
        </div>
      </div>
      <div className={classes.block}>
        <p className={classes.blockLabel}>Phosphor icons for actions, custom marks for state</p>
        <div className={classes.icons}>
          <Microphone size={20} />
          <Waveform size={20} />
          <Quotes size={20} />
          <SealQuestion size={20} />
          <Signature size={20} />
          <Keyboard size={20} />
          <span className={classes.iconsSep} />
          {STATES.map(([st]) => (
            <Glyph key={st} status={st} reduce />
          ))}
        </div>
      </div>
      <div className={classes.block}>
        <p className={classes.blockLabel}>Motion is quick, eased, and only where it helps</p>
        <div className={classes.motion}>
          <svg viewBox="0 0 64 64" className={classes.curve} aria-hidden>
            <path className={classes.curveAxis} d="M4 60 H60 M4 60 V4" />
            <path d="M4 60 C 16.9 4, 21.9 4, 60 4" />
          </svg>
          <ul className={classes.motionList}>
            <li>
              <span>ease</span>
              <span>.23 1 .32 1</span>
            </li>
            <li>
              <span>press</span>
              <span>scale 0.96</span>
            </li>
            <li>
              <span>ui</span>
              <span>150–300ms</span>
            </li>
            <li>
              <span>reduced</span>
              <span>fades only</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
