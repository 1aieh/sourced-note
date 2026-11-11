import { UnstyledButton } from '@mantine/core';
import { motion } from 'motion/react';
import { EASE_OUT, staggerItem } from '@/shared/motion';
import { useNote } from '../../context';
import { settledSources, spanTimes } from '../../model/encounter';
import type { Field, FieldState, Phase } from '../../model/types';
import { Glyph, IconUndo } from '../icons';
import { Question } from '../Question/Question';
import { Signature } from '../Signature/Signature';
import { AutoHeight } from './AutoHeight';
import { CiteChip } from './CiteChip';
import { DraftValue } from './DraftValue';
import classes from './Paper.module.css';

export type PaperProps = {
  fields: Record<string, FieldState>;
  phase: Phase;
  current: string | null;
  /** Open questions left. */
  open: number;
  pulse: number;
  /** The field whose source is lit in the transcript. */
  activeField: string | null;
  /** The field the draft is writing right now. */
  drafting: string | null;
  signedAt?: string | undefined;
  onHover: (id: string | null) => void;
  onActivate: (id: string) => void;
  onChoose: (id: string, choice: string, value: string) => void;
  onEdit: (id: string, value: string) => void;
  onRevert: (id: string) => void;
  onReopen: (id: string) => void;
  onSource: (spans: string[]) => void;
  onSign: () => void;
};

const TR = { duration: 0.36, ease: EASE_OUT };

/** The encounter note as a sheet of paper: header, the fields, and the signature line. */
export function Paper(p: PaperProps) {
  const { encounter, settings, reduce } = useNote();
  const { patient, visit } = encounter;
  const enter = staggerItem(reduce);
  const lead = p.phase === 'drafting' ? settings.layoutShift * 0.55 : 0;

  return (
    <motion.article
      className={classes.paper}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.985, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay: lead }}
    >
      <motion.div
        initial="hidden"
        animate="shown"
        variants={{
          shown: { transition: { staggerChildren: 0.05, delayChildren: lead ? lead + 0.12 : 0 } },
        }}
      >
        <motion.header variants={enter} transition={TR}>
          <div className={classes.kicker}>Encounter note</div>
          <h2 className={classes.title}>{visit.title}</h2>
        </motion.header>

        <motion.dl className={classes.meta} variants={enter} transition={TR}>
          <div>
            <dt>Patient</dt>
            <dd>{patient.name}</dd>
          </div>
          <div>
            <dt>Born</dt>
            <dd>{patient.born}</dd>
          </div>
          <div>
            <dt>Visit</dt>
            <dd>{visit.date}</dd>
          </div>
          <div>
            <dt>Clinician</dt>
            <dd>{visit.clinician}</dd>
          </div>
        </motion.dl>

        <motion.h3 className={classes.section} variants={enter} transition={TR}>
          <span>S</span> Subjective
        </motion.h3>

        <ol className={classes.rows}>
          {encounter.fields.map((field) => (
            <motion.li key={field.id} variants={enter} transition={TR}>
              <FieldRow field={field} state={p.fields[field.id] ?? { value: '', status: 'empty' }} {...p} />
            </motion.li>
          ))}
        </ol>

        <motion.div variants={enter} transition={TR}>
          <Signature phase={p.phase} open={p.open} signedAt={p.signedAt} onSign={p.onSign} />
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

function FieldRow({ field, state, ...p }: PaperProps & { field: Field; state: FieldState }) {
  const { index, reduce } = useNote();
  const editable = p.phase === 'review';
  const needs = state.status === 'needs';
  const sources = settledSources(field, state);
  const showSources = state.status !== 'empty' && !needs && sources.length > 0 && field.kind !== 'gap';
  const reading = p.drafting === field.id;

  return (
    <div
      className={classes.row}
      data-field={field.id}
      data-status={state.status}
      data-kind={field.kind}
      data-active={p.activeField === field.id || undefined}
      onMouseEnter={() => p.onHover(field.id)}
      onMouseLeave={() => p.onHover(null)}
      onFocusCapture={() => p.onHover(field.id)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) p.onHover(null);
      }}
    >
      <div className={classes.label}>
        <Glyph status={state.status} reduce={reduce} anchor />
        <label htmlFor={`f-${field.id}`}>{field.label}</label>
      </div>

      <AutoHeight className={classes.rowValue} reduce={reduce}>
        {field.kind === 'cited' && (
          <DraftValue
            field={field}
            state={state}
            editable={editable}
            reading={reading}
            onEdit={(v) => p.onEdit(field.id, v)}
          />
        )}

        {field.kind !== 'cited' && state.status === 'empty' && (
          <div className={classes.questionSkeleton} data-reading={reading || undefined} aria-hidden />
        )}

        {needs && (
          <Question
            field={field}
            current={p.current === field.id}
            pulse={p.current === field.id ? p.pulse : 0}
            disabled={p.phase !== 'review'}
            onActivate={() => p.onActivate(field.id)}
            onChoose={(c, v) => p.onChoose(field.id, c, v)}
            onSource={p.onSource}
          />
        )}

        {state.status === 'decided' && (
          <motion.div
            className={classes.decided}
            initial={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(3px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.26, ease: EASE_OUT }}
          >
            <span className={classes.decidedValue} id={`f-${field.id}`}>
              {state.value}
            </span>
            {editable && (
              <span className={classes.decidedBy}>
                {state.choice === 'typed' ? 'You typed this' : 'You chose this'}
                <UnstyledButton className={classes.link} onClick={() => p.onReopen(field.id)}>
                  Change
                </UnstyledButton>
              </span>
            )}
          </motion.div>
        )}

        {state.status === 'edited' && editable && (
          <div className={classes.edited}>
            <span>You changed this. Draft: “{field.draft}”</span>
            <UnstyledButton className={classes.link} onClick={() => p.onRevert(field.id)}>
              <IconUndo /> Revert
            </UnstyledButton>
          </div>
        )}
      </AutoHeight>

      <div className={classes.rowMeta}>
        {showSources && (
          <CiteChip times={spanTimes(index, sources)} reduce={reduce} onClick={() => p.onSource(sources)} />
        )}
      </div>
    </div>
  );
}
