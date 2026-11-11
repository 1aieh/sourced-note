import { render } from '@testing-library/react';
import { demoEncounter } from '../../data/demoEncounter';
import { renderWords, splitWords, wordCount } from './words';

describe('words', () => {
  it('keeps the spaces between words', () => {
    expect(splitWords('Walk  the dog')).toEqual(['Walk', '  ', 'the', ' ', 'dog']);
  });

  it('counts words across segments', () => {
    expect(wordCount(demoEncounter.transcript[3]!)).toBe(14);
  });

  it('numbers each word from the given start', () => {
    const [nodes, next] = renderWords('Socket loosens daily', 4);
    expect(next).toBe(7);
    const { container } = render(<p>{nodes}</p>);
    const words = container.querySelectorAll('[data-word]');
    expect(words).toHaveLength(3);
    expect((words[2] as HTMLElement).style.getPropertyValue('--i')).toBe('6');
    expect(container.textContent).toBe('Socket loosens daily');
  });
});
