import { describe, expect, it } from 'vitest';

import {
  SEASON_GOAL_MET,
  SEASON_GOAL_MISSED,
  seasonGoalMet,
  settleSeasonGoal,
} from './season-goal';

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

describe('settleSeasonGoal', () => {
  it('pays once from the closed table', () => {
    expect(
      settleSeasonGoal({
        position: 6,
        rowCount: 12,
        endedSeason: 1,
        paidFor: null,
        note: null,
      }),
    ).toEqual({ bonus: 10_000, note: SEASON_GOAL_MET });
  });

  it('keeps a miss when the season was already closed', () => {
    expect(
      settleSeasonGoal({
        position: 1,
        rowCount: 12,
        endedSeason: 1,
        paidFor: 1,
        note: SEASON_GOAL_MISSED,
      }),
    ).toEqual({ bonus: 0, note: SEASON_GOAL_MISSED });
  });
});
