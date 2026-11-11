import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithNote } from '@/test/render';
import { demoEncounter } from '../../data/demoEncounter';
import { Question } from './Question';

const field = (id: string) => demoEncounter.fields.find((f) => f.id === id)!;

function setup(id: string, props: Partial<Parameters<typeof Question>[0]> = {}) {
  const onChoose = vi.fn();
  const onActivate = vi.fn();
  renderWithNote(
    <Question
      field={field(id)}
      current
      pulse={0}
      disabled={false}
      onActivate={onActivate}
      onChoose={onChoose}
      onSource={vi.fn()}
      {...props}
    />,
  );
  return { onChoose, onActivate };
}

describe('Question', () => {
  it('answers with a click on an option', async () => {
    const { onChoose } = setup('date');
    await userEvent.click(screen.getByRole('button', { name: /March 2021/ }));
    expect(onChoose).toHaveBeenCalledWith('mar-2021', 'March 2021');
  });

  it('answers with the number key of an option', () => {
    const { onChoose } = setup('k');
    fireEvent.keyDown(window, { key: '3' });
    expect(onChoose).toHaveBeenCalledWith('K3', 'K3');
  });

  it('ignores number keys while disabled, or out of range', () => {
    const { onChoose } = setup('k', { disabled: true });
    fireEvent.keyDown(window, { key: '1' });
    fireEvent.keyDown(window, { key: '9' });
    expect(onChoose).not.toHaveBeenCalled();
  });

  it('uses the option value when it differs from the label', async () => {
    const { onChoose } = setup('pain');
    await userEvent.click(screen.getByRole('button', { name: /Not assessed at this visit/ }));
    expect(onChoose).toHaveBeenCalledWith('not-assessed', 'Not assessed');
  });

  it('takes a typed value, and saves only when there is text', async () => {
    const { onChoose } = setup('pain');
    await userEvent.click(screen.getByRole('button', { name: /Type a value/ }));
    const input = await screen.findByRole('textbox');
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    await userEvent.type(input, '  3 of 10 by evening  {Enter}');
    expect(onChoose).toHaveBeenCalledWith('typed', '3 of 10 by evening');
  });

  it('collapses to a one-line row when not in focus', async () => {
    const { onActivate } = setup('date', { current: false });
    await userEvent.click(screen.getByRole('button', { name: /Which amputation date/ }));
    expect(onActivate).toHaveBeenCalled();
  });
});
