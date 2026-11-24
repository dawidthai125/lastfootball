import { parseLeagueTier, type LeagueTier } from '@/lib/league/league-tier';

/** Ranking of players (D152): points of the last 30 days, all clubs led by people. */
export const PLAYER_RANKING_DAYS = 30;
export const PLAYER_RANKING_SIZE = 100;

export type RankingInputRow = {
  readonly club_id: string;
  readonly name: string;
  readonly short_name: string;
  readonly league_tier: string;
  readonly competition: string;
  readonly match_tier: string;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goals_for: number;
  readonly goals_against: number;
};

export type PlayerRankingRow = {
  readonly position: number;
  readonly clubId: string;
  readonly name: string;
  readonly shortName: string;
  readonly leagueTier: LeagueTier;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalDiff: number;
  readonly points: number;
};

/** A higher league is harder, so its points weigh more. */
const TIER_WEIGHT: Readonly<Record<LeagueTier, number>> = { iv: 1, iii: 1.25, ii: 1.5, i: 2 };

/** Win / draw. A match against another person counts most. Friendlies count nothing. */
const COMPETITION_POINTS: Readonly<Record<string, readonly [number, number]>> = {
  league: [3, 1],
  cup: [4, 0],
  human: [6, 2],
};

export function rankingPoints(row: RankingInputRow): number {
  const base = COMPETITION_POINTS[row.competition];
  if (!base) return 0;
  const weight = row.competition === 'league' ? TIER_WEIGHT[parseLeagueTier(row.match_tier)] : 1;
  return (row.won * base[0] + row.drawn * base[1]) * weight;
}

/** Points, then goal difference, then name. Equal points and goals share no place. */
export function resolvePlayerRanking(rows: readonly RankingInputRow[]): PlayerRankingRow[] {
  const byClub = new Map<string, Omit<PlayerRankingRow, 'position'>>();
  for (const row of rows) {
    if (!COMPETITION_POINTS[row.competition]) continue;
    const old = byClub.get(row.club_id);
    byClub.set(row.club_id, {
      clubId: row.club_id,
      name: row.name,
      shortName: row.short_name,
      leagueTier: parseLeagueTier(row.league_tier),
      played: (old?.played ?? 0) + row.won + row.drawn + row.lost,
      won: (old?.won ?? 0) + row.won,
      drawn: (old?.drawn ?? 0) + row.drawn,
      lost: (old?.lost ?? 0) + row.lost,
      goalDiff: (old?.goalDiff ?? 0) + row.goals_for - row.goals_against,
      points: (old?.points ?? 0) + rankingPoints(row),
    });
  }
  return [...byClub.values()]
    .map((row) => ({ ...row, points: Math.round(row.points) }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDiff - a.goalDiff ||
        a.name.localeCompare(b.name, 'pl') ||
        a.clubId.localeCompare(b.clubId),
    )
    .map((row, i) => ({ ...row, position: i + 1 }));
}
