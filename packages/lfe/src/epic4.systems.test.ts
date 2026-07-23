import { describe, expect, it } from 'vitest';

import {
  SystemPriority,
  createBuiltinSystems,
  createBench,
  createLineup,
  createMatchState,
  createPlayer,
  createSimulation,
  createSystemRegistry,
  createTeam,
} from './index';

describe('EPIC-4 simulation systems', () => {
  it('orders builtin systems by explicit priority, not registration order', () => {
    const registry = createSystemRegistry();
    for (const s of [...createBuiltinSystems()].reverse()) {
      registry.registerSystem(s);
    }

    expect(registry.list()).toEqual([
      'ClockSystem',
      'SchedulerSystem',
      'LifecycleSystem',
      'MatchEngineSystem',
      'EventSystem',
      'ReplaySystem',
    ]);
    expect(registry.get('ClockSystem')?.priority).toBe(SystemPriority.CLOCK);
    expect(registry.get('ReplaySystem')?.priority).toBe(SystemPriority.REPLAY);
  });

  it('places custom GAMEPLAY systems between Lifecycle and Event', () => {
    const sim = createSimulation({ seed: 3, config: { logLevel: 'silent' } });
    sim.systems.registerSystem({
      id: 'ProbeGameplay',
      priority: SystemPriority.GAMEPLAY,
      execute() {},
    });

    const ids = sim.systems.list();
    expect(ids.indexOf('LifecycleSystem')).toBeLessThan(ids.indexOf('ProbeGameplay'));
    expect(ids.indexOf('ProbeGameplay')).toBeLessThan(ids.indexOf('EventSystem'));
  });

  it('pipeline still emits CLOCK_TICK and snapshots each step', () => {
    const sim = createSimulation({ seed: 11, config: { snapshotHistoryLimit: 20 } });
    sim.run(5);
    expect(sim.clock.tick).toBe(5);
    expect(sim.events.history().filter((e) => e.type === 'CLOCK_TICK')).toHaveLength(5);
    expect(sim.snapshots()).toHaveLength(5);
  });

  it('LifecycleSystem applies queued transitions when matchState is bound', () => {
    const home = createTeam({ id: 'h', name: 'H', shortName: 'H', side: 'home' });
    const away = createTeam({ id: 'a', name: 'A', shortName: 'A', side: 'away' });
    const players = [
      ...Array.from({ length: 11 }, (_, i) =>
        createPlayer({
          id: `h${i}`,
          teamId: 'h',
          side: 'home',
          name: `H${i}`,
          shirtNumber: i + 1,
          preferredRole: 'CM',
        }),
      ),
      ...Array.from({ length: 11 }, (_, i) =>
        createPlayer({
          id: `a${i}`,
          teamId: 'a',
          side: 'away',
          name: `A${i}`,
          shirtNumber: i + 1,
          preferredRole: 'CM',
        }),
      ),
    ];
    const matchState = createMatchState({
      homeTeam: home,
      awayTeam: away,
      homeLineup: createLineup({
        side: 'home',
        formationCode: '4-4-2',
        playerIds: players.slice(0, 11).map((p) => p.id),
      }),
      awayLineup: createLineup({
        side: 'away',
        formationCode: '4-4-2',
        playerIds: players.slice(11).map((p) => p.id),
      }),
      homeBench: createBench('home', []),
      awayBench: createBench('away', []),
      players,
    });

    const sim = createSimulation({
      seed: 1,
      config: { logLevel: 'silent' },
      matchState,
    });
    sim.setLifecycleFacts({ homeLineupConfirmed: true, awayLineupConfirmed: true });
    sim.enqueueLifecycle({ type: 'PREPARE_LINEUPS', tick: 1 });
    sim.step();
    expect(sim.getMatchState()?.phase).toBe('LINEUP');
    sim.enqueueLifecycle({ type: 'CONFIRM_LINEUPS', tick: 2 });
    sim.step();
    expect(sim.getMatchState()?.phase).toBe('KICKOFF');
  });
});
