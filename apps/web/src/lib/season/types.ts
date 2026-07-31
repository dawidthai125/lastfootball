import { LEAGUE_FIXTURE_COUNT } from '@/lib/fixtures/opponent-catalog';
import { countPlayedInList } from '@/lib/fixtures/played-unlock';

export type ClubSeasonPhase = 'in_season' | 'offseason';

export type SeasonResultZone = 'top' | 'upper_mid' | 'lower_mid' | 'bottom';

export type SeasonReportHighlight = {
  readonly id: string;
  readonly label: string;
};

export type SeasonReportDto = {
  readonly seasonNumber: number;
  readonly seasonLabel: string;
  readonly leagueLabel: string;
  readonly position: number;
  readonly tableSize: number;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDifference: number;
  readonly points: number;
  readonly zone: SeasonResultZone;
  readonly zoneLabel: string;
  readonly highlights: readonly SeasonReportHighlight[];
};

/** Format product season label from season number. */
export function formatSeasonLabel(seasonNumber: number): string {
  return `Sezon ${Math.max(1, Math.trunc(seasonNumber))}`;
}

/**
 * Trigger owns lifecycle (D70 · D75): exactly 22 league fixtures, all played.
 * AI↔AI does not count — player club fixtures only.
 */
export function isSeasonCompleteTrigger(
  fixtures: readonly { readonly status: string }[],
): boolean {
  if (fixtures.length !== LEAGUE_FIXTURE_COUNT) return false;
  return countPlayedInList(fixtures) === LEAGUE_FIXTURE_COUNT;
}
