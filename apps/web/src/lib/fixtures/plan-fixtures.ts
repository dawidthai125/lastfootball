import {
  LEAGUE_FIXTURE_COUNT,
  LEAGUE_SINGLE_RR_COUNT,
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
 * Sole pure planner for league fixtures (LFE-LEAGUE-04).
 * Exactly LEAGUE_FIXTURE_COUNT (22) rows — double RR vs catalog AI.
 * MD1–11 identity matches LEAGUE-03 single RR (top-up / prod safe).
 * MD12–22 = return legs (!isHome, same opponent). Top-up must reuse this plan.
 */
export function planClubFixtures(clubId: string): readonly PlannedFixture[] {
  const n = LEAGUE_SINGLE_RR_COUNT;
  const opponents = pickOpponentsForClub(clubId, n);
  const homeFirst = (hashBit(clubId) & 1) === 0;

  const firstLeg: PlannedFixture[] = opponents.map((opp: OpponentClub, i) => ({
    matchday: i + 1,
    opponentClubId: opp.id,
    isHome: homeFirst ? i % 2 === 0 : i % 2 === 1,
    status: i === 0 ? ('upcoming' as const) : ('scheduled' as const),
  }));

  const returnLeg: PlannedFixture[] = firstLeg.map((leg, i) => ({
    matchday: n + i + 1,
    opponentClubId: leg.opponentClubId,
    isHome: !leg.isHome,
    status: 'scheduled' as const,
  }));

  const plan = [...firstLeg, ...returnLeg];
  if (plan.length !== LEAGUE_FIXTURE_COUNT) {
    throw new Error(`planClubFixtures: expected ${LEAGUE_FIXTURE_COUNT} rows, got ${plan.length}`);
  }
  return plan;
}

function hashBit(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h + id.charCodeAt(i) * (i + 1)) | 0;
  return h >>> 0;
}
