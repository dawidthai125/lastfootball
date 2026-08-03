export type {
  PlayerRowDto,
  PlayerStatus,
  SquadDto,
  SquadPlayerDto,
  SortKey,
} from '@/lib/squad/types';
export {
  POSITION_FILTERS,
  STATUS_FILTERS,
  STATUS_LABEL,
  SquadUnavailableError,
  isActivePlayer,
  isSeniorPlayer,
  isAcademyProspect,
  filterSeniorPlayers,
} from '@/lib/squad/types';
export {
  resolveClubSquad,
  resolveStartingXi,
  getSquadPlayerById,
} from '@/lib/squad/resolve-club-squad';
export {
  validateStartingXi,
  applyXiSelection,
  sortXiPlayers,
  isGoalkeeper,
} from '@/lib/squad/validate-starting-xi';
export type { XiValidation } from '@/lib/squad/validate-starting-xi';
/** AI / tests / create generator — not for player-club runtime reads. */
export {
  seedClubRoster,
  seedStarterSquad,
  seedBotSquad,
  seedOpponentSquad,
} from '@/lib/squad/seed-roster';
export type { RosterPlayerSeed } from '@/lib/squad/seed-roster';
export { buildStarterPlayerInserts } from '@/lib/squad/build-player-inserts';
export { mapPlayerRow } from '@/lib/squad/map-player';
export {
  resolvePlayerPotential,
  resolvePotentialBand,
  potentialBandLabel,
  POTENTIAL_BAND_LABEL,
} from '@/lib/squad/potential';
export type { PotentialBandId } from '@/lib/squad/potential';
export { DEVELOPMENT_THIN } from '@/lib/squad/development-thin';
export {
  applyMatchDevelopmentEffects,
  summarizeMatchDevelopment,
} from '@/lib/squad/match-development';
export { applySeasonAgeEffects } from '@/lib/squad/season-age';
export type { SeasonAgePlayerSlice, SeasonAgeResultSlice } from '@/lib/squad/season-age';

// Server I/O (listClubPlayers / loadClubStartingXi) — import from
// `@/lib/squad/get-players` or `@/lib/squad/load-starting-xi` (not this barrel).
