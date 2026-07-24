/**
 * LFE-POST-MATCH-01 — summary + replay index helpers (no Engine / Replay mutations).
 * LFE-PLAYER-RATINGS-01 — summary embeds derived ratings.
 */
import { describe, expect, it } from 'vitest';

import type { MatchState } from '@lastfootball/lfe';

import type { MatchCanvasReadModel } from '../../../gameplay/canvas-host';
import { createReplayBuffer } from '../../../gameplay/replay';

import {
  buildPostMatchSummary,
  findReplayIndexForEvent,
  isMatchFinished,
} from './build-post-match-summary';

const ROLES = ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'CM', 'CM', 'RW', 'ST', 'LW'] as const;

function fakeState(scoreHome: number, scoreAway: number, phase = 'FINISHED') {
  const homeIds = Array.from({ length: 11 }, (_, i) => `h${i}`);
  const awayIds = Array.from({ length: 11 }, (_, i) => `a${i}`);
  const players = [
    ...homeIds.map((id, i) => ({
      id,
      teamId: 't-h',
      side: 'home' as const,
      name: `Home ${i}`,
      shirtNumber: i + 1,
      preferredRole: 'ST',
    })),
    ...awayIds.map((id, i) => ({
      id,
      teamId: 't-a',
      side: 'away' as const,
      name: `Away ${i}`,
      shirtNumber: i + 1,
      preferredRole: 'ST',
    })),
  ];
  const emptyRow = (playerId: string, side: 'home' | 'away') => ({
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
  });

  return {
    phase,
    score: { home: scoreHome, away: scoreAway },
    clock: { displayMinute: 90, period: 'second_half' },
    homeLineup: {
      side: 'home',
      slots: homeIds.map((id, i) => ({ slotIndex: i, role: ROLES[i], playerId: id })),
    },
    awayLineup: {
      side: 'away',
      slots: awayIds.map((id, i) => ({ slotIndex: i, role: ROLES[i], playerId: id })),
    },
    players,
    statistics: {
      home: {
        possessionTicks: 40,
        shots: 8,
        shotsOnTarget: 3,
        fouls: 2,
        corners: 4,
        yellowCards: 1,
      },
      away: {
        possessionTicks: 60,
        shots: 5,
        shotsOnTarget: 2,
        fouls: 3,
        corners: 1,
        yellowCards: 0,
      },
      players: [
        ...homeIds.map((id) => emptyRow(id, 'home')),
        ...awayIds.map((id) => emptyRow(id, 'away')),
      ],
    },
  } as unknown as MatchState;
}

describe('LFE-POST-MATCH-01', () => {
  it('builds score, goals, timeline and stats from events', () => {
    const summary = buildPostMatchSummary({
      matchState: fakeState(2, 1),
      events: [
        { type: 'MATCH_START', tick: 1 },
        { type: 'GOAL', tick: 100, payload: { side: 'home', minute: 12 } },
        { type: 'SHOT', tick: 200, payload: { side: 'away', minute: 40 } },
        { type: 'GOAL', tick: 300, payload: { side: 'away', minute: 55 } },
        { type: 'GOAL', tick: 400, payload: { side: 'home', minute: 78 } },
        { type: 'MATCH_END', tick: 500, payload: { minute: 90 } },
      ],
      homeName: 'FC Lastovia',
      awayName: 'Orzeł Grodzisk',
      homeShort: 'FCL',
      awayShort: 'ORG',
    });

    expect(summary.homeScore).toBe(2);
    expect(summary.awayScore).toBe(1);
    expect(summary.goals).toHaveLength(3);
    expect(summary.timeline.some((t) => t.type === 'MATCH_END')).toBe(true);
    expect(summary.possession.home + summary.possession.away).toBe(100);
    expect(summary.resultLabel).toContain('gospodarz');
  });

  it('T9: summary includes ratings + mvpPlayerId', () => {
    const summary = buildPostMatchSummary({
      matchState: fakeState(1, 0),
      events: [{ type: 'MATCH_END', tick: 1, payload: { minute: 90 } }],
      homeName: 'FC Lastovia',
      awayName: 'Orzeł Grodzisk',
      homeShort: 'FCL',
      awayShort: 'ORG',
    });

    expect(summary.ratings.home).toHaveLength(11);
    expect(summary.ratings.away).toHaveLength(11);
    expect(summary.mvpPlayerId).toBeTruthy();
    const mvp =
      summary.ratings.home.find((p) => p.playerId === summary.mvpPlayerId) ??
      summary.ratings.away.find((p) => p.playerId === summary.mvpPlayerId);
    expect(mvp?.isMvp).toBe(true);
    expect(
      summary.ratings.home.filter((p) => p.isMvp).length +
        summary.ratings.away.filter((p) => p.isMvp).length,
    ).toBe(1);
  });

  it('T10: score/goals/timeline/possession regression unchanged', () => {
    const summary = buildPostMatchSummary({
      matchState: fakeState(0, 0),
      events: [
        { type: 'MATCH_START', tick: 1 },
        { type: 'SHOT', tick: 50, payload: { side: 'home', minute: 10 } },
        { type: 'MATCH_END', tick: 100, payload: { minute: 90 } },
      ],
      homeName: 'A',
      awayName: 'B',
      homeShort: 'AAA',
      awayShort: 'BBB',
    });

    expect(summary.homeScore).toBe(0);
    expect(summary.awayScore).toBe(0);
    expect(summary.goals).toHaveLength(0);
    expect(summary.timeline).toHaveLength(3);
    expect(summary.possession).toEqual({ home: 40, away: 60 });
    expect(summary.stats.some((s) => s.label === 'Strzały')).toBe(true);
  });

  it('finds first replay frame containing event tick', () => {
    const buffer = createReplayBuffer({ capacity: 10 });
    const mk = (tick: number, events: MatchCanvasReadModel['events']): MatchCanvasReadModel =>
      ({
        matchId: 'm',
        tick,
        matchState: fakeState(1, 0, 'FIRST_HALF') as MatchCanvasReadModel['matchState'],
        spatial: {} as MatchCanvasReadModel['spatial'],
        events,
      }) as MatchCanvasReadModel;

    buffer.append(mk(50, [{ type: 'MATCH_START', tick: 1 }]));
    buffer.append(
      mk(120, [
        { type: 'MATCH_START', tick: 1 },
        { type: 'GOAL', tick: 100, payload: { side: 'home', minute: 10 } },
      ]),
    );
    buffer.append(
      mk(200, [
        { type: 'MATCH_START', tick: 1 },
        { type: 'GOAL', tick: 100, payload: { side: 'home', minute: 10 } },
        { type: 'SHOT', tick: 150 },
      ]),
    );

    expect(findReplayIndexForEvent(buffer, 100, 'GOAL')).toBe(1);
    expect(isMatchFinished(fakeState(0, 0, 'FINISHED'), [])).toBe(true);
    expect(isMatchFinished(fakeState(0, 0, 'FIRST_HALF'), [{ type: 'MATCH_END', tick: 9 }])).toBe(
      true,
    );
  });
});
