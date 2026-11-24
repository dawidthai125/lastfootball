import type { SeasonHistory } from '@/lib/board/season-history';
import { resolveLeagueTierLabel, applyLeagueTierOutcome } from '@/lib/league/league-tier';
import type { HumanAward } from '@/lib/league/human-awards';

export type TrophyKind = 'league' | 'cup' | 'cup_final' | 'promotion' | 'human';

export type TrophyDto = {
  readonly id: string;
  readonly kind: TrophyKind;
  readonly title: string;
  readonly detail: string;
};

/** Trophies of closed seasons, newest first. The running season is not in the history yet. */
export function resolveTrophies(input: {
  readonly history: readonly SeasonHistory[];
  readonly human: readonly {
    readonly league: number;
    readonly season: number;
    readonly award: HumanAward;
  }[];
}): readonly TrophyDto[] {
  const league: TrophyDto[] = [...input.history]
    .sort((a, b) => b.seasonNumber - a.seasonNumber)
    .flatMap((season) => {
      const when = `Sezon ${season.seasonNumber}`;
      const tier = resolveLeagueTierLabel(season.leagueTier);
      const out: TrophyDto[] = [];
      if (season.position === 1) {
        out.push({
          id: `league-${season.seasonNumber}`,
          kind: 'league',
          title: `Mistrzostwo: ${tier}`,
          detail: `${when} · ${season.points} pkt`,
        });
      }
      if (season.cupRoundReached >= 4) {
        const won = season.cupRoundReached === 5;
        out.push({
          id: `cup-${season.seasonNumber}`,
          kind: won ? 'cup' : 'cup_final',
          title: won ? 'Puchar Krajowy' : 'Finał Pucharu Krajowego',
          detail: when,
        });
      }
      if (season.outcome === 'promote') {
        const next = resolveLeagueTierLabel(applyLeagueTierOutcome(season.leagueTier, 'promote'));
        out.push({
          id: `promotion-${season.seasonNumber}`,
          kind: 'promotion',
          title: `Awans: ${next}`,
          detail: `${when} · ${season.position}. miejsce`,
        });
      }
      return out;
    });
  const human: TrophyDto[] = [...input.human]
    .filter((row) => row.award.place <= 3)
    .map(({ league, season, award }) => ({
      id: `human-${league}-${season}`,
      kind: 'human',
      title: award.place === 1 ? 'Mistrzostwo Ligi ludzi' : `Liga ludzi: ${award.place}. miejsce`,
      detail: `Liga ludzi ${league}, sezon ${season} · rozegrane ${award.played} z 22`,
    }));
  return [...league, ...human];
}
