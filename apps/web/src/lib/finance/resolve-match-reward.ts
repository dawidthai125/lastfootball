import { formatMoney } from '@/lib/finance/format-money';
import { ECONOMY_THIN, type MatchRewardDto, type MatchRewardOutcome } from '@/lib/finance/types';

/**
 * Pure league match reward (player perspective) — LFE-ECONOMY-01 Thin.
 */
export function resolveLeagueMatchReward(input: {
  readonly homeScore: number;
  readonly awayScore: number;
  readonly isHome: boolean;
}): MatchRewardDto {
  const us = input.isHome ? input.homeScore : input.awayScore;
  const them = input.isHome ? input.awayScore : input.homeScore;

  let outcome: MatchRewardOutcome;
  let amount: number;
  let label: string;

  if (us > them) {
    outcome = 'win';
    amount = ECONOMY_THIN.REWARD_WIN;
    label = 'Nagroda za zwycięstwo';
  } else if (us < them) {
    outcome = 'loss';
    amount = ECONOMY_THIN.REWARD_LOSS;
    label = 'Nagroda za porażkę';
  } else {
    outcome = 'draw';
    amount = ECONOMY_THIN.REWARD_DRAW;
    label = 'Nagroda za remis';
  }

  return {
    amount,
    label,
    outcome,
    line: `+${formatMoney(amount)} · ${label}`,
  };
}
