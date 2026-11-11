import { useState } from 'react';
import type { ReactNode } from 'react';
import { Avatar, Badge, UnstyledButton } from '@mantine/core';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_OUT, staggerItem } from '@/shared/motion';
import { useNote } from '../../context';
import type { DocState } from '../../model/types';
import { IconCheck, IconChevron, IconDoc } from '../icons';
import classes from './Episode.module.css';

const PILL: Record<DocState, string> = { done: 'Ready', new: 'Signed', todo: 'Next', blocked: 'Waiting' };
const TR = { duration: 0.36, ease: EASE_OUT };
const isReady = (s: DocState) => s === 'done' || s === 'new';

/**
 * Where the signed note lands: the patient's episode, with its care pathway
 * and the documents the packet needs. Signing finishes the note, not the
 * packet, and this shows what that leaves to do.
 */
export function Episode({
  signedAt,
  onOpenNote,
  onRestart,
}: {
  signedAt?: string | undefined;
  onOpenNote: () => void;
  onRestart: () => void;
}) {
  const { encounter, reduce } = useNote();
  const { patient, visit, episode, noteDocId } = encounter;
  const [nudge, setNudge] = useState(false);
  const enter = staggerItem(reduce);
  const ready = episode.docs.filter((d) => isReady(d.state)).length;
  const stepsDone = episode.pathway.filter((s) => s.state === 'done' || s.state === 'now').length;
  const initials = patient.name
    .split(' ')
    .map((w) => w[0])
    .join('');

  return (
    <motion.div
      className={classes.episode}
      initial="hidden"
      animate="shown"
      variants={{ shown: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }}
    >
      <motion.header className={classes.patient} variants={enter} transition={TR}>
        <Avatar classNames={{ placeholder: classes.avatarPlaceholder }} radius={14} size={44} aria-hidden>
          {initials}
        </Avatar>
        <div>
          <h2 className={classes.name}>{patient.name}</h2>
          <p className={classes.patientMeta}>
            Born {patient.born} · {patient.record}
          </p>
        </div>
        <Badge className={classes.status} variant="light" color="green" radius="xl">
          Episode open
        </Badge>
      </motion.header>

      <motion.section className={classes.path} variants={enter} transition={TR} aria-label="Care pathway">
        <div className={classes.pathTop}>
          <span className={classes.pathTitle}>{patient.episode}</span>
          <span className={classes.pathCount}>
            {stepsDone} of {episode.pathway.length}
          </span>
        </div>
        <ol className={classes.steps}>
          {episode.pathway.map((s) => (
            <li key={s.label} data-state={s.state}>
              <span className={classes.stepDot} aria-hidden>
                {(s.state === 'done' || s.state === 'now') && <IconCheck />}
              </span>
              <span className={classes.stepLabel}>{s.label}</span>
              <span className={classes.stepWhen}>{s.state === 'now' && signedAt ? signedAt : s.when}</span>
            </li>
          ))}
        </ol>
      </motion.section>

      <motion.section
        className={classes.packet}
        variants={enter}
        transition={TR}
        aria-label="Packet readiness"
      >
        <div className={classes.packetTop}>
          <span>Packet</span>
          <span>
            <b>
              {ready} of {episode.docs.length}
            </b>{' '}
            documents ready
          </span>
        </div>
        <div className={classes.bar} aria-hidden>
          {episode.docs.map((d) => (
            <span key={d.id} data-state={d.state} />
          ))}
        </div>
        <p>Not ready to send. The functional assessment is next.</p>
      </motion.section>

      <ol className={classes.docs}>
        {episode.docs.map((d) => {
          const isNote = d.id === noteDocId;
          const detail = isNote && signedAt ? `Signed by ${visit.clinician} at ${signedAt}` : d.detail;
          return (
            <motion.li key={d.id} variants={enter} transition={TR}>
              {isNote ? (
                <EpisodeRow
                  state={d.state}
                  title={d.title}
                  detail={detail}
                  chevron
                  glow={!reduce}
                  onClick={onOpenNote}
                />
              ) : (
                <EpisodeRow
                  state={d.state}
                  title={d.title}
                  detail={detail}
                  action={
                    d.state === 'todo' && (
                      <UnstyledButton className={classes.start} onClick={() => setNudge(true)}>
                        Start
                      </UnstyledButton>
                    )
                  }
                />
              )}
            </motion.li>
          );
        })}
      </ol>

      <motion.p className={classes.foot} variants={enter} transition={TR}>
        The note is in the episode. Nothing was sent.
        <UnstyledButton className={classes.link} onClick={onRestart}>
          Start again
        </UnstyledButton>
      </motion.p>
      <AnimatePresence>
        {nudge && (
          <motion.p
            className={classes.nudge}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
          >
            This prototype stops here. The real work would start now.
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** One document in the episode. A button when it opens something. */
export function EpisodeRow({
  state,
  title,
  detail,
  chevron,
  glow,
  action,
  outlined,
  onClick,
}: {
  state: DocState;
  title: string;
  detail: string;
  chevron?: boolean;
  /** A green wash that fades out, for the note that just arrived. */
  glow?: boolean;
  /** A trailing control, in place of the state pill. */
  action?: ReactNode;
  /** A flat outline instead of a card shadow, for the design system sheet. */
  outlined?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <>
      {glow && <span className={classes.glow} aria-hidden />}
      <span className={classes.icon} data-state={state}>
        {isReady(state) ? <IconCheck /> : <IconDoc />}
      </span>
      <span className={classes.docText}>
        <span className={classes.docTitle}>{title}</span>
        <span className={classes.docDetail}>{detail}</span>
      </span>
      {action || (
        <Badge className={classes.pill} data-state={state} variant="light" radius="xl">
          {PILL[state]}
        </Badge>
      )}
      {chevron && (
        <span className={classes.chevron}>
          <IconChevron />
        </span>
      )}
    </>
  );
  if (onClick) {
    return (
      <UnstyledButton className={classes.doc} data-outlined={outlined || undefined} onClick={onClick}>
        {body}
      </UnstyledButton>
    );
  }
  return (
    <div className={classes.doc} data-outlined={outlined || undefined}>
      {body}
    </div>
  );
}

/** The Start control's look without behaviour, for the design system sheet. */
export const EpisodeStartPreview = () => (
  <span className={classes.start} data-static>
    Start
  </span>
);
