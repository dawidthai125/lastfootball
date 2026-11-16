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

/** Closed seasons stay closed. A retry must not recompute the bonus. */
export function settleSeasonGoal(input: {
  readonly position: number | null;
  readonly rowCount: number;
  readonly endedSeason: number;
  readonly paidFor: number | null;
  readonly note: string | null;
}): { readonly bonus: number; readonly note: string } {
  if (input.paidFor === input.endedSeason) {
    return {
      bonus: 0,
      note: input.note === SEASON_GOAL_MET ? SEASON_GOAL_MET : SEASON_GOAL_MISSED,
    };
  }
  const met = input.position != null && seasonGoalMet(input.position, input.rowCount);
  return {
    bonus: met ? SEASON_GOAL_BONUS : 0,
    note: met ? SEASON_GOAL_MET : SEASON_GOAL_MISSED,
  };
}
