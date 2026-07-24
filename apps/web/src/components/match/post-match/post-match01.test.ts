/**
 * LFE-POST-MATCH-01 — summary + replay index helpers (no Engine / Replay mutations).
 */
import { describe, expect, it } from 'vitest';

import type { MatchCanvasReadModel } from '../../../gameplay/canvas-host';
import { createReplayBuffer } from '../../../gameplay/replay';

import {
  buildPostMatchSummary,
  findReplayIndexForEvent,
  isMatchFinished,
} from './build-post-match-summary';

function fakeState(scoreHome: number, scoreAway: number, phase = 'FINISHED') {
  return {
    phase,
    score: { home: scoreHome, away: scoreAway },
    clock: { displayMinute: 90, period: 'second_half' },
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
    },
  } as unknown as Parameters<typeof buildPostMatchSummary>[0]['matchState'];
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
