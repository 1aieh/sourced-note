import { act, fireEvent, render, screen } from '@testing-library/react';
import { HoldToSign } from './Signature';

describe('HoldToSign', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const setup = () => {
    const onDone = vi.fn();
    render(<HoldToSign seconds={1.2} onDone={onDone} reduce={false} />);
    return { onDone, button: screen.getByRole('button', { name: 'Press and hold to sign' }) };
  };

  it('takes focus so the keyboard can sign straight away', () => {
    const { button } = setup();
    expect(button).toHaveFocus();
  });

  it('signs after a full hold', () => {
    const { onDone, button } = setup();
    fireEvent.pointerDown(button);
    expect(button).toHaveAttribute('data-holding');
    act(() => vi.advanceTimersByTime(1200));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('does not sign when let go early', () => {
    const { onDone, button } = setup();
    fireEvent.pointerDown(button);
    act(() => vi.advanceTimersByTime(800));
    fireEvent.pointerUp(button);
    act(() => vi.advanceTimersByTime(1000));
    expect(onDone).not.toHaveBeenCalled();
    expect(button).not.toHaveAttribute('data-holding');
  });

  it('signs with a held Space key, ignoring key repeat', () => {
    const { onDone, button } = setup();
    fireEvent.keyDown(button, { key: ' ' });
    act(() => vi.advanceTimersByTime(600));
    fireEvent.keyDown(button, { key: ' ', repeat: true });
    act(() => vi.advanceTimersByTime(600));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
