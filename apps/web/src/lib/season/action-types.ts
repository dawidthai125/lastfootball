import type { RetirementFarewell } from '@/lib/season/departure';

export type ConfirmStartNextSeasonState = {
  readonly error: string | null;
  /** Post–Confirm Thin farewell when someone departed this transition. */
  readonly farewell: RetirementFarewell | null;
};

export const CONFIRM_START_NEXT_SEASON_INITIAL: ConfirmStartNextSeasonState = {
  error: null,
  farewell: null,
};
