import { describe, expect, it } from 'vitest';

import {
  FORMATION_442,
  createBench,
  createLineup,
  createMatch,
  createPauseMatchCommand,
  createPlayer,
  type MatchSessionConfig,
} from './index';

function minimalConfig(seed = 42): MatchSessionConfig {
  const homePlayers = Array.from({ length: 14 }, (_, i) =>
    createPlayer({
      id: `hp-${i}`,
      teamId: 'home',
      side: 'home',
      name: `Home ${i}`,
      shirtNumber: i + 1,
      preferredRole: i === 0 ? 'GK' : 'CM',
    }),
  );
  const awayPlayers = Array.from({ length: 14 }, (_, i) =>
    createPlayer({
      id: `ap-${i}`,
      teamId: 'away',
      side: 'away',
      name: `Away ${i}`,
      shirtNumber: i + 1,
      preferredRole: i === 0 ? 'GK' : 'CM',
    }),
  );
  return {
    seed,
    matchId: `m-${seed}`,
    homeTeamId: 'home',
    awayTeamId: 'away',
    homeTeamName: 'Home FC',
    awayTeamName: 'Away Utd',
    homeLineup: createLineup({
      side: 'home',
      formationCode: '4-4-2',
      playerIds: homePlayers.slice(0, 11).map((p) => p.id),
      formation: FORMATION_442,
    }),
    awayLineup: createLineup({
      side: 'away',
      formationCode: '4-4-2',
      playerIds: awayPlayers.slice(0, 11).map((p) => p.id),
    }),
    homeBench: createBench(
      'home',
      homePlayers.slice(11).map((p) => p.id),
    ),
    awayBench: createBench(
      'away',
      awayPlayers.slice(11).map((p) => p.id),
    ),
    players: [...homePlayers, ...awayPlayers],
    engine: { logLevel: 'silent', snapshotHistoryLimit: 30 },
  };
}

describe('EPIC-6 MatchSession', () => {
  it('createMatch yields ready session owning world + commands', () => {
    const session = createMatch(minimalConfig());
    expect(session.status).toBe('ready');
    expect(session.getMatchState().phase).toBe('PRE_MATCH');
    expect(session.getWorld().match.seed).toBe(42);
    expect(session.context().commands).toBeDefined();
    expect(session.context().scheduler).toBeDefined();
  });

  it('start → step → pause → resume → stop → dispose', () => {
    const session = createMatch(minimalConfig(7));
    expect(session.start().ok).toBe(true);
    expect(session.status).toBe('running');

    session.run(3);
    expect(session.context().tick).toBe(3);
    expect(session.snapshots().length).toBe(3);

    expect(session.pause().ok).toBe(true);
    expect(session.status).toBe('paused');

    expect(session.resume().ok).toBe(true);
    expect(session.status).toBe('running');

    expect(session.stop().ok).toBe(true);
    expect(session.status).toBe('stopped');

    session.dispose();
    expect(session.status).toBe('disposed');
    expect(() => session.step()).toThrow(/disposed/);
  });

  it('dispatch uses the session CommandBus', () => {
    const session = createMatch(minimalConfig(9));
    session.start();
    const result = session.dispatch(
      createPauseMatchCommand({ tick: session.context().tick, source: 'test' }),
    );
    expect(result.ok).toBe(true);
    expect(session.context().time.isPaused()).toBe(true);
  });

  it('runToEnd returns a MatchResult without throwing', () => {
    const session = createMatch(minimalConfig(11));
    const result = session.runToEnd(50);
    expect(result.completed).toBe(true);
    expect(typeof result.homeGoals).toBe('number');
    expect(session.status).toBe('stopped');
  });
});
