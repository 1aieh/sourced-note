/**
 * Sourced note: the product feature. Everything a host app needs is exported
 * here; nothing in this folder imports from the showcase.
 */
export { NoteWorkspace } from './components/NoteWorkspace';
export type { NoteWorkspaceProps, StartAt } from './components/NoteWorkspace';
export { NoteProvider } from './NoteProvider';
export { demoEncounter } from './data/demoEncounter';
export { defaultSettings } from './settings';
export type { NoteSettings } from './settings';
export { validateEncounter } from './model/encounter';
export type * from './model/types';
export type { StatusTone } from './model/status';

/** The note's building blocks, for a design system sheet or documentation. */
export * as NoteParts from './parts';
