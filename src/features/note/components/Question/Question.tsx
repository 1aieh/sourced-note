import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Kbd, TextInput, UnstyledButton } from '@mantine/core';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_OUT } from '@/shared/motion';
import { useNote } from '../../context';
import type { Field } from '../../model/types';
import classes from './Question.module.css';

type Props = {
  field: Field;
  /** The open question in focus. The others wait as one-line rows. */
  current: boolean;
  /** Bumped to flash a ring round the question. */
  pulse: number;
  disabled: boolean;
  onActivate: () => void;
  onChoose: (choice: string, value: string) => void;
  onSource: (spans: string[]) => void;
};

/**
 * What the draft could not decide, asked as one clear question with numbered
 * answers. Number keys answer it, as long as nothing else has focus for typing.
 */
export function Question({ field, current, pulse, disabled, onActivate, onChoose, onSource }: Props) {
  const { index, reduce } = useNote();
  const [typingOpen, setTyping] = useState(false);
  // Moving to another question closes the free-text input.
  const typing = typingOpen && current;
  const [text, setText] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const options = field.options ?? [];
  const titleId = `q-${field.id}`;

  useEffect(() => {
    if (typing) input.current?.focus({ preventScroll: true });
  }, [typing]);

  const pick = (i: number) => {
    const o = options[i];
    if (!o || disabled) return;
    if (o.freeText) setTyping(true);
    else onChoose(o.id, o.value ?? o.label);
  };
  const pickRef = useRef(pick);
  useEffect(() => {
    pickRef.current = pick;
  });

  useEffect(() => {
    if (!current || disabled) return;
    const onKey = (e: KeyboardEvent) => {
      const typingElsewhere =
        e.target instanceof Element && e.target.closest('input, textarea, [contenteditable]');
      if (typingElsewhere || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= options.length) {
        e.preventDefault();
        pickRef.current(n - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, disabled, options.length]);

  if (!current) {
    return (
      <UnstyledButton className={classes.row} onClick={onActivate} disabled={disabled}>
        <span className={classes.rowText}>{field.question}</span>
        <span className={classes.rowCta}>Answer</span>
      </UnstyledButton>
    );
  }

  const save = () => {
    if (text.trim()) onChoose('typed', text.trim());
  };

  return (
    <motion.div
      className={classes.card}
      data-question={field.id}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
    >
      {pulse > 0 && <span key={pulse} className={classes.pulse} aria-hidden />}
      <QuestionHead id={titleId} title={field.question} prompt={field.prompt} />

      {field.kind === 'judgment' && (
        <ul className={classes.quotes}>
          {field.sources.map((id) => (
            <li key={id}>
              <UnstyledButton className={classes.quote} onClick={() => onSource([id])}>
                <span className={classes.quoteTime}>{index.spanTurn[id]?.time}</span>
                <span>“{index.spanText[id]}”</span>
              </UnstyledButton>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence mode="popLayout" initial={false}>
        {typing ? (
          <motion.form
            key="typing"
            className={classes.type}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <TextInput
              ref={input}
              id={`f-${field.id}`}
              classNames={{ input: classes.input }}
              variant="unstyled"
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setTyping(false);
                }
              }}
              placeholder="For example, 2 out of 10 by evening"
              aria-labelledby={titleId}
            />
            <div className={classes.typeActions}>
              <UnstyledButton type="button" className={classes.ghost} onClick={() => setTyping(false)}>
                Back
              </UnstyledButton>
              <UnstyledButton type="submit" className={classes.save} disabled={!text.trim()}>
                Save
              </UnstyledButton>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="options"
            className={classes.options}
            role="group"
            aria-labelledby={titleId}
            initial={false}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
          >
            {options.map((o, i) => {
              const src = o.sources[0];
              return (
                <QuestionOption
                  key={o.id}
                  n={i + 1}
                  label={o.label}
                  detail={o.detail}
                  disabled={disabled}
                  first={i === 0}
                  onClick={() => pick(i)}
                  source={
                    src && (
                      <span
                        className={classes.optionSource}
                        role="link"
                        tabIndex={-1}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSource(o.sources);
                        }}
                      >
                        {index.spanTurn[src]?.time}
                      </span>
                    )
                  }
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function QuestionHead({
  id,
  title,
  prompt,
}: {
  id?: string;
  title?: string | undefined;
  prompt?: string | undefined;
}) {
  return (
    <>
      <h3 className={classes.title} id={id}>
        {title}
      </h3>
      {prompt && <p className={classes.prompt}>{prompt}</p>}
    </>
  );
}

/** A numbered answer. Rendered as a button in the product, or as a static row in specimens. */
export function QuestionOption({
  n,
  label,
  detail,
  source,
  disabled,
  first,
  focused,
  onClick,
}: {
  n: number;
  label: string;
  detail?: string;
  source?: ReactNode;
  disabled?: boolean;
  first?: boolean;
  /** Draw the focus ring, for the static design system sheet. */
  focused?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <>
      <Kbd className={classes.kbd}>{n}</Kbd>
      <span className={classes.optionText}>
        <span className={classes.optionLabel}>{label}</span>
        {detail && <span className={classes.optionDetail}>{detail}</span>}
      </span>
      {source}
    </>
  );
  if (!onClick) {
    return (
      <div className={classes.option} data-focused={focused || undefined}>
        {body}
      </div>
    );
  }
  return (
    <UnstyledButton
      className={classes.option}
      disabled={disabled}
      onClick={onClick}
      data-first-choice={first || undefined}
    >
      {body}
    </UnstyledButton>
  );
}

/** A static question card, for specimens. */
export function QuestionCard({
  title,
  prompt,
  dense,
  children,
}: {
  title: string;
  prompt?: string;
  dense?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={classes.card} data-dense={dense || undefined}>
      <QuestionHead title={title} prompt={prompt} />
      <div className={classes.options}>{children}</div>
    </div>
  );
}

/** A waiting question as a one-line row, for specimens. */
export function QuestionRow({ children }: { children: ReactNode }) {
  return (
    <div className={classes.row} data-static>
      <span className={classes.rowText}>{children}</span>
      <span className={classes.rowCta}>Answer</span>
    </div>
  );
}
