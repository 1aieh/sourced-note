import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'motion/react';
import classes from './Paper.module.css';

/** Animates its own height to fit its content, so the rows below glide instead of jumping. */
export function AutoHeight({
  children,
  className,
  reduce,
}: {
  children: ReactNode;
  className?: string;
  reduce: boolean;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | 'auto'>('auto');
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <motion.div
      className={className}
      style={{ overflow: 'clip', overflowClipMargin: 8 } as CSSProperties}
      initial={false}
      animate={{ height: h }}
      transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
    >
      <div ref={inner} className={classes.autoHeight}>
        {children}
      </div>
    </motion.div>
  );
}
