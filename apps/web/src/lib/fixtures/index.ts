export type { FixtureDto, FixtureStatus, FixtureRow } from '@/lib/fixtures/types';
export { mapFixtureRow } from '@/lib/fixtures/map-fixture';
export {
  OPPONENT_CATALOG,
  LEAGUE_FIXTURE_COUNT,
  getOpponentById,
  requireOpponent,
  pickOpponentsForClub,
} from '@/lib/fixtures/opponent-catalog';
export { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
export {
  listClubFixtures,
  getFixtureByIdForClub,
  getNextFixture,
  getLastPlayedFixture,
} from '@/lib/fixtures/get-fixture';
export { ensureClubFixtures } from '@/lib/fixtures/ensure-club-fixtures';
export { completeFixture } from '@/lib/fixtures/complete-fixture';
export { COMPLETE_FIXTURE_INITIAL } from '@/lib/fixtures/action-types';
export type { CompleteFixtureState } from '@/lib/fixtures/action-types';
export {
  toUiFixture,
  buildLeaguePreMatchBundle,
  buildLeagueLiveBundle,
} from '@/lib/fixtures/to-ui-fixture';
export { createSessionFromLeagueFixture } from '@/lib/fixtures/create-session';
