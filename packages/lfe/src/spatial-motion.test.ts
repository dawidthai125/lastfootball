import { describe, expect, it } from 'vitest';

import {
  createBench,
  createKickoffCommand,
  createLineup,
  createMatch,
  createPlayer,
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
});
