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
} from '@/lib/squad/types';
export {
  resolveClubSquad,
  resolveStartingXi,
  getSquadPlayerById,
} from '@/lib/squad/resolve-club-squad';
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

// Server I/O (listClubPlayers / loadClubStartingXi) — import from
// `@/lib/squad/get-players` or `@/lib/squad/load-starting-xi` (not this barrel).
