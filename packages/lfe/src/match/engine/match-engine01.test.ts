import { describe, expect, it } from 'vitest';

import {
  createBench,
  createKickoffCommand,
  createLineup,
  createMatch,
  createPlayer,
} from '../../index';

function makeSession(halfDurationMs = 2_000, halfTimeDurationMs = 200) {
  const homeIds = Array.from({ length: 11 }, (_, i) => `h${i}`);
  const awayIds = Array.from({ length: 11 }, (_, i) => `a${i}`);
  const players = [
    ...homeIds.map((id, i) =>
      createPlayer({
        id,
        teamId: 'home',
        side: 'home',
        name: `H${i}`,
        shirtNumber: i + 1,
        preferredRole: 'CM',
      }),
    ),
    ...awayIds.map((id, i) =>
      createPlayer({
        id,
        teamId: 'away',
        side: 'away',
        name: `A${i}`,
        shirtNumber: i + 1,
        preferredRole: 'CM',
      }),
    ),
  ];

  return createMatch({
    seed: 7,
    homeTeamId: 'home',
    awayTeamId: 'away',
    homeLineup: createLineup({ side: 'home', formationCode: '4-4-2', playerIds: homeIds }),
    awayLineup: createLineup({ side: 'away', formationCode: '4-4-2', playerIds: awayIds }),
    homeBench: createBench('home', []),
    awayBench: createBench('away', []),
    players,
    settings: {
      halfDurationMs,
      halfTimeDurationMs,
      enableExtraTime: false,
      enablePenalties: false,
    },
  });
}

function openPlay(session: ReturnType<typeof makeSession>) {
  session.start();
  session.step(); // PREPARE+CONFIRM → KICKOFF
  session.dispatch(createKickoffCommand({ tick: session.context().tick, source: 'system' }));
  session.step(); // OPEN_PLAY → FIRST_HALF (+ engine tick)
}

describe('MATCH-ENGINE-01', () => {
  it('opens first half and advances MatchClock', () => {
    const s = makeSession(5_000);
    openPlay(s);
    expect(s.getMatchState().phase).toBe('FIRST_HALF');
    const before = s.getMatchState().clock.displayMinute;
    s.run(40);
    expect(s.getMatchState().clock.displayMinute).toBeGreaterThan(before);
    expect(s.getMatchState().clock.frozen).toBe(false);
  });

  it('emits POSSESSION / SHOT / GOAL class events via EventBus', () => {
    const s = makeSession(8_000);
    openPlay(s);
    s.run(400);
    const types = new Set(
      s
        .context()
        .events.history()
        .map((e) => e.type),
    );
    expect(types.has('POSSESSION')).toBe(true);
    expect(types.has('ATTACK') || types.has('SHOT') || types.has('FOUL')).toBe(true);
  });

  it('completes both halves and finishes match deterministically', () => {
    const s = makeSession(1_000, 100);
    openPlay(s);
    // Enough ticks for both halves + HT at 20 tps (50ms): 1000ms/50=20 ticks/half
    s.run(200);
    const phase = s.getMatchState().phase;
    expect(['FULL_TIME', 'FINISHED', 'HALF_TIME', 'SECOND_HALF'].includes(phase)).toBe(true);
    s.run(400);
    expect(s.getMatchState().phase).toBe('FINISHED');
    const hist = s.context().events.history();
    expect(hist.some((e) => e.type === 'HALF_END')).toBe(true);
    expect(hist.some((e) => e.type === 'MATCH_END')).toBe(true);
  });

  it('is deterministic for the same seed', () => {
    const a = makeSession(3_000, 100);
    const b = makeSession(3_000, 100);
    openPlay(a);
    openPlay(b);
    a.run(120);
    b.run(120);
    expect(a.getMatchState().score).toEqual(b.getMatchState().score);
    expect(a.getMatchState().clock.displayMinute).toBe(b.getMatchState().clock.displayMinute);
    expect(
      a
        .context()
        .events.history()
        .map((e) => e.type),
    ).toEqual(
      b
        .context()
        .events.history()
        .map((e) => e.type),
    );
  });
});
