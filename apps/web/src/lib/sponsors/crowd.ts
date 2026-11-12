import { ECONOMY_THIN } from '@/lib/finance/types';

/**
 * Crowd and league-rung quote for a sponsor.
 * Separate from the top_half goal — this does not replace or retire it.
 */

export type LeagueRung = 'iv' | 'iii' | 'ii' | 'i';

type AttendanceBand = 'quiet' | 'steady' | 'lively' | 'unknown';

const LEAGUE_RUNG_MULT: Record<LeagueRung, number> = {
  iv: 1,
  iii: 1.15,
  ii: 1.35,
  i: 1.6,
};

const CROWD_MULT: Record<AttendanceBand, number> = {
  quiet: 0.85,
  steady: 1,
  lively: 1.25,
  unknown: 1,
};

function roundTo500(amount: number): number {
  return Math.round(amount / 500) * 500;
}

function rungMultiplier(tier: string): number | null {
  if (tier === 'iv' || tier === 'iii' || tier === 'ii' || tier === 'i') {
    return LEAGUE_RUNG_MULT[tier];
  }
  return null;
}

function crowdMultiplier(attendance: string): number | null {
  if (
    attendance === 'quiet' ||
    attendance === 'steady' ||
    attendance === 'lively' ||
    attendance === 'unknown'
  ) {
    return CROWD_MULT[attendance];
  }
  return null;
}

export function sponsorFromCrowd(input: {
  readonly attendance: AttendanceBand;
  readonly leagueTier: LeagueRung;
}): { readonly base: number; readonly bonus: number } {
  const tierMult = rungMultiplier(input.leagueTier);
  const crowdMult = crowdMultiplier(input.attendance);
  // One bad factor drops the whole quote to iv + steady. Do not throw.
  const tier = tierMult == null || crowdMult == null ? 1 : tierMult;
  const crowd = tierMult == null || crowdMult == null ? 1 : crowdMult;
  return {
    base: roundTo500(ECONOMY_THIN.SPONSOR_BASE * tier * crowd),
    bonus: roundTo500(ECONOMY_THIN.SPONSOR_BONUS * tier * crowd),
  };
}
