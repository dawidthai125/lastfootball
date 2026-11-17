import { describe, expect, it } from 'vitest';

import { isPressLine, kickoffPressingWithLine, pressLineLabel } from './press-line';

describe('press line', () => {
  it('shifts kickoff pressing and clamps the label', () => {
    expect(kickoffPressingWithLine(0, 'mid')).toBe(50);
    expect(kickoffPressingWithLine(0, 'high')).toBe(54);
    expect(kickoffPressingWithLine(0, 'low')).toBe(46);
    expect(kickoffPressingWithLine(8, 'high')).toBe(70);
    expect(kickoffPressingWithLine(0, 'nope')).toBe(50);
    expect(pressLineLabel('low')).toBe('Niski blok');
    expect(isPressLine('mid')).toBe(true);
    expect(isPressLine('HIGH')).toBe(false);
  });
});
