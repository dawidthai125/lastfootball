import { cupRoundForMatchday, cupRoundLabel } from '@/lib/cup/matchdays';
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
 * Cup pay by round 1–4 on the IV rung (D136). A knocked-out club gets an appearance fee,
 * so the cup does not cost a full wage bill.
 */
const CUP_REWARD_WIN = [12_000, 14_000, 17_000, 30_000] as const;
const CUP_REWARD_LOSS = [4_000, 4_000, 4_000, 10_000] as const;

function resolveCupReward(input: {
  readonly matchday: number;
  readonly won: boolean;
  readonly leagueTier: string;
}): MatchRewardDto | null {
  const round = cupRoundForMatchday(input.matchday);
  if (!round) return null;
  const base = (input.won ? CUP_REWARD_WIN : CUP_REWARD_LOSS)[round - 1]!;
  const amount = rewardForLeagueRung(base, input.leagueTier);
  const label = input.won
    ? round === 4
      ? 'Puchar Krajowy: zwycięstwo w finale'
      : `Puchar Krajowy: awans, ${cupRoundLabel(round)}`
    : `Puchar Krajowy: udział, ${cupRoundLabel(round)}`;
  return {
    amount,
    label,
    outcome: input.won ? 'win' : 'loss',
    line: `+${formatMoney(amount)} · ${label}`,
  };
}

/**
 * What a played fixture pays. Human league stays on the IV rung it is seeded with.
 * The cup pays by round, a challenge pays nothing.
 */
export function resolveFixtureReward(input: {
  readonly competition: FixtureDto['competition'];
  readonly matchday: number;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly isHome: boolean;
  readonly leagueTier: string;
}): MatchRewardDto | null {
  if (input.competition === 'cup') {
    const ours = input.isHome ? input.homeScore : input.awayScore;
    const theirs = input.isHome ? input.awayScore : input.homeScore;
    return resolveCupReward({
      matchday: input.matchday,
      won: ours > theirs,
      leagueTier: input.leagueTier,
    });
  }
  if (input.competition !== 'league' && input.competition !== 'human') return null;
  return resolveLeagueMatchReward({
    homeScore: input.homeScore,
    awayScore: input.awayScore,
    isHome: input.isHome,
    leagueTier: input.competition === 'league' ? input.leagueTier : 'iv',
  });
}
