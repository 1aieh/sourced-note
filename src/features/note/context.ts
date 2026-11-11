import { createContext, useContext } from 'react';
import type { EncounterIndex } from './model/encounter';
import type { Encounter } from './model/types';
import type { NoteSettings } from './settings';

export type NoteContextValue = {
  encounter: Encounter;
  index: EncounterIndex;
  settings: NoteSettings;
  /** Prefers reduced motion: animations become fades. */
  reduce: boolean;
  /** One-column phone layout. */
  compact: boolean;
};

export const NoteContext = createContext<NoteContextValue | null>(null);

export function useNote(): NoteContextValue {
  const value = useContext(NoteContext);
  if (!value) throw new Error('useNote must be used inside <NoteWorkspace> or <NoteProvider>');
  return value;
}
