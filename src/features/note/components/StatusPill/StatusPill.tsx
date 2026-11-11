import { UnstyledButton } from '@mantine/core';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { EASE_OUT } from '@/shared/motion';
import type { SegmentTone, StatusTone } from '../../model/status';
import { segmentTone } from '../../model/status';
import type { FieldStatus } from '../../model/types';
import { IconChevron } from '../icons';
import classes from './StatusPill.module.css';

/** One small bar per field: green when settled, red when it needs an answer. */
export function StatusSegments({ tones }: { tones: SegmentTone[] }) {
  return (
    <span className={classes.segs} aria-hidden>
      {tones.map((t, i) => (
        <span key={i} data-tone={t} />
      ))}
    </span>
  );
}

/** The pill's look without behaviour, for the design system sheet and specimens. */
export function StatusChip({
  tone,
  segments,
  pulse,
  go,
  children,
}: {
  tone: StatusTone;
  segments?: SegmentTone[];
  pulse?: boolean;
  go?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={classes.pill} data-tone={tone}>
      {segments ? <StatusSegments tones={segments} /> : <Dot pulse={pulse} />}
      {children}
      {go && <Go />}
    </span>
  );
}

const Dot = ({ pulse }: { pulse?: boolean | undefined }) => (
  <span className={classes.dot} data-pulse={pulse || undefined} />
);

const Go = () => (
  <span className={classes.go} aria-hidden>
    <IconChevron />
  </span>
);

/** Where the visit stands. During review it also takes you to what is next. */
export function StatusPill({
  label,
  tone,
  states,
  onClick,
  hint,
  reduce,
}: {
  label: string;
  tone: StatusTone;
  /** Field states, shown as segments while drafting and reviewing. */
  states: FieldStatus[] | null;
  onClick?: (() => void) | undefined;
  hint?: string | undefined;
  reduce: boolean;
}) {
  const body = (
    <>
      {states ? (
        <StatusSegments tones={states.map(segmentTone)} />
      ) : (
        <Dot pulse={tone === 'live' || label === 'Writing'} />
      )}
      <span className={classes.label} aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={label}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: 'blur(3px)' }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
      {onClick && <Go />}
    </>
  );

  if (!onClick) {
    return (
      <span className={classes.pill} data-tone={tone}>
        {body}
      </span>
    );
  }
  return (
    <UnstyledButton
      className={classes.pill}
      data-tone={tone}
      data-action
      onClick={onClick}
      aria-label={hint ? `${label}. ${hint}` : undefined}
    >
      {body}
    </UnstyledButton>
  );
}
