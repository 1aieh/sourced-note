import { demoEncounter } from '../data/demoEncounter';
import {
  fieldForSpan,
  formatClock,
  indexEncounter,
  settledSources,
  spanTimes,
  toSeconds,
  validateEncounter,
} from './encounter';
import { statusLabel, statusTone } from './status';

describe('demo encounter', () => {
  it('has no broken references', () => {
    expect(validateEncounter(demoEncounter)).toEqual([]);
  });

  it('reports a field that cites a missing span', () => {
    const broken = {
      ...demoEncounter,
      fields: [{ id: 'x', label: 'X', kind: 'cited' as const, draft: 'x', sources: ['nope'] }],
    };
    expect(validateEncounter(broken)).toEqual(['x cites missing span nope']);
  });

  it('keeps transcript times in order', () => {
    const times = demoEncounter.transcript.map((t) => toSeconds(t.time));
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(times.at(-1)).toBeLessThan(demoEncounter.visit.length);
  });
});

describe('encounter helpers', () => {
  const index = indexEncounter(demoEncounter);

  it('indexes spans to their text and turn', () => {
    expect(index.spanText['s-level']).toBe('Yes, left, below the knee.');
    expect(index.spanTurn['s-level']?.time).toBe('00:24');
  });

  it('finds the field that cites a span', () => {
    expect(fieldForSpan(demoEncounter.fields, 's-weight')).toBe('history');
    expect(fieldForSpan(demoEncounter.fields, 'missing')).toBeNull();
  });

  it('lists distinct source times', () => {
    expect(spanTimes(index, ['s-diabetes', 's-weight'])).toEqual(['01:12']);
    expect(spanTimes(index, ['s-walk', 's-gait'])).toEqual(['00:51', '01:26']);
  });

  it('cites only the chosen side of a resolved conflict', () => {
    const date = index.fieldById.date!;
    expect(settledSources(date, { value: 'March 2021', status: 'decided', choice: 'mar-2021' })).toEqual([
      's-date-referral',
    ]);
    expect(settledSources(date, { value: '', status: 'needs' })).toEqual(date.sources);
  });

  it('formats times', () => {
    expect(toSeconds('01:34')).toBe(94);
    expect(formatClock(new Date(2026, 10, 8, 9, 5))).toBe('09:05');
  });
});

describe('status pill', () => {
  const rec = { started: true, paused: false };
  it('says where the visit stands', () => {
    expect(statusLabel('recording', 0, false, { started: false, paused: false })).toBe('Not started');
    expect(statusLabel('recording', 0, false, rec)).toBe('Recording');
    expect(statusLabel('review', 2, false, rec)).toBe('2 to answer');
    expect(statusLabel('review', 0, false, rec)).toBe('Ready to sign');
    expect(statusLabel('filed', 0, true, rec)).toBe('Signed');
  });

  it('colours by what needs doing', () => {
    expect(statusTone('recording', 0, false, { started: true, paused: true })).toBe('idle');
    expect(statusTone('review', 1, false, rec)).toBe('needs');
    expect(statusTone('review', 0, false, rec)).toBe('ready');
    expect(statusTone('note', 0, true, rec)).toBe('done');
  });
});
