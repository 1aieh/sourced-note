import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_OUT } from '@/shared/motion';
import { useNote } from '../../context';
import type { Phase } from '../../model/types';
import classes from './Signature.module.css';

/** A loose hand-drawn signature, drawn left to right. */
export const SIGNATURE_PATH =
  'M6 40 C 12 14, 26 8, 27 22 S 18 52, 30 44 S 44 18, 52 30 S 50 46, 60 40 C 70 32, 72 22, 79 29 S 80 47, 92 38 S 104 21, 111 32 S 113 45, 124 38 C 134 31, 140 25, 147 33 S 151 46, 163 36 C 176 25, 192 28, 216 20';
const FLOURISH_PATH = 'M40 52 C 90 47, 150 46, 206 42';

/** The signature line. Signing opens only once no question is open. */
export function Signature({
  phase,
  open,
  signedAt,
  onSign,
}: {
  phase: Phase;
  /** Open questions left. */
  open: number;
  signedAt?: string | undefined;
  onSign: () => void;
}) {
  const { encounter, settings, reduce } = useNote();
  const signed = Boolean(signedAt);
  const ready = phase === 'review' && open === 0;
  const key = signed ? 'sig' : ready ? 'hold' : phase === 'review' ? `wait-${open}` : 'empty';

  return (
    <section className={classes.sign} data-sign aria-label="Signature">
      <SignatureLine ready={ready}>
        <AnimatePresence mode="popLayout" initial={false}>
          {signed ? (
            <motion.svg
              key="sig"
              className={classes.mark}
              viewBox="0 0 222 60"
              role="img"
              aria-label={`Signed by ${encounter.visit.clinician}`}
            >
              <motion.path
                d={SIGNATURE_PATH}
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: settings.signatureDraw, ease: [0.65, 0, 0.35, 1] }}
              />
              <motion.path
                d={FLOURISH_PATH}
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: settings.signatureDraw * 0.4,
                  delay: reduce ? 0 : settings.signatureDraw * 0.9,
                  ease: EASE_OUT,
                }}
              />
            </motion.svg>
          ) : (
            <motion.div
              key={key}
              className={classes.slot}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={
                reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(4px)', transition: { duration: 0.14 } }
              }
              transition={{ duration: 0.28, ease: EASE_OUT }}
            >
              {ready ? (
                <HoldToSign seconds={settings.holdToSign} onDone={onSign} reduce={reduce} />
              ) : (
                <SignatureHint faint={phase === 'drafting'}>
                  {phase === 'review'
                    ? `Answer ${open === 1 ? 'the last question' : `${open} questions`} to sign`
                    : 'Not signed'}
                </SignatureHint>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </SignatureLine>
      <div className={classes.caption}>
        <span>{encounter.visit.clinician}</span>
        <AnimatePresence initial={false}>
          {signed && (
            <motion.span
              className={classes.stamp}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: reduce ? 0 : settings.signatureDraw }}
            >
              Signed {encounter.visit.date}, {signedAt}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export function SignatureLine({
  ready,
  short,
  children,
}: {
  ready?: boolean;
  /** A shorter line, for the design system sheet. */
  short?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={classes.line} data-ready={ready || undefined} data-short={short || undefined}>
      {children}
    </div>
  );
}

export function SignatureHint({ faint, children }: { faint?: boolean; children: ReactNode }) {
  return (
    <span className={classes.hint} data-faint={faint || undefined}>
      {children}
    </span>
  );
}

/** The drawn signature, static. */
export function SignatureMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <svg className={classes.mark} data-size={size} viewBox="0 0 222 60" aria-hidden>
      <path d={SIGNATURE_PATH} />
    </svg>
  );
}

/** The hold button's look at a fixed progress, for the design system sheet. */
export function HoldButtonPreview({ progress }: { progress: number }) {
  return (
    <span className={classes.hold} data-preview>
      <span>Press and hold to sign</span>
      <span
        className={classes.fill}
        style={{ clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`, transition: 'none' }}
      >
        <span>Press and hold to sign</span>
      </span>
    </span>
  );
}

/**
 * Press and hold to sign. The fill grows while held and snaps back on
 * release, so a stray tap never signs. Space and Enter hold it too.
 */
export function HoldToSign({
  seconds,
  onDone,
  reduce,
}: {
  seconds: number;
  onDone: () => void;
  reduce: boolean;
}) {
  const [holding, setHolding] = useState(false);
  const timer = useRef(0);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    btn.current?.focus({ preventScroll: true });
    return () => clearTimeout(timer.current);
  }, []);

  const start = () => {
    if (holding) return;
    setHolding(true);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      onDone();
    }, seconds * 1000);
  };
  const stop = () => {
    clearTimeout(timer.current);
    setHolding(false);
  };

  return (
    <button
      ref={btn}
      type="button"
      className={classes.hold}
      data-hold
      data-holding={holding || undefined}
      style={{ '--hold': `${seconds}s` } as CSSProperties}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        start();
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') stop();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span>Press and hold to sign</span>
      <span className={classes.fill} aria-hidden data-reduce={reduce || undefined}>
        <span>Press and hold to sign</span>
      </span>
    </button>
  );
}
