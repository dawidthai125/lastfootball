export type {
  ClubSeasonPhase,
  SeasonReportDto,
  SeasonReportHighlight,
  SeasonResultZone,
} from '@/lib/season/types';
export { formatSeasonLabel, isSeasonCompleteTrigger } from '@/lib/season/types';
export {
  SEASON_GOAL_LABEL,
  resolveSeasonGoalProgressLine,
  seasonGoalMet,
} from '@/lib/season/season-goal';
export { resolveSeasonReport } from '@/lib/season/resolve-season-report';
export { closeSeasonIfComplete } from '@/lib/season/close-season';
export { confirmStartNextSeason } from '@/lib/season/confirm-start-next-season';
export {
  formatRetirementFarewell,
  planSeasonDeparture,
  resolveDeparturePreview,
  contractLeavers,
  resolveRetirementFarewell,
  type DeparturePlan,
  type DeparturePlayer,
  type DeparturePreview,
  type DeparturePreviewPlayer,
  type DeparturePreviewSlot,
  type RetirementFarewell,
  type RetirementFarewellPlayer,
} from '@/lib/season/departure';
export { listClubRetirementFlash } from '@/lib/season/list-retirement-flash';
export {
  CONFIRM_START_NEXT_SEASON_INITIAL,
  type ConfirmStartNextSeasonState,
} from '@/lib/season/action-types';
