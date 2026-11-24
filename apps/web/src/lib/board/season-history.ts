/** One closed season of the club (`club_season_history`, D131). Pure builder and mappers. */

import { resolveNationalCup } from '@/lib/cup/resolve-national-cup';
import type { FixtureDto } from '@/lib/fixtures/types';
import {
  parseLeagueTier,
  resolvePromotionOutcome,
  type LeagueTier,
  type PromotionOutcomeKind,
} from '@/lib/league/league-tier';
import { resolveLeagueTable } from '@/lib/league/resolve-league-table';
import type { LeagueTableRowDto } from '@/lib/league/types';
import { isSeasonCompleteTrigger } from '@/lib/season/types';

export type SeasonHistory = {
  readonly seasonNumber: number;
  readonly leagueTier: LeagueTier;
  readonly position: number;
  readonly tableSize: number;
  readonly points: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  /** 0 = no cup tie, 1..4 = last round reached, 5 = cup won. */
  readonly cupRoundReached: number;
  readonly outcome: PromotionOutcomeKind;
};

export type SeasonHistoryRow = {
  season_number: number;
  league_tier: string;
  position: number;
  table_size: number;
  points: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  cup_round_reached: number;
  outcome: string;
};

export type BoardClub = {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly leagueTier: LeagueTier;
  readonly seasonNumber: number;
};

/** Null until all league matches of the season are stored. */
export function buildSeasonHistory(
  club: BoardClub,
  fixtures: readonly FixtureDto[],
): SeasonHistory | null {
  if (!isSeasonCompleteTrigger(fixtures)) return null;
  const { rows } = resolveLeagueTable(club, fixtures);
  const row: LeagueTableRowDto | undefined = rows.find((r) => r.isPlayer);
  if (!row) return null;
  return {
    seasonNumber: club.seasonNumber,
    leagueTier: club.leagueTier,
    position: row.position,
    tableSize: rows.length,
    points: row.points,
    won: row.won,
    drawn: row.drawn,
    lost: row.lost,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    cupRoundReached: cupRoundReached(club, fixtures),
    outcome: resolvePromotionOutcome(row.position, rows.length, club.leagueTier).kind,
  };
}

function cupRoundReached(club: BoardClub, fixtures: readonly FixtureDto[]): number {
  let reached = 0;
  for (const round of resolveNationalCup(club, fixtures).rounds) {
    for (const tie of round.ties) {
      const inTie = [tie.home, tie.away].some((side) => side.kind === 'club' && side.club.isPlayer);
      if (!inTie) continue;
      reached = round.round === 4 && tie.winnerId === club.id ? 5 : round.round;
    }
  }
  return reached;
}

export function toSeasonHistoryRow(history: SeasonHistory): SeasonHistoryRow {
  return {
    season_number: history.seasonNumber,
    league_tier: history.leagueTier,
    position: history.position,
    table_size: history.tableSize,
    points: history.points,
    won: history.won,
    drawn: history.drawn,
    lost: history.lost,
    goals_for: history.goalsFor,
    goals_against: history.goalsAgainst,
    cup_round_reached: history.cupRoundReached,
    outcome: history.outcome,
  };
}

export function fromSeasonHistoryRow(row: SeasonHistoryRow): SeasonHistory {
  return {
    seasonNumber: row.season_number,
    leagueTier: parseLeagueTier(row.league_tier),
    position: row.position,
    tableSize: row.table_size,
    points: row.points,
    won: row.won,
    drawn: row.drawn,
    lost: row.lost,
    goalsFor: row.goals_for,
    goalsAgainst: row.goals_against,
    cupRoundReached: row.cup_round_reached,
    outcome: row.outcome === 'promote' || row.outcome === 'relegate' ? row.outcome : 'stay',
  };
}
