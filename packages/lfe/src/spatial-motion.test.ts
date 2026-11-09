import { describe, expect, it } from 'vitest';

import { advanceMatchSpatialState } from './match/positioning/spatial-motion';
import type { MatchSpatialState } from './match/positioning/spatial-state';
import {
  createBench,
  createKickoffCommand,
  createLineup,
  createMatch,
  createPlayer,
  createSubstitutePlayerCommand,
} from './testing';

function players(side: 'home' | 'away', teamId: string) {
  return Array.from({ length: 11 }, (_, index) =>
    createPlayer({
      id: `${side}-${index}`,
      teamId,
      side,
      name: `${side} ${index}`,
      shirtNumber: index + 1,
      preferredRole: index === 0 ? 'GK' : index > 7 ? 'ST' : 'CM',
    }),
  );
}

function openSession(seed = 42) {
  const home = players('home', 'home');
  const away = players('away', 'away');
  const session = createMatch({
    seed,
    homeTeamId: 'home',
    awayTeamId: 'away',
    homeLineup: createLineup({
      side: 'home',
      formationCode: '4-4-2',
      playerIds: home.map((player) => player.id),
    }),
    awayLineup: createLineup({
      side: 'away',
      formationCode: '4-4-2',
      playerIds: away.map((player) => player.id),
    }),
    homeBench: createBench('home', []),
    awayBench: createBench('away', []),
    players: [...home, ...away],
    engine: { logLevel: 'silent' },
  });
  session.start();
  session.step();
  session.dispatch(createKickoffCommand({ tick: session.context().tick, source: 'system' }));
  session.step();
  return session;
}

describe('spatial movement thin', () => {
  it('updates player and ball coordinates after open-play ticks', () => {
    const session = openSession();
    const before = session.getSpatialState();

    session.run(80);
    const after = session.getSpatialState();

    expect(after.players).toHaveLength(22);
    expect(after.ball.position).not.toEqual(before.ball.position);
    expect(
      after.players.some((player, index) => player.position !== before.players[index]?.position),
    ).toBe(true);
    expect(JSON.parse(JSON.stringify(after)).players).toHaveLength(22);
  });

  it('produces the same spatial state for the same match seed and ticks', () => {
    const first = openSession(73);
    const second = openSession(73);

    first.run(120);
    second.run(120);

    expect(second.getSpatialState()).toEqual(first.getSpatialState());
  });

  it('keeps open play on one half when no event names a side', () => {
    const session = openSession(3);
    const base = withBall(session.getSpatialState(), 52.5, 34);
    const matchState = session.getMatchState();
    const even = advanceMatchSpatialState({
      previous: base,
      matchState,
      tick: 8,
      events: [],
    });
    const odd = advanceMatchSpatialState({
      previous: base,
      matchState,
      tick: 9,
      events: [],
    });

    expect(even.ball.position.x).toBeGreaterThan(52.5);
    expect(odd.ball.position.x).toBeGreaterThan(52.5);
  });

  it('restarts the ball at the centre after a goal', () => {
    const session = openSession(3);
    const base = withBall(session.getSpatialState(), 52.5, 34);
    const matchState = session.getMatchState();
    const goal = advanceMatchSpatialState({
      previous: base,
      matchState,
      tick: 9,
      events: [{ type: 'GOAL', tick: 9, payload: { side: 'home' } }],
    });
    const open = advanceMatchSpatialState({
      previous: base,
      matchState,
      tick: 9,
      events: [{ type: 'POSSESSION', tick: 9, payload: { side: 'home' } }],
    });

    expect(goal.ball.position).toEqual({ x: 52.5, y: 34 });
    expect(open.ball.position.x).toBeGreaterThan(52.5);
  });

  it('pulls the ball to the attacking corner', () => {
    const session = openSession(3);
    const base = withBall(session.getSpatialState(), 52.5, 34);
    const matchState = session.getMatchState();
    const corner = advanceMatchSpatialState({
      previous: base,
      matchState,
      tick: 9,
      events: [{ type: 'CORNER', tick: 9, payload: { side: 'home' } }],
    });
    const open = advanceMatchSpatialState({
      previous: base,
      matchState,
      tick: 9,
      events: [{ type: 'POSSESSION', tick: 9, payload: { side: 'home' } }],
    });

    expect(corner.ball.position.x).toBeGreaterThan(open.ball.position.x);
  });

  it('drops a goal restart after the short window', () => {
    const session = openSession(3);
    const base = withBall(session.getSpatialState(), 52.5, 34);
    const matchState = session.getMatchState();
    const later = advanceMatchSpatialState({
      previous: base,
      matchState,
      tick: 50,
      events: [{ type: 'GOAL', tick: 9, payload: { side: 'home' } }],
    });

    expect(later.ball.position).not.toEqual({ x: 52.5, y: 34 });
  });

  it('puts a new lineup player on the pitch and drops the one who left', () => {
    const session = openSession(3);
    const spatial = session.getSpatialState();
    const matchState = session.getMatchState();
    const dropped = spatial.players[0]!;
    const trimmed = { ...spatial, players: spatial.players.slice(1) };
    const next = advanceMatchSpatialState({
      previous: trimmed,
      matchState,
      tick: 9,
      events: [],
    });

    expect(next.players).toHaveLength(22);
    expect(next.players.some((player) => player.playerId === dropped.playerId)).toBe(true);
    expect(next.players.some((player) => player.playerId === 'not-in-lineup')).toBe(false);
  });

  it('puts the substitute on the paused pitch without a simulation tick', () => {
    const home = players('home', 'home');
    const away = players('away', 'away');
    const bench = createPlayer({
      id: 'home-bench',
      teamId: 'home',
      side: 'home',
      name: 'home bench',
      shirtNumber: 12,
      preferredRole: 'ST',
    });
    const session = createMatch({
      seed: 3,
      homeTeamId: 'home',
      awayTeamId: 'away',
      homeLineup: createLineup({
        side: 'home',
        formationCode: '4-4-2',
        playerIds: home.map((player) => player.id),
      }),
      awayLineup: createLineup({
        side: 'away',
        formationCode: '4-4-2',
        playerIds: away.map((player) => player.id),
      }),
      homeBench: createBench('home', ['home-bench']),
      awayBench: createBench('away', []),
      players: [...home, ...away, bench],
      engine: { logLevel: 'silent' },
    });
    session.start();
    session.step();
    session.dispatch(createKickoffCommand({ tick: session.context().tick, source: 'system' }));
    session.run(40);
    const paused = session.pause();
    expect(paused.ok).toBe(true);

    const before = session.getSpatialState();
    const tick = session.context().tick;
    const outgoing = before.players.find((player) => player.playerId === 'home-10');
    const stayer = before.players.find((player) => player.playerId === 'home-5');
    expect(outgoing).toBeDefined();
    expect(stayer).toBeDefined();

    const result = session.dispatch(
      createSubstitutePlayerCommand({
        tick,
        source: 'ui',
        side: 'home',
        playerOutId: 'home-10',
        playerInId: 'home-bench',
      }),
    );
    const after = session.getSpatialState();
    const incoming = after.players.find((player) => player.playerId === 'home-bench');
    const still = after.players.find((player) => player.playerId === 'home-5');

    expect(result.ok).toBe(true);
    expect(session.status).toBe('paused');
    expect(session.context().tick).toBe(tick);
    expect(after.players).toHaveLength(22);
    expect(after.players.some((player) => player.playerId === 'home-10')).toBe(false);
    expect(incoming?.position).toEqual(outgoing?.position);
    expect(incoming?.facing).toBe(outgoing?.facing);
    expect(still?.position).toEqual(stayer?.position);
    expect(after.ball).toEqual(before.ball);
  });
});

function withBall(state: MatchSpatialState, x: number, y: number): MatchSpatialState {
  return {
    ...state,
    ball: { position: { x, y } },
  };
}
