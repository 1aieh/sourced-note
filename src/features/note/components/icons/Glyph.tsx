import { AnimatePresence, motion } from 'motion/react';
import type { FieldStatus } from '../../model/types';
import { iconBase } from './iconBase';
import classes from './Glyph.module.css';

/** One small mark per field state. The shape changes with the state, not only the colour. */
function Shape({ status }: { status: FieldStatus }) {
  switch (status) {
    case 'empty':
      return <circle cx="8" cy="8" r="3.25" strokeDasharray="1.6 1.9" />;
    case 'drafted':
      return <circle cx="8" cy="8" r="3.5" fill="currentColor" stroke="none" />;
    case 'needs':
      return <circle cx="8" cy="8" r="4" strokeWidth={1.75} />;
    case 'edited':
      return (
        <>
          <circle cx="8" cy="8" r="4" />
          <circle cx="8" cy="8" r="1.75" fill="currentColor" stroke="none" />
        </>
      );
    case 'decided':
      return <path d="M4.75 8.25l2.1 2.1 4.4-4.6" strokeWidth={1.75} />;
  }
}

export function Glyph({
  status,
  reduce = false,
  anchor = false,
}: {
  status: FieldStatus;
  reduce?: boolean;
  /** Marks the glyph as the end point of the source thread. */
  anchor?: boolean;
}) {
  return (
    <span className={classes.glyph} data-thread-anchor={anchor || undefined}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.svg
          key={status}
          {...iconBase}
          data-status={status}
          className={classes.svg}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
        >
          <Shape status={status} />
        </motion.svg>
      </AnimatePresence>
    </span>
  );
}
