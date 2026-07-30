import type { LeagueTableDto } from '@/lib/league/types';

export type RankingBand = 'upper' | 'mid' | 'lower';

export type ClubRankingRowDto = {
  readonly position: number;
  readonly clubId: string;
  readonly name: string;
  readonly shortName: string;
  readonly isPlayer: boolean;
  readonly band: RankingBand;
};

export type ClubRankingDto = {
  /** Current season label from league table input (domain passthrough). */
  readonly seasonLabel: string;
  /** Local league context label from table input (domain passthrough). */
  readonly contextLabel: string;
  readonly rows: readonly ClubRankingRowDto[];
  readonly playerPosition: number | null;
};

export type ResolveClubRankingInput = {
  readonly table: LeagueTableDto;
};

/**
 * Qualitative band from ordinal position — Information Thin, not a score.
 * Deterministic thirds over `n` rows.
 */
export function resolveRankingBand(position: number, n: number): RankingBand {
  if (n <= 0) return 'mid';
  const upperMax = Math.ceil(n / 3);
  const lowerMinExclusive = n - Math.floor(n / 3);
  if (position <= upperMax) return 'upper';
  if (position > lowerMinExclusive) return 'lower';
  return 'mid';
}

/**
 * Ranking Information Thin (GDD §18) — pure derive from league table input.
 * No points/WDL/goals/ELO in DTO; no UI copy strings (D29 — bands labeled in UI via UI_COPY).
 */
export function resolveClubRanking(input: ResolveClubRankingInput): ClubRankingDto {
  const { table } = input;
  const n = table.rows.length;

  const rows: ClubRankingRowDto[] = table.rows.map((row) => ({
    position: row.position,
    clubId: row.clubId,
    name: row.name,
    shortName: row.shortName,
    isPlayer: row.isPlayer,
    band: resolveRankingBand(row.position, n),
  }));

  const player = rows.find((r) => r.isPlayer);

  return {
    seasonLabel: table.seasonLabel,
    contextLabel: table.leagueLabel,
    rows,
    playerPosition: player?.position ?? null,
  };
}
