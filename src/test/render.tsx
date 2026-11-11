import type { ReactElement, ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import { NoteProvider } from '@/features/note/NoteProvider';
import { demoEncounter } from '@/features/note/data/demoEncounter';
import { theme } from '@/app/theme';

/** Renders inside the same providers the app uses, with the demo encounter. */
export function renderWithNote(ui: ReactElement) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MantineProvider theme={theme}>
      <NoteProvider encounter={demoEncounter}>{children}</NoteProvider>
    </MantineProvider>
  );
  return render(ui, { wrapper });
}
