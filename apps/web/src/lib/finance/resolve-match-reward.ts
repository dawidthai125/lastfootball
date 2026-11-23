import { formatMoney } from '@/lib/finance/format-money';
import type { FixtureDto } from '@/lib/fixtures/types';
import { rewardForLeagueRung } from '@/lib/sponsors/crowd';
import { ECONOMY_THIN, type MatchRewardDto, type MatchRewardOutcome } from '@/lib/finance/types';

/**
 * Pure league match reward (player perspective) — LFE-ECONOMY-01 Thin.
 * No tier means the IV-league rung.
 */
export function resolveLeagueMatchReward(input: {
  readonly homeScore: number;
  readonly awayScore: number;
  readonly isHome: boolean;
  readonly leagueTier?: string;
}): MatchRewardDto {
  const us = input.isHome ? input.homeScore : input.awayScore;
  const them = input.isHome ? input.awayScore : input.homeScore;

  let outcome: MatchRewardOutcome;
  let base: number;
  let label: string;

  if (us > them) {
    outcome = 'win';
    base = ECONOMY_THIN.REWARD_WIN;
    label = 'Nagroda za zwycięstwo';
  } else if (us < them) {
    outcome = 'loss';
    base = ECONOMY_THIN.REWARD_LOSS;
    label = 'Nagroda za porażkę';
  } else {
    outcome = 'draw';
    base = ECONOMY_THIN.REWARD_DRAW;
    label = 'Nagroda za remis';
  }

  const amount = rewardForLeagueRung(base, input.leagueTier ?? 'iv');
  return {
    amount,
    label,
    outcome,
    line: `+${formatMoney(amount)} · ${label}`,
  };
}

/**
 * What a played fixture pays. Human league stays on the IV rung it is seeded with.
 * Cup and challenge pay nothing.
 */
export function resolveFixtureReward(input: {
  readonly competition: FixtureDto['competition'];
  readonly homeScore: number;
  readonly awayScore: number;
  readonly isHome: boolean;
  readonly leagueTier: string;
}): MatchRewardDto | null {
  if (input.competition !== 'league' && input.competition !== 'human') return null;
  return resolveLeagueMatchReward({
    homeScore: input.homeScore,
    awayScore: input.awayScore,
    isHome: input.isHome,
    leagueTier: input.competition === 'league' ? input.leagueTier : 'iv',
  });
}
