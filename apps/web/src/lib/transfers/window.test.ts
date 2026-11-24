import { describe, expect, it } from 'vitest';

import { closedWindowSentence, isTransferWindowOpen, windowClosesSentence } from './window';

const open = (played: number, season = 1, offseason = false) =>
  isTransferWindowOpen({ played, season, offseason });

describe('transfer windows (D152)', () => {
  it('opens, closes and opens again in one season', () => {
    const days = Array.from({ length: 23 }, (_, n) => (open(n) ? 'o' : '-')).join('');
    expect(days).toBe('--oooooo---ooooo------o');
  });

  it('a later season starts with an open window', () => {
    expect(open(0, 2)).toBe(true);
    expect(open(8, 2)).toBe(false);
  });

  it('is open in the break', () => {
    expect(open(22, 1, true)).toBe(true);
    expect(open(0, 3, true)).toBe(true);
  });

  it('says when it opens and closes', () => {
    expect(closedWindowSentence(9)).toContain('po 11. meczu');
    expect(closedWindowSentence(22 + 9)).toContain('masz 9');
    expect(closedWindowSentence(17)).toContain('po ostatnim meczu');
    expect(windowClosesSentence(3, false)).toContain('po 8. meczu');
    expect(windowClosesSentence(22 + 12, false)).toContain('po 16. meczu');
    expect(windowClosesSentence(22, true)).toBeNull();
  });
});
