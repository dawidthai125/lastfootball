/** One season goal: finish in the top half of the league table. */

export const SEASON_GOAL_BONUS = 10_000;

export const SEASON_GOAL_LABEL = 'Cel sezonu: górna połowa tabeli.';

export const SEASON_GOAL_MET = 'Cel sezonu zaliczony. 10 000 EUR.';

export const SEASON_GOAL_MISSED = 'Cel sezonu niezaliczony.';

/** Position 1 is the top. A missing table does not pay. */
export function seasonGoalMet(position: number, rowCount: number): boolean {
  if (!Number.isFinite(position) || !Number.isFinite(rowCount)) return false;
  const place = Math.trunc(position);
  const rows = Math.trunc(rowCount);
  if (place < 1 || rows < 1) return false;
  return place <= Math.ceil(rows / 2);
}
