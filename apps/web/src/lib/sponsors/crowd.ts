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

/** Prestige of a new IV-league club, where the sponsor pays the plain quote. */
export const PRESTIGE_START = 10;
const PRESTIGE_SPONSOR_MAX = 0.1;

/** Prestige part of the renewal quote: 0 up to the starter value, 0.10 at 100. */
export function prestigeSponsorShare(prestige: number): number {
  const step = (prestige - PRESTIGE_START) / (100 - PRESTIGE_START);
  return PRESTIGE_SPONSOR_MAX * Math.min(1, Math.max(0, Number.isFinite(step) ? step : 0));
}

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

/** Match reward at the club's rung, whole 500 EUR. An unknown rung pays the IV-league amount. */
export function rewardForLeagueRung(amount: number, tier: string): number {
  const step = (rungMultiplier(tier) ?? 1) - 1;
  return roundTo500(amount * (1 + step * ECONOMY_THIN.REWARD_RUNG_SHARE));
}

export function sponsorFromCrowd(input: {
  readonly attendance: AttendanceBand;
  readonly leagueTier: LeagueRung;
  /** 0..100. Absent means no prestige effect. */
  readonly prestige?: number | null;
}): { readonly base: number; readonly bonus: number } {
  const tierMult = rungMultiplier(input.leagueTier);
  const crowdMult = crowdMultiplier(input.attendance);
  // One bad crowd or rung factor drops the whole quote to iv + steady. Do not throw.
  const tier = tierMult == null || crowdMult == null ? 1 : tierMult;
  const crowd = tierMult == null || crowdMult == null ? 1 : crowdMult;
  const prestige = 1 + prestigeSponsorShare(input.prestige ?? PRESTIGE_START);
  return {
    base: roundTo500(ECONOMY_THIN.SPONSOR_BASE * tier * crowd * prestige),
    bonus: roundTo500(ECONOMY_THIN.SPONSOR_BONUS * tier * crowd * prestige),
  };
}
