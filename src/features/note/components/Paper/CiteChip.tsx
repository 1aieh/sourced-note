import { motion } from 'motion/react';
import { EASE_OUT } from '@/shared/motion';
import classes from './Paper.module.css';

/** The transcript times a value comes from. Pressing it shows the source. */
export function CiteChip({
  times,
  reduce,
  onClick,
}: {
  times: string[];
  reduce?: boolean;
  onClick?: () => void;
}) {
  if (!onClick) return <span className={classes.cite}>{times.join(' · ')}</span>;
  return (
    <motion.button
      type="button"
      className={classes.cite}
      initial={reduce ? false : { opacity: 0, filter: 'blur(3px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      onClick={onClick}
      aria-label={`Show source in transcript, ${times.join(' and ')}`}
    >
      {times.join(' · ')}
    </motion.button>
  );
}
