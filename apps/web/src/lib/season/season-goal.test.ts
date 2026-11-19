import { describe, expect, it } from 'vitest';

import {
  SEASON_GOAL_LABEL,
  SEASON_GOAL_MET,
  SEASON_GOAL_MISSED,
  resolveSeasonGoalProgressLine,
  seasonGoalMet,
  settleSeasonGoal,
} from './season-goal';

describe('resolveSeasonGoalProgressLine', () => {
  it('keeps the label only before the first league match', () => {
    expect(resolveSeasonGoalProgressLine({ position: 10, tableSize: 12, playedCount: 0 })).toBe(
      SEASON_GOAL_LABEL,
    );
  });

  it('tracks Probny-shaped mid-season places', () => {
    expect(resolveSeasonGoalProgressLine({ position: 10, tableSize: 12, playedCount: 1 })).toBe(
      `${SEASON_GOAL_LABEL} Poniżej celu · 10. miejsce / 12.`,
    );
    expect(resolveSeasonGoalProgressLine({ position: 5, tableSize: 12, playedCount: 1 })).toBe(
      `${SEASON_GOAL_LABEL} W górnej połowie · 5. miejsce / 12.`,
    );
  });
});

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
