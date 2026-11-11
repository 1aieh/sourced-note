import type { ReactNode } from 'react';
import { ActionIcon } from '@mantine/core';
import { useFocusReturn, useFocusTrap, useWindowEvent } from '@mantine/hooks';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_DRAWER } from '@/shared/motion';
import { SCROLL_AREA } from '@/shared/scroll';
import { IconClose } from '../icons';
import classes from './Sheet.module.css';

/**
 * A bottom sheet, positioned inside the workspace rather than the window, so
 * it also works when the workspace is embedded in a page or a phone frame.
 * Drag down or flick to dismiss. Focus is trapped while open and returns to
 * where it was on close.
 */
export function Sheet({
  open,
  onClose,
  title,
  reduce,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  reduce: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <Panel onClose={onClose} title={title} reduce={reduce}>
          {children}
        </Panel>
      )}
    </AnimatePresence>
  );
}

function Panel({ onClose, title, reduce, children }: Omit<Parameters<typeof Sheet>[0], 'open'>) {
  const trap = useFocusTrap(true);
  useFocusReturn({ opened: true, shouldReturnFocus: true });
  useWindowEvent('keydown', (e) => {
    if (e.key === 'Escape') onClose();
  });

  return (
    <div className={classes.layer}>
      <motion.div
        className={classes.scrim}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.18 } }}
        transition={{ duration: 0.24 }}
        onClick={onClose}
      />
      <motion.div
        ref={trap}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={classes.sheet}
        initial={reduce ? { opacity: 0 } : { y: '100%' }}
        animate={reduce ? { opacity: 1 } : { y: 0 }}
        exit={reduce ? { opacity: 0 } : { y: '100%', transition: { duration: 0.22, ease: EASE_DRAWER } }}
        transition={{ duration: 0.4, ease: EASE_DRAWER }}
        drag={reduce ? false : 'y'}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.04, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 500) onClose();
        }}
      >
        <div className={classes.grabber} aria-hidden />
        <div className={classes.head}>
          <span>{title}</span>
          <ActionIcon className={classes.close} variant="subtle" onClick={onClose} aria-label="Close">
            <IconClose />
          </ActionIcon>
        </div>
        <div
          className={classes.body}
          {...{ [SCROLL_AREA]: true }}
          data-autofocus
          tabIndex={-1}
          onPointerDownCapture={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
