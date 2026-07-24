/**
 * LFE-PLAYER-RATINGS-01 — pure rating derive + MVP (no Engine).
 */
import { describe, expect, it } from 'vitest';

import type { MatchState } from '@lastfootball/lfe';

import {
  clampRating,
  computePlayerRatings,
  round1,
  selectMvp,
  type PlayerRatingView,
} from './player-ratings';

const ROLES = ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'CM', 'CM', 'RW', 'ST', 'LW'] as const;

function slot(side: 'home' | 'away', i: number, playerId: string) {
  return { slotIndex: i, role: ROLES[i]!, playerId };
}

function player(id: string, side: 'home' | 'away', name: string, shirtNumber: number) {
  return {
    id,
    teamId: side === 'home' ? 't-h' : 't-a',
    side,
    name,
    shirtNumber,
    preferredRole: 'ST',
  };
}

function emptyStats(playerId: string, side: 'home' | 'away') {
  return {
    playerId,
    side,
    goals: 0,
    assists: 0,
    shots: 0,
    passesAttempted: 0,
    passesCompleted: 0,
    tackles: 0,
    foulsCommitted: 0,
    yellowCards: 0,
    redCards: 0,
    minutesPlayed: 0,
  };
}

function makeState(opts?: {
  homeScore?: number;
  awayScore?: number;
  patchStats?: Record<string, Partial<ReturnType<typeof emptyStats>>>;
  omitStatsFor?: string[];
}): MatchState {
  const homeIds = Array.from({ length: 11 }, (_, i) => `h${i}`);
  const awayIds = Array.from({ length: 11 }, (_, i) => `a${i}`);
  const players = [
    ...homeIds.map((id, i) => player(id, 'home', `Home ${i}`, i + 1)),
    ...awayIds.map((id, i) => player(id, 'away', `Away ${i}`, i + 1)),
  ];

  let stats = [
    ...homeIds.map((id) => emptyStats(id, 'home')),
    ...awayIds.map((id) => emptyStats(id, 'away')),
  ];

  if (opts?.omitStatsFor) {
    const omit = new Set(opts.omitStatsFor);
    stats = stats.filter((s) => !omit.has(s.playerId));
  }

  if (opts?.patchStats) {
    stats = stats.map((s) => {
      const patch = opts.patchStats![s.playerId];
      return patch ? { ...s, ...patch } : s;
    });
  }

  return {
    score: { home: opts?.homeScore ?? 0, away: opts?.awayScore ?? 0 },
    homeLineup: {
      side: 'home',
      slots: homeIds.map((id, i) => slot('home', i, id)),
    },
    awayLineup: {
      side: 'away',
      slots: awayIds.map((id, i) => slot('away', i, id)),
    },
    players,
    statistics: { players: stats },
  } as unknown as MatchState;
}

describe('LFE-PLAYER-RATINGS-01', () => {
  it('T1: XI home+away = 11+11 sorted by slotIndex', () => {
    const r = computePlayerRatings(makeState());
    expect(r.home).toHaveLength(11);
    expect(r.away).toHaveLength(11);
    expect(r.home.map((p) => p.slotIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(r.away.map((p) => p.slotIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('T2: draw + no stats → field 6.0, GK clean sheet 6.5', () => {
    const r = computePlayerRatings(makeState({ homeScore: 0, awayScore: 0 }));
    const field = r.home.find((p) => p.role !== 'GK')!;
    const gk = r.home.find((p) => p.role === 'GK')!;
    expect(field.rating).toBe(6.0);
    expect(gk.rating).toBe(6.5);
  });

  it('T3: goals add +1.0 each, capped at +3.0; clamp ≤ 10.0', () => {
    const r = computePlayerRatings(
      makeState({
        homeScore: 1,
        awayScore: 0,
        patchStats: { h9: { goals: 4, shots: 4 } },
      }),
    );
    // base 6 + 3 goals + 0.4 shots + 0.3 win = 9.7
    expect(r.home.find((p) => p.playerId === 'h9')!.rating).toBe(9.7);
    expect(clampRating(12)).toBe(10.0);
  });

  it('T4: fouls lower rating; clamp ≥ 1.0', () => {
    const r = computePlayerRatings(
      makeState({
        homeScore: 0,
        awayScore: 1,
        patchStats: { h9: { foulsCommitted: 8 } },
      }),
    );
    // base 6 + (-0.25*4) + lose -0.3 = 4.7
    expect(r.home.find((p) => p.playerId === 'h9')!.rating).toBe(4.7);
    expect(clampRating(-2)).toBe(1.0);
  });

  it('T5: same MatchState twice → identical ratings + MVP', () => {
    const state = makeState({
      homeScore: 2,
      awayScore: 1,
      patchStats: { h9: { goals: 2, shots: 3 }, a9: { goals: 1 } },
    });
    const a = computePlayerRatings(state);
    const b = computePlayerRatings(state);
    expect(a).toEqual(b);
    expect(a.mvpPlayerId).toBe(b.mvpPlayerId);
  });

  it('T6: MVP tie-break goals → shots → fouls → home → slot → id', () => {
    const tied: PlayerRatingView[] = [
      {
        playerId: 'a1',
        side: 'away',
        name: 'A',
        shirtNumber: 1,
        role: 'ST',
        slotIndex: 0,
        rating: 7.0,
        status: 'solid',
        goals: 1,
        shots: 2,
        foulsCommitted: 0,
        isMvp: false,
      },
      {
        playerId: 'h1',
        side: 'home',
        name: 'H',
        shirtNumber: 1,
        role: 'ST',
        slotIndex: 1,
        rating: 7.0,
        status: 'solid',
        goals: 1,
        shots: 2,
        foulsCommitted: 0,
        isMvp: false,
      },
    ];
    expect(selectMvp(tied)).toBe('h1');

    const bySlot: PlayerRatingView[] = [
      { ...tied[1]!, playerId: 'h2', slotIndex: 2 },
      { ...tied[1]!, playerId: 'h0', slotIndex: 0 },
    ];
    expect(selectMvp(bySlot)).toBe('h0');
  });

  it('T7: GK clean sheet +0.5 vs field without goals', () => {
    const r = computePlayerRatings(makeState({ homeScore: 1, awayScore: 0 }));
    const homeGk = r.home.find((p) => p.role === 'GK')!;
    const homeField = r.home.find((p) => p.role === 'ST')!;
    const awayGk = r.away.find((p) => p.role === 'GK')!;
    // home win +0.3; home GK also +0.5 clean sheet
    expect(homeGk.rating).toBe(round1(6.0 + 0.3 + 0.5));
    expect(homeField.rating).toBe(round1(6.0 + 0.3));
    // away lose -0.3; away GK no clean sheet
    expect(awayGk.rating).toBe(round1(6.0 - 0.3));
  });

  it('T8: missing statistics row → counters 0, no crash', () => {
    const r = computePlayerRatings(makeState({ homeScore: 0, awayScore: 0, omitStatsFor: ['h9'] }));
    const row = r.home.find((p) => p.playerId === 'h9')!;
    expect(row.goals).toBe(0);
    expect(row.shots).toBe(0);
    expect(row.foulsCommitted).toBe(0);
    expect(row.rating).toBe(6.0);
  });
});
