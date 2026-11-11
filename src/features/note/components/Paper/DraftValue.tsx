import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Textarea } from '@mantine/core';
import { useNote } from '../../context';
import type { Field, FieldState } from '../../model/types';
import { renderWords } from '../Transcript/words';
import classes from './Paper.module.css';

export type DraftValueState = 'ghost' | 'in' | 'set';

/**
 * The look of a drafted value. As a ghost its words are a skeleton in the
 * exact shape of the text, so nothing moves when they resolve.
 */
export function DraftText({
  text,
  state,
  reading = false,
}: {
  text: string;
  state: DraftValueState;
  /** The draft is reading this field's source right now: the skeleton shimmers. */
  reading?: boolean;
}) {
  const { settings } = useNote();
  return (
    <div
      className={classes.value}
      data-state={state}
      data-reading={reading || undefined}
      style={{ '--reveal': `${settings.reveal}s`, '--rb': `${settings.revealBlur}px` } as CSSProperties}
    >
      {state === 'set' ? text : renderWords(text, 0)[0]}
    </div>
  );
}

/** A cited field's value. Click or Enter edits it in a Mantine Textarea with the same metrics. */
export function DraftValue({
  field,
  state,
  editable,
  reading,
  onEdit,
}: {
  field: Field;
  state: FieldState;
  editable: boolean;
  reading: boolean;
  onEdit: (value: string) => void;
}) {
  const { settings, reduce } = useNote();
  const [editing, setEditing] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const prev = useRef(state.status);

  // Resolve the words once, when the draft first fills the field.
  useEffect(() => {
    const was = prev.current;
    prev.current = state.status;
    if (was !== 'empty' || state.status === 'empty' || reduce) return;
    setRevealing(true);
    const words = (field.draft ?? '').split(/\s+/).length;
    const id = window.setTimeout(() => setRevealing(false), (settings.reveal + words * 0.022 + 0.1) * 1000);
    return () => clearTimeout(id);
  }, [state.status, reduce, field.draft, settings.reveal]);

  // Leaving review closes the editor.
  if (editing && editable) {
    return (
      <Textarea
        id={`f-${field.id}`}
        classNames={{ input: `${classes.value} ${classes.valueInput}`, root: classes.valueRoot }}
        autosize
        minRows={1}
        variant="unstyled"
        value={state.value}
        autoFocus
        aria-label={field.label}
        onFocus={(e) => {
          const el = e.currentTarget;
          el.setSelectionRange(el.value.length, el.value.length);
        }}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        onChange={(e) => onEdit(e.currentTarget.value)}
      />
    );
  }

  const ghost = state.status === 'empty';
  const look: DraftValueState = ghost ? 'ghost' : revealing ? 'in' : 'set';
  const text = ghost ? (field.draft ?? '') : state.value;
  return (
    <div
      id={`f-${field.id}`}
      className={classes.value}
      data-state={look}
      data-reading={(ghost && reading) || undefined}
      data-editable={editable || undefined}
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      aria-label={editable ? `${field.label}: ${text}. Edit` : undefined}
      aria-hidden={ghost || undefined}
      style={{ '--reveal': `${settings.reveal}s`, '--rb': `${settings.revealBlur}px` } as CSSProperties}
      onClick={editable ? () => setEditing(true) : undefined}
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setEditing(true);
              }
            }
          : undefined
      }
    >
      {look === 'set' ? text : renderWords(text, 0)[0]}
    </div>
  );
}
