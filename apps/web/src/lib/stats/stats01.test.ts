import { describe, expect, it } from 'vitest';

import type { SeasonHistory } from '@/lib/board/season-history';
import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
import { OPPONENT_CATALOG } from '@/lib/fixtures/opponent-catalog';
import type { FixtureDto } from '@/lib/fixtures/types';
import { fillHumanSeats, humanFixtureMatchday, pairingForClub } from '@/lib/league/human-league';
import { humanAwards, humanPrizeLine, parseHumanAwards } from '@/lib/league/human-awards';
import { resolveHumanScorers } from '@/lib/league/human-scorers';
import { resolveHumanTable, type HumanTableRow } from '@/lib/league/human-table';
import { resolveLeagueTable } from '@/lib/league/resolve-league-table';
import { parsePlayerLines, toStoredPlayers } from '@/lib/match/match-players';
import { resolveMatchEvents, type HumanNews } from '@/lib/messages/match-events';
import { opponentNames } from '@/lib/squad/opponent-names';
import { resolveClubRecords, type ClubMatch } from '@/lib/stats/records';
import { resolveLeagueScorers, type StoredLine } from '@/lib/stats/scorers';
import { sumByPlayer } from '@/lib/stats/totals';
import { resolveTrophies } from '@/lib/stats/trophies';

const CLUB = {
  id: '1be439c0-9530-400a-a437-ceaccf61d482',
  name: 'Klub',
  shortName: 'KLU',
  leagueTier: 'iv' as const,
  seasonNumber: 1,
};

function season(played: number): FixtureDto[] {
  return planClubFixtures(CLUB.id).map(
    (p, i) =>
      ({
        id: `f${i}`,
        clubId: CLUB.id,
        matchday: p.matchday,
        competition: 'league',
        opponentClubId: p.opponentClubId,
        isHome: p.isHome,
        status: i < played ? 'played' : 'scheduled',
        homeScore: i < played ? 2 : null,
        awayScore: i < played ? 1 : null,
        playedAt: null,
      }) as unknown as FixtureDto,
  );
}

const line = (matchId: string, team: string, playerId: string, goals: number): StoredLine => ({
  matchId,
  team,
  playerId,
  name: playerId,
  goals,
  assists: 0,
});

describe('league scorers (D143)', () => {
  it('AI goals on the list are the goals of the table', () => {
    const fixtures = season(22);
    const stored = fixtures.flatMap((f) => [
      line(f.id, CLUB.id, 'me', f.isHome ? 2 : 1),
      line(f.id, f.opponentClubId, 'them', f.isHome ? 1 : 2),
    ]);
    const rows = resolveLeagueScorers(CLUB, fixtures, stored);
    for (const team of resolveLeagueTable(CLUB, fixtures).rows) {
      const goals = rows
        .filter((r) => r.teamId === team.clubId)
        .reduce((sum, r) => sum + r.goals, 0);
      expect(goals, team.name).toBe(team.goalsFor);
    }
    // A believable top scorer, and the two clubs with equal player ids stay apart.
    const ai = rows.filter((r) => !r.yours && r.playerId !== 'them');
    expect(ai[0]!.goals).toBeGreaterThan(5);
    expect(ai[0]!.goals).toBeLessThan(35);
    expect(new Set(rows.map((r) => `${r.teamId}|${r.playerId}`)).size).toBe(rows.length);
    expect(resolveLeagueScorers(CLUB, fixtures, stored)).toEqual(rows);
  });

  it('a match without stored players gives the opponent its goals and us none', () => {
    const rows = resolveLeagueScorers(CLUB, season(1), []);
    const first = season(1)[0]!;
    const goals = rows
      .filter((r) => r.teamId === first.opponentClubId)
      .reduce((sum, r) => sum + r.goals, 0);
    expect(goals).toBe(first.isHome ? 1 : 2);
    expect(rows.some((r) => r.yours)).toBe(false);
  });

  it('ignores lines of other matches', () => {
    expect(resolveLeagueScorers(CLUB, season(0), [line('x', CLUB.id, 'me', 9)])).toEqual([]);
  });
});

describe('opponent names', () => {
  it('eleven different names, stable, not shared by every club', () => {
    for (const club of OPPONENT_CATALOG) {
      const names = opponentNames(club.id);
      expect(new Set(names.map((n) => n.slice(3))).size).toBe(11);
      expect(opponentNames(club.id)).toEqual(names);
    }
    const strikers = OPPONENT_CATALOG.map((club) => opponentNames(club.id)[9]);
    expect(new Set(strikers).size).toBeGreaterThan(8);
  });
});

describe('match players', () => {
  const raw = [
    { id: 'a', name: 'A', side: 'home', goals: 1, assists: 0 },
    { id: 'b', name: 'B', side: 'away', goals: 0, assists: 0 },
    { id: 'c', name: 'C', side: 'away', goals: 0, assists: 1 },
  ];

  it('keeps our whole team and only useful opponents', () => {
    const lines = parsePlayerLines(raw)!;
    expect(toStoredPlayers(lines, 'home').map((p) => [p.id, p.mine])).toEqual([
      ['a', true],
      ['c', false],
    ]);
    expect(toStoredPlayers(lines, 'away').map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('an old or broken broadcast has no players', () => {
    expect(parsePlayerLines(null)).toBeNull();
    expect(parsePlayerLines([{ id: 'a' }])).toBeNull();
  });
});

describe('records and trophies', () => {
  const match = (ours: number, theirs: number, day: number): ClubMatch => ({
    season: 1,
    competition: 'league',
    opponent: 'Rywal',
    ours,
    theirs,
    playedAt: `2026-11-${String(day).padStart(2, '0')}T10:00:00Z`,
  });

  it('finds the biggest win, the streaks and the first holder of a record', () => {
    const records = resolveClubRecords([
      match(3, 0, 3),
      match(3, 0, 1),
      match(1, 1, 2),
      match(4, 1, 4),
      match(0, 2, 5),
    ]);
    expect(records).toMatchObject({ played: 5, won: 3, drawn: 1, lost: 1, winStreak: 2 });
    expect(records.unbeatenStreak).toBe(4);
    expect(records.biggestWin).toMatchObject({ ours: 4, theirs: 1 });
    expect(records.biggestLoss).toMatchObject({ theirs: 2 });
    expect(resolveClubRecords([]).biggestWin).toBeNull();
    expect(resolveClubRecords([match(0, 0, 1)])).toMatchObject({ wildest: null, winStreak: 0 });
  });

  it('turns closed seasons into trophies, newest first', () => {
    const base: SeasonHistory = {
      seasonNumber: 1,
      leagueTier: 'iv',
      position: 1,
      tableSize: 12,
      points: 50,
      won: 16,
      drawn: 2,
      lost: 4,
      goalsFor: 40,
      goalsAgainst: 20,
      cupRoundReached: 5,
      outcome: 'promote',
    };
    const award = { club_id: 'x', place: 2, amount: 20_000, played: 20 };
    const out = resolveTrophies({
      history: [
        base,
        {
          ...base,
          seasonNumber: 2,
          leagueTier: 'iii',
          position: 5,
          cupRoundReached: 4,
          outcome: 'stay',
        },
      ],
      human: [
        { league: 1, season: 1, award },
        { league: 1, season: 2, award: { ...award, place: 4 } },
      ],
    });
    expect(out.map((t) => t.id)).toEqual([
      'cup-2',
      'league-1',
      'cup-1',
      'promotion-1',
      'human-1-1',
    ]);
    expect(out[0]!.kind).toBe('cup_final');
    expect(out[3]!.title).toContain('III');
  });

  it('adds up a player over competitions', () => {
    const row = { season: 1, playerId: 'p', name: 'P', matches: 2, goals: 1, assists: 1 };
    expect(
      sumByPlayer([
        { ...row, competition: 'league' },
        { ...row, competition: 'cup' },
      ]),
    ).toEqual([{ playerId: 'p', name: 'P', matches: 4, goals: 2, assists: 2, leagueGoals: 1 }]);
  });
});

const HUMAN = '1be439c0-9530-400a-a437-ceaccf61d482';
const RIVAL = '84cc02fe-6ae5-4b52-a6b1-b176854f3d6c';
const SEATS = fillHumanSeats(
  [
    { id: HUMAN, name: 'Klub A', shortName: 'KLA', createdAt: '2026-01-01' },
    { id: RIVAL, name: 'Klub B', shortName: 'KLB', createdAt: '2026-01-02' },
  ],
  OPPONENT_CATALOG,
);

describe('human league awards', () => {
  const row = (id: string, isBot: boolean) => ({ id, isBot }) as HumanTableRow;

  it('pays by place, only player clubs with half of the rounds played', () => {
    const table = [row('opp-x', true), row('a', false), row('b', false), row('c', false)];
    const awards = humanAwards(
      table,
      new Map([
        ['a', 22],
        ['b', 10],
        ['c', 11],
        ['opp-x', 22],
      ]),
    );
    expect(awards).toEqual([
      { club_id: 'a', place: 2, amount: 20_000, played: 22 },
      { club_id: 'c', place: 4, amount: 6_000, played: 11 },
    ]);
    expect(parseHumanAwards(awards)).toEqual(awards);
    expect(parseHumanAwards(null)).toEqual([]);
  });

  it('describes the prizes once per amount', () => {
    expect(humanPrizeLine([3, 2, 1, 1])).toMatch(/1\. miejsce.*2\. miejsce.*3\.–4\. miejsce/);
  });
});

describe('human scorers', () => {
  it('bots score what their table says, and the future is not counted', () => {
    const now = new Date('2026-11-20T22:00:00Z');
    const input = { seats: SEATS, seasonKey: '2026-11-12', now };
    const rows = resolveHumanScorers({ ...input, broadcasts: [], clubId: HUMAN });
    const table = resolveHumanTable({ ...input, results: [] });
    const total = (list: readonly { goals: number }[]) => list.reduce((s, r) => s + r.goals, 0);
    expect(total(rows)).toBe(table.reduce((sum, r) => sum + r.goalsFor, 0));
    const before = new Date('2026-11-12T10:00:00Z');
    const none = resolveHumanScorers({ ...input, now: before, broadcasts: [], clubId: HUMAN });
    expect(none).toEqual([]);
  });

  it('counts both sides of a shared match', () => {
    const stats = [
      { id: 'a', name: 'A', side: 'home', goals: 2, assists: 0 },
      { id: 'b', name: 'B', side: 'away', goals: 1, assists: 0 },
    ];
    const rows = resolveHumanScorers({
      seats: SEATS,
      seasonKey: '2026-11-12',
      now: new Date('2026-11-12T10:00:00Z'),
      broadcasts: [{ homeId: RIVAL, awayId: HUMAN, stats }],
      clubId: HUMAN,
    });
    expect(rows.map((r) => [r.teamName, r.goals, r.yours])).toEqual([
      ['Klub B', 2, false],
      ['Klub A', 1, true],
    ]);
  });
});

describe('match events in messages', () => {
  const now = new Date('2026-11-12T20:30:00Z');
  const news: HumanNews = {
    seasonKey: '2026-11-12',
    seats: SEATS,
    playedRounds: [],
    playedToday: false,
    decidedRounds: new Set(),
  };
  const events = (over: Partial<Parameters<typeof resolveMatchEvents>[0]>) =>
    resolveMatchEvents({ clubId: HUMAN, now, challenges: [], human: null, award: null, ...over });

  it('a waiting round, quiet before 18:00 and after the match', () => {
    expect(events({ human: news })[0]!.subject).toContain('kolejka 1: mecz czeka');
    expect(events({ human: news, now: new Date('2026-11-12T10:00:00Z') })).toEqual([]);
    expect(events({ human: { ...news, playedRounds: [1], playedToday: true } })).toEqual([]);
  });

  it('says that the rival played, without the score, and never about a bot', () => {
    const round = Array.from({ length: 22 }, (_, i) => i + 1).find((r) => {
      const pair = pairingForClub(SEATS, r, HUMAN)!;
      return pair.home.id === RIVAL || pair.away.id === RIVAL;
    })!;
    const at = new Date(Date.UTC(2026, 10, 12 + round - 1, 20, 30));
    const human = {
      ...news,
      playedRounds: Array.from({ length: round - 1 }, (_, i) => i + 1),
      decidedRounds: new Set([round]),
    };
    const [message] = events({ human, now: at });
    expect(message!.subject).toBe(
      `Liga ludzi, kolejka ${round}: rywal Klub B ma już ten mecz za sobą`,
    );
    expect(humanFixtureMatchday(round)).toBe(300 + round);
  });

  it('fresh challenges and awards only', () => {
    const challenge = {
      id: 'c1',
      challengerName: 'Klub B',
      rivalName: 'Klub A',
      homeScore: 2,
      awayScore: 1,
      playedAt: '2026-11-11T12:00:00Z',
    };
    expect(events({ challenges: [challenge] })[0]!.subject).toBe(
      'Wyzwanie rozegrane: Klub B 2:1 Klub A',
    );
    expect(events({ challenges: [{ ...challenge, playedAt: '2026-11-01T12:00:00Z' }] })).toEqual(
      [],
    );
    const award = {
      league: 1,
      season: 1,
      place: 2,
      amount: 20_000,
      closedAt: '2026-11-12T00:00:00Z',
    };
    expect(events({ award })[0]!.subject).toContain('2. miejsce, nagroda');
    expect(events({ award: { ...award, amount: 0 } })[0]!.subject).not.toContain('nagroda');
  });
});
