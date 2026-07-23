import { describe, expect, it } from 'vitest';

import {
  createBench,
  createLineup,
  createMatch,
  createPlayer,
  createSetPressingCommand,
  createSubstitutePlayerCommand,
  GAMEPLAY_MATCH_EVENTS,
} from '../index';

describe('GAMEPLAY-01 foundation', () => {
  function session() {
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
      createPlayer({
        id: 'h-bench',
        teamId: 'home',
        side: 'home',
        name: 'Bench',
        shirtNumber: 12,
        preferredRole: 'ST',
      }),
    ];

    return createMatch({
      seed: 42,
      homeTeamId: 'home',
      awayTeamId: 'away',
      homeLineup: createLineup({ side: 'home', formationCode: '4-4-2', playerIds: homeIds }),
      awayLineup: createLineup({ side: 'away', formationCode: '4-4-2', playerIds: awayIds }),
      homeBench: createBench('home', ['h-bench']),
      awayBench: createBench('away', []),
      players,
    });
  }

  it('exposes gameplay match event vocabulary', () => {
    expect(GAMEPLAY_MATCH_EVENTS).toContain('GOAL');
    expect(GAMEPLAY_MATCH_EVENTS).toContain('SUBSTITUTION');
    expect(GAMEPLAY_MATCH_EVENTS).toContain('FORMATION_CHANGE');
    expect(GAMEPLAY_MATCH_EVENTS).toContain('VAR');
  });

  it('MatchState is sole score/tactics source after start', () => {
    const s = session();
    s.start();
    const state = s.getMatchState();
    expect(state.score.home).toBe(0);
    expect(state.tactics.pressing).toBe(50);
    expect(s.context().events.history().some((e) => e.type === 'MATCH_START')).toBe(true);
  });

  it('CommandBus SetPressing mutates MatchState and records EventBus event', () => {
    const s = session();
    s.start();
    const result = s.dispatch(createSetPressingCommand({ tick: 0, source: 'ui', value: 80 }));
    expect(result.ok).toBe(true);
    expect(s.getMatchState().tactics.pressing).toBe(80);
    expect(result.events.some((e) => e.type === 'SYSTEM')).toBe(true);
  });

  it('SubstitutePlayer swaps lineup via CommandBus', () => {
    const s = session();
    s.start();
    const result = s.dispatch(
      createSubstitutePlayerCommand({
        tick: 0,
        source: 'ui',
        side: 'home',
        playerOutId: 'h10',
        playerInId: 'h-bench',
      }),
    );
    expect(result.ok).toBe(true);
    expect(s.getMatchState().homeLineup.slots.some((x) => x.playerId === 'h-bench')).toBe(true);
    expect(s.getMatchState().homeBench.playerIds).toContain('h10');
    expect(result.events.some((e) => e.type === 'SUBSTITUTION')).toBe(true);
  });
});
