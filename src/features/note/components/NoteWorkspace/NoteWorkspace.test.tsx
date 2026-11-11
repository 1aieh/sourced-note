import { MantineProvider } from '@mantine/core';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { theme } from '@/app/theme';
import { demoEncounter } from '../../data/demoEncounter';
import { NoteWorkspace } from './NoteWorkspace';

const renderWorkspace = (props: Partial<Parameters<typeof NoteWorkspace>[0]> = {}) =>
  render(
    <MantineProvider theme={theme}>
      <NoteWorkspace encounter={demoEncounter} {...props} />
    </MantineProvider>,
  );

describe('NoteWorkspace', () => {
  it('says the AI is simulated', () => {
    renderWorkspace({ startAt: 'review' });
    expect(screen.getAllByText(/simulated AI/i).length).toBeGreaterThan(0);
  });

  it('asks the open questions one at a time until the note can be signed', async () => {
    renderWorkspace({ startAt: 'review' });
    expect(screen.getAllByText('3 to answer').length).toBeGreaterThan(0);

    const answer = async (question: RegExp, option: RegExp) => {
      const heading = await screen.findByRole('heading', { name: question });
      const card = heading.closest('[data-question]') as HTMLElement;
      await userEvent.click(within(card).getByRole('button', { name: option }));
    };
    await answer(/Which amputation date/, /March 2021/);
    await answer(/pain at rest/, /Not assessed at this visit/);
    await answer(/Which functional level/, /^3\s*K3/);

    expect(await screen.findAllByText('Ready to sign')).not.toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Press and hold to sign' })).toBeInTheDocument();
  });

  it('signs with a full hold and reports the time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 8, 14, 2));
    const onSigned = vi.fn();
    renderWorkspace({ startAt: 'ready', onSigned });
    const hold = screen.getByRole('button', { name: 'Press and hold to sign' });
    fireEvent.pointerDown(hold);
    act(() => vi.advanceTimersByTime(5000));
    expect(onSigned).toHaveBeenCalledWith('14:02');
    vi.useRealTimers();
  });
});
