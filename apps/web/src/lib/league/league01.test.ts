import { describe, expect, it } from 'vitest';

import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
import type { FixtureDto } from '@/lib/fixtures/types';
import { OPPONENT_CATALOG } from '@/lib/fixtures/opponent-catalog';
import { LEAGUE_SIZE, resolveLeagueMembers } from '@/lib/league/league-members';
import {
  resolveLeagueTable,
  resolvePlayerLeaguePositionLabel,
} from '@/lib/league/resolve-league-table';
import { planAiMatchesForPlayedWeeks, planAiVsAiMatches } from '@/lib/league/simulate-ai-results';

const club = { id: 'club-aaa', name: 'Alpha FC', shortName: 'AFC', leagueTier: 'iv' as const };

function played(
  partial: Partial<FixtureDto> & Pick<FixtureDto, 'opponentClubId' | 'homeScore' | 'awayScore'>,
): FixtureDto {
  return {
    id: 'fx-1',
    clubId: club.id,
    matchday: 1,
    competition: 'league',
    opponent: {
      id: partial.opponentClubId,
      name: 'Opp',
      shortName: 'OPP',
    },
    isHome: true,
    status: 'played',
    playedAt: '2026-07-25T00:00:00.000Z',
    createdAt: '2026-07-25T00:00:00.000Z',
    ...partial,
  };
}

describe('league members', () => {
  it('returns player + 11 AI = 12', () => {
    const members = resolveLeagueMembers(club);
    expect(members).toHaveLength(LEAGUE_SIZE);
    expect(members.filter((m) => m.isPlayer)).toHaveLength(1);
    expect(members[0]?.id).toBe(club.id);
    expect(OPPONENT_CATALOG).toHaveLength(11);
  });
});

describe('resolveLeagueTable', () => {
  it('is deterministic and returns 12 rows', () => {
    const a = resolveLeagueTable(club, []);
    const b = resolveLeagueTable(club, []);
    expect(a.rows).toHaveLength(12);
    expect(a).toEqual(b);
    expect(a.rows.every((r, i) => r.position === i + 1)).toBe(true);
  });

  it('applies player win as 3 points for player and loss for opponent', () => {
    const opp = OPPONENT_CATALOG[0]!;
    const table = resolveLeagueTable(club, [
      played({
        opponentClubId: opp.id,
        homeScore: 2,
        awayScore: 0,
        isHome: true,
      }),
    ]);
    const player = table.rows.find((r) => r.isPlayer)!;
    const rival = table.rows.find((r) => r.clubId === opp.id)!;
    expect(player.won).toBeGreaterThanOrEqual(1);
    expect(player.points).toBeGreaterThanOrEqual(3);
    // Rival has AI-AI games too; at least one loss from player fixture
    expect(rival.lost).toBeGreaterThanOrEqual(1);
  });

  it('does not add cup goals to the league table', () => {
    const opp = OPPONENT_CATALOG[0]!;
    const leagueOnly = resolveLeagueTable(club, []);
    const withCup = resolveLeagueTable(club, [
      played({
        id: 'cup-x',
        matchday: 101,
        competition: 'cup',
        opponentClubId: opp.id,
        homeScore: 5,
        awayScore: 0,
        isHome: true,
      }),
    ]);
    expect(withCup.rows.find((r) => r.isPlayer)?.points).toBe(
      leagueOnly.rows.find((r) => r.isPlayer)?.points,
    );
  });

  it('exposes position label for Hub chip', () => {
    const table = resolveLeagueTable(club, []);
    const label = resolvePlayerLeaguePositionLabel(table);
    expect(label).toMatch(/^\d+\. miejsce \/ 12$/);
  });
});

describe('resolveLeagueTable played weeks', () => {
  it('keeps every club on 0 until the manager plays a league match', () => {
    const table = resolveLeagueTable(club, []);
    expect(table.rows.every((r) => r.played === 0 && r.points === 0)).toBe(true);
  });

  it('counts only the played week, including that week of AI games', () => {
    const leg = planClubFixtures(club.id).find((p) => p.matchday === 3)!;
    const table = resolveLeagueTable(club, [
      played({
        opponentClubId: leg.opponentClubId,
        homeScore: 1,
        awayScore: 0,
        isHome: leg.isHome,
        matchday: 3,
      }),
    ]);
    const player = table.rows.find((r) => r.isPlayer)!;
    expect(player.played).toBe(1);
    expect(table.rows.every((r) => r.played <= 1)).toBe(true);
    expect(table.rows.some((r) => !r.isPlayer && r.played === 1)).toBe(true);
  });

  it('full 22 played weeks match the ungated AI double round-robin', () => {
    const ids = OPPONENT_CATALOG.map((o) => o.id);
    const days = new Set(Array.from({ length: 22 }, (_, i) => i + 1));
    const gated = planAiMatchesForPlayedWeeks(club.id, days);
    const full = planAiVsAiMatches(ids);
    const key = (m: { homeId: string; awayId: string }) => `${m.homeId}>${m.awayId}`;
    expect(gated.map(key).sort()).toEqual(full.map(key).sort());
  });
});

describe('planAiVsAiMatches', () => {
  it('is deterministic and covers double RR (home+away each pair)', () => {
    const ids = OPPONENT_CATALOG.map((o) => o.id);
    const a = planAiVsAiMatches(ids);
    const b = planAiVsAiMatches(ids);
    expect(a).toEqual(b);
    expect(a).toHaveLength(11 * 10);
    // Each ordered pair appears once
    const keys = a.map((m) => `${m.homeId}>${m.awayId}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const home of ids) {
      for (const away of ids) {
        if (home === away) continue;
        expect(keys).toContain(`${home}>${away}`);
      }
    }
  });
});
