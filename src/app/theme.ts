import type { CSSVariablesResolver, MantineColorsTuple } from '@mantine/core';
import { createTheme } from '@mantine/core';

/** Indigo, built around the accent (#3450D1 at shade 6). */
const accent: MantineColorsTuple = [
  '#eef1fd',
  '#dde3fb',
  '#b8c4f5',
  '#8fa1ee',
  '#6d84e7',
  '#566fe2',
  '#3450d1',
  '#2a42b3',
  '#223796',
  '#1a2b78',
];

export const theme = createTheme({
  fontFamily: '"Geist Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  fontFamilyMonospace: '"Geist Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace',
  headings: { fontFamily: '"Geist Variable", ui-sans-serif, system-ui, sans-serif', fontWeight: '600' },
  colors: { accent },
  primaryColor: 'accent',
  primaryShade: { light: 6, dark: 3 },
  defaultRadius: 'md',
  cursorType: 'pointer',
  focusRing: 'never',
});

/**
 * The product's design tokens, as Mantine CSS variables. Mantine writes the
 * light or dark set for the active colour scheme, so components read one
 * name (`--sn-ink`) and never branch on the theme themselves.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    '--sn-font': 'var(--mantine-font-family)',
    '--sn-mono': 'var(--mantine-font-family-monospace)',
    '--sn-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
    '--sn-ease-in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
    '--sn-ease-drawer': 'cubic-bezier(0.32, 0.72, 0, 1)',
    '--sn-brand-linkedin': '#0a66c2',
  },
  light: {
    '--sn-bg': '#f2f3f5',
    '--sn-surface': '#ffffff',
    '--sn-paper': '#ffffff',
    '--sn-ink': '#14171c',
    '--sn-ink-2': '#4b515c',
    '--sn-ink-3': '#858b96',
    '--sn-ink-4': '#b9bdc5',
    '--sn-line': 'rgb(20 24 32 / 0.09)',
    '--sn-rule': 'rgb(20 24 32 / 0.1)',
    '--sn-hover': 'rgb(20 24 32 / 0.04)',
    '--sn-accent': '#3450d1',
    '--sn-on-accent': '#ffffff',
    '--sn-needs': '#d1431f',
    '--sn-needs-soft': 'rgb(209 67 31 / 0.06)',
    '--sn-ok': '#1f8a53',
    '--sn-rec': '#e5484d',
    '--sn-skel': 'rgb(20 24 32 / 0.06)',
    '--sn-skel-hi': 'rgb(20 24 32 / 0.11)',
    '--sn-scrim': 'rgb(12 14 18 / 0.32)',
    '--sn-shadow-card':
      '0 0 0 1px rgb(20 24 32 / 0.06), 0 1px 2px rgb(20 24 32 / 0.04), 0 8px 24px -10px rgb(20 24 32 / 0.1)',
    '--sn-shadow-paper':
      '0 0 0 1px rgb(20 24 32 / 0.05), 0 1px 1px rgb(20 24 32 / 0.04), 0 3px 6px -2px rgb(20 24 32 / 0.05), 0 22px 44px -18px rgb(20 24 32 / 0.18)',
    '--sn-shadow-pop': '0 0 0 1px rgb(20 24 32 / 0.06), 0 16px 48px -12px rgb(20 24 32 / 0.25)',
    '--sn-brand-linkedin': '#0a66c2',
  },
  dark: {
    '--sn-bg': '#0c0e11',
    '--sn-surface': '#16191e',
    '--sn-paper': '#191c21',
    '--sn-ink': '#eceef2',
    '--sn-ink-2': '#aab0bb',
    '--sn-ink-3': '#737a86',
    '--sn-ink-4': '#4a505a',
    '--sn-line': 'rgb(255 255 255 / 0.08)',
    '--sn-rule': 'rgb(255 255 255 / 0.09)',
    '--sn-hover': 'rgb(255 255 255 / 0.05)',
    '--sn-accent': '#8a9dff',
    '--sn-on-accent': '#0c0e11',
    '--sn-needs': '#ff7a55',
    '--sn-needs-soft': 'rgb(255 122 85 / 0.08)',
    '--sn-ok': '#4cc38a',
    '--sn-rec': '#ff6369',
    '--sn-skel': 'rgb(255 255 255 / 0.06)',
    '--sn-skel-hi': 'rgb(255 255 255 / 0.12)',
    '--sn-scrim': 'rgb(0 0 0 / 0.55)',
    '--sn-shadow-card': '0 0 0 1px rgb(255 255 255 / 0.06), 0 8px 24px -10px rgb(0 0 0 / 0.5)',
    '--sn-shadow-paper': '0 0 0 1px rgb(255 255 255 / 0.07), 0 22px 44px -18px rgb(0 0 0 / 0.7)',
    '--sn-shadow-pop': '0 0 0 1px rgb(255 255 255 / 0.08), 0 16px 48px -12px rgb(0 0 0 / 0.7)',
    '--sn-brand-linkedin': '#4c9aea',
  },
});
