import {
  LEAGUE_FIXTURE_COUNT,
  pickOpponentsForClub,
  type OpponentClub,
} from '@/lib/fixtures/opponent-catalog';

export type PlannedFixture = {
  readonly matchday: number;
  readonly opponentClubId: string;
  readonly isHome: boolean;
  readonly status: 'upcoming' | 'scheduled';
};

/**
 * Pure plan for Thin A: exactly LEAGUE_FIXTURE_COUNT fixtures.
 * Matchday 1 = upcoming; rest = scheduled. Home/away alternates from club hash.
 */
export function planClubFixtures(clubId: string): readonly PlannedFixture[] {
  const opponents = pickOpponentsForClub(clubId, LEAGUE_FIXTURE_COUNT);
  const homeFirst = (hashBit(clubId) & 1) === 0;
  return opponents.map((opp: OpponentClub, i) => ({
    matchday: i + 1,
    opponentClubId: opp.id,
    isHome: homeFirst ? i % 2 === 0 : i % 2 === 1,
    status: i === 0 ? ('upcoming' as const) : ('scheduled' as const),
  }));
}

function hashBit(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h + id.charCodeAt(i) * (i + 1)) | 0;
  return h >>> 0;
}
