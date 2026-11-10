import type { CupRoundIndex } from '@/lib/cup/types';

/** Cup rows use 101–104 so they never share a matchday with the 22 league fixtures. */
export const CUP_MATCHDAY_BASE = 100 as const;

/** League matches that must be played before each cup round (GDD §11.8). */
export const CUP_ROUND_AFTER_LEAGUE: Record<CupRoundIndex, number> = {
  1: 8,
  2: 12,
  3: 16,
  4: 20,
};

const ROUND_LABEL: Record<CupRoundIndex, string> = {
  1: '1/8 finału',
  2: '1/4 finału',
  3: 'Półfinał',
  4: 'Finał',
};

export function cupMatchdayForRound(round: CupRoundIndex): number {
  return CUP_MATCHDAY_BASE + round;
}

export function cupRoundForMatchday(matchday: number): CupRoundIndex | null {
  const round = matchday - CUP_MATCHDAY_BASE;
  if (round === 1 || round === 2 || round === 3 || round === 4) return round;
  return null;
}

export function cupRoundLabel(round: CupRoundIndex): string {
  return ROUND_LABEL[round];
}
