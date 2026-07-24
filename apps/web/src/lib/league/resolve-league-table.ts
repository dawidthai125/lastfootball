import { STARTER_PACKAGE } from '@/lib/club/types';
import type { ClubDto } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import { resolveLeagueMembers } from '@/lib/league/league-members';
import { planAiVsAiMatches } from '@/lib/league/simulate-ai-results';
import {
  LEAGUE_POINTS,
  type LeagueMember,
  type LeagueTableDto,
  type LeagueTableRowDto,
} from '@/lib/league/types';

type Acc = {
  member: LeagueMember;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

/**
 * Sole league table SSOT for product UI (LFE-LEAGUE-02).
 * Player results from fixtures; AI↔AI from deterministic derive — no standings DB.
 */
export function resolveLeagueTable(
  club: Pick<ClubDto, 'id' | 'name' | 'shortName'>,
  fixtures: readonly FixtureDto[],
): LeagueTableDto {
  const members = resolveLeagueMembers(club);
  const byId = new Map<string, Acc>();
  for (const m of members) {
    byId.set(m.id, {
      member: m,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    });
  }

  for (const f of fixtures) {
    if (f.status !== 'played' || f.homeScore == null || f.awayScore == null) continue;
    const playerId = club.id;
    const oppId = f.opponentClubId;
    if (f.isHome) {
      applyResult(byId, playerId, oppId, f.homeScore, f.awayScore);
    } else {
      applyResult(byId, oppId, playerId, f.homeScore, f.awayScore);
    }
  }

  const aiIds = members.filter((m) => !m.isPlayer).map((m) => m.id);
  for (const m of planAiVsAiMatches(aiIds)) {
    applyResult(byId, m.homeId, m.awayId, m.homeScore, m.awayScore);
  }

  const rows: LeagueTableRowDto[] = [...byId.values()].sort(compareAcc).map((acc, i) => ({
    position: i + 1,
    clubId: acc.member.id,
    name: acc.member.name,
    shortName: acc.member.shortName,
    played: acc.played,
    won: acc.won,
    drawn: acc.drawn,
    lost: acc.lost,
    goalsFor: acc.goalsFor,
    goalsAgainst: acc.goalsAgainst,
    goalDifference: acc.goalsFor - acc.goalsAgainst,
    points: acc.points,
    isPlayer: acc.member.isPlayer,
  }));

  return {
    leagueLabel: STARTER_PACKAGE.league,
    seasonLabel: 'Sezon 1',
    rows,
  };
}

/** Player position label for Hub chip — same table SSOT. */
export function resolvePlayerLeaguePositionLabel(table: LeagueTableDto): string | null {
  const row = table.rows.find((r) => r.isPlayer);
  if (!row) return null;
  return `${row.position}. miejsce / ${table.rows.length}`;
}

function applyResult(
  byId: Map<string, Acc>,
  homeId: string,
  awayId: string,
  homeScore: number,
  awayScore: number,
): void {
  const home = byId.get(homeId);
  const away = byId.get(awayId);
  if (!home || !away) return;

  home.played += 1;
  away.played += 1;
  home.goalsFor += homeScore;
  home.goalsAgainst += awayScore;
  away.goalsFor += awayScore;
  away.goalsAgainst += homeScore;

  if (homeScore > awayScore) {
    home.won += 1;
    home.points += LEAGUE_POINTS.win;
    away.lost += 1;
    away.points += LEAGUE_POINTS.loss;
  } else if (homeScore < awayScore) {
    away.won += 1;
    away.points += LEAGUE_POINTS.win;
    home.lost += 1;
    home.points += LEAGUE_POINTS.loss;
  } else {
    home.drawn += 1;
    away.drawn += 1;
    home.points += LEAGUE_POINTS.draw;
    away.points += LEAGUE_POINTS.draw;
  }
}

function compareAcc(a: Acc, b: Acc): number {
  if (b.points !== a.points) return b.points - a.points;
  const gdA = a.goalsFor - a.goalsAgainst;
  const gdB = b.goalsFor - b.goalsAgainst;
  if (gdB !== gdA) return gdB - gdA;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.member.name.localeCompare(b.member.name, 'pl');
}
