import { describe, expect, it } from 'vitest';

import { seasonGoalMet } from './season-goal';

describe('seasonGoalMet', () => {
  it('pays the top half, including the middle place on an even table', () => {
    expect(seasonGoalMet(6, 12)).toBe(true);
    expect(seasonGoalMet(7, 12)).toBe(false);
  });

  it('pays the middle place on an odd table', () => {
    expect(seasonGoalMet(5, 9)).toBe(true);
    expect(seasonGoalMet(6, 9)).toBe(false);
  });

  it('does not pay a missing place', () => {
    expect(seasonGoalMet(0, 12)).toBe(false);
    expect(seasonGoalMet(1, 0)).toBe(false);
  });
});
