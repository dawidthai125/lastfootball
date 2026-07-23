import { describe, expect, it } from 'vitest';

import {
  FORMATION_442,
  createBench,
  createLineup,
  createMatchModel,
  createMatchState,
  createPlayer,
  createTeam,
  withMatchState,
} from './index';

function buildMinimalMatch() {
  const home = createTeam({
    id: 't-home',
    name: 'Home FC',
    shortName: 'HOM',
    side: 'home',
  });
  const away = createTeam({
    id: 't-away',
    name: 'Away United',
    shortName: 'AWY',
    side: 'away',
  });

  const homePlayers = Array.from({ length: 14 }, (_, i) =>
    createPlayer({
      id: `hp-${i}`,
      teamId: home.id,
      side: 'home',
      name: `Home ${i}`,
      shirtNumber: i + 1,
      preferredRole: i === 0 ? 'GK' : 'CM',
    }),
  );
  const awayPlayers = Array.from({ length: 14 }, (_, i) =>
    createPlayer({
      id: `ap-${i}`,
      teamId: away.id,
      side: 'away',
      name: `Away ${i}`,
      shirtNumber: i + 1,
      preferredRole: i === 0 ? 'GK' : 'CM',
    }),
  );

  const homeLineup = createLineup({
    side: 'home',
    formationCode: '4-4-2',
    playerIds: homePlayers.slice(0, 11).map((p) => p.id),
    formation: FORMATION_442,
  });
  const awayLineup = createLineup({
    side: 'away',
    formationCode: '4-4-2',
    playerIds: awayPlayers.slice(0, 11).map((p) => p.id),
  });

  const state = createMatchState({
    homeTeam: home,
    awayTeam: away,
    homeLineup,
    awayLineup,
    homeBench: createBench(
      'home',
      homePlayers.slice(11).map((p) => p.id),
    ),
    awayBench: createBench(
      'away',
      awayPlayers.slice(11).map((p) => p.id),
    ),
    players: [...homePlayers, ...awayPlayers],
  });

  return createMatchModel({ id: 'm-1', seed: 42, state });
}

describe('EPIC-2 match domain', () => {
  it('builds an immutable match aggregate', () => {
    const match = buildMinimalMatch();
    expect(match.seed).toBe(42);
    expect(match.state.players).toHaveLength(28);
    expect(match.state.statistics.players).toHaveLength(28);
    expect(match.state.statistics.players.every((p) => p.goals === 0)).toBe(true);
    expect(match.state.homeLineup.slots).toHaveLength(11);
    expect(match.state.goals).toHaveLength(2);
    expect(match.state.score).toEqual({ home: 0, away: 0 });
    expect(match.state.phase).toBe('PRE_MATCH');
  });

  it('round-trips through JSON (replay-friendly)', () => {
    const match = buildMinimalMatch();
    const json = JSON.stringify(match);
    const restored = JSON.parse(json) as typeof match;
    expect(restored).toEqual(match);
    expect(restored.state.ball.position).toEqual(match.state.pitch.centreSpot);
  });

  it('replaces state without mutating the original', () => {
    const match = buildMinimalMatch();
    const next = withMatchState(match, {
      ...match.state,
      phase: 'FIRST_HALF',
      tick: 1,
      score: { home: 1, away: 0 },
    });
    expect(match.state.phase).toBe('PRE_MATCH');
    expect(next.state.phase).toBe('FIRST_HALF');
    expect(next.state.score.home).toBe(1);
  });
});
