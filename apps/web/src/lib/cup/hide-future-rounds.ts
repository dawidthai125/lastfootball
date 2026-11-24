import { CUP_ROUND_AFTER_LEAGUE } from '@/lib/cup/matchdays';
import type { CupRoundDto, CupSide, CupTieDto, NationalCupDto } from '@/lib/cup/types';

const TBD: CupSide = { kind: 'tbd' };

/**
 * What the manager may see today (D136). A round shows its results once it opens for him;
 * the pairs of the next one follow from them. Display only: the bracket itself stays complete.
 */
export function hideFutureRounds(cup: NationalCupDto): readonly CupRoundDto[] {
  const open = (round: number) =>
    cup.playedLeagueMatchdays >= CUP_ROUND_AFTER_LEAGUE[round as CupRoundDto['round']];

  return cup.rounds.map((round) => {
    if (open(round.round)) return round;
    const pairsKnown = round.round === 1 || open(round.round - 1);
    return {
      ...round,
      ties: round.ties.map((tie): CupTieDto => {
        if (tie.status === 'awaiting_player' && pairsKnown) return tie;
        return {
          ...tie,
          home: pairsKnown || tie.home.kind === 'path' ? tie.home : TBD,
          away: pairsKnown || tie.away.kind === 'path' ? tie.away : TBD,
          homeScore: null,
          awayScore: null,
          winnerId: null,
          status: 'blocked',
          decidedBy: null,
        };
      }),
    };
  });
}
