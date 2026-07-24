export type LeagueMember = {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  /** True for the manager club row. */
  readonly isPlayer: boolean;
};

export type LeagueTableRowDto = {
  readonly position: number;
  readonly clubId: string;
  readonly name: string;
  readonly shortName: string;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDifference: number;
  readonly points: number;
  readonly isPlayer: boolean;
};

export type LeagueTableDto = {
  readonly leagueLabel: string;
  readonly seasonLabel: string;
  readonly rows: readonly LeagueTableRowDto[];
};

/** Points: win / draw / loss (GDD §10). */
export const LEAGUE_POINTS = { win: 3, draw: 1, loss: 0 } as const;
