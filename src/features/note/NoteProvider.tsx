import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import { NoteContext } from './context';
import { indexEncounter } from './model/encounter';
import type { Encounter } from './model/types';
import type { NoteSettings } from './settings';
import { defaultSettings } from './settings';

/** Provides an encounter to the note's parts. The workspace uses it, and so does the design system sheet. */
export function NoteProvider({
  encounter,
  settings = defaultSettings,
  compact = false,
  children,
}: {
  encounter: Encounter;
  settings?: NoteSettings;
  compact?: boolean;
  children: ReactNode;
}) {
  const reduce = useReducedMotion() ?? false;
  const index = useMemo(() => indexEncounter(encounter), [encounter]);
  const value = useMemo(
    () => ({ encounter, index, settings, reduce, compact }),
    [encounter, index, settings, reduce, compact],
  );
  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}
