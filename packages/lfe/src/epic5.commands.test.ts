import { describe, expect, it, beforeEach } from 'vitest';

import {
  createAbandonMatchCommand,
  createDeclareWalkoverCommand,
  createPauseMatchCommand,
  createResumeMatchCommand,
  createSimulation,
  createStartMatchCommand,
  resetCommandIdSeq,
} from './index';

describe('EPIC-5 match commands', () => {
  beforeEach(() => {
    resetCommandIdSeq();
  });

  it('dispatches StartMatch through CommandBus', () => {
    const sim = createSimulation({ seed: 1, config: { logLevel: 'silent' } });
    const result = sim.dispatch(createStartMatchCommand({ tick: 0, source: 'test' }));
    expect(result.ok).toBe(true);
    expect(result.events.some((e) => e.type === 'MATCH_START')).toBe(true);
    expect(sim.world.match.status).toBe('running');
  });

  it('rejects invalid DeclareWalkover without winner', () => {
    const sim = createSimulation({ seed: 1, config: { logLevel: 'silent' } });
    sim.start();
    const bad = {
      id: 'cmd-bad',
      type: 'DeclareWalkover' as const,
      tick: 0,
      source: 'test' as const,
      payload: {} as { winner: 'home' | 'away' },
    };
    const result = sim.dispatch(bad);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVALID_WINNER')).toBe(true);
  });

  it('pause / resume go through the same bus', () => {
    const sim = createSimulation({ seed: 2, config: { logLevel: 'silent' } });
    sim.start();
    const pause = sim.dispatch(createPauseMatchCommand({ tick: 0, source: 'ui' }));
    expect(pause.ok).toBe(true);
    expect(sim.time.isPaused()).toBe(true);
    const resume = sim.dispatch(createResumeMatchCommand({ tick: 0, source: 'ui' }));
    expect(resume.ok).toBe(true);
    expect(sim.time.isPaused()).toBe(false);
  });

  it('commands are JSON-serializable', () => {
    const cmd = createAbandonMatchCommand({ tick: 5, source: 'multiplayer', reason: 'rage' });
    const roundTrip = JSON.parse(JSON.stringify(cmd));
    expect(roundTrip).toEqual(cmd);
  });

  it('walkover finishes the match', () => {
    const sim = createSimulation({ seed: 3, config: { logLevel: 'silent' } });
    sim.start();
    const result = sim.dispatch(
      createDeclareWalkoverCommand({ tick: 0, source: 'test', winner: 'away' }),
    );
    expect(result.ok).toBe(true);
    expect(sim.world.match.status).toBe('finished');
  });

  it('start() and end() use CommandBus', () => {
    const sim = createSimulation({ seed: 4, config: { logLevel: 'silent' } });
    expect(sim.start().ok).toBe(true);
    expect(sim.end().ok).toBe(true);
    expect(sim.world.match.status).toBe('finished');
    expect(sim.start().ok).toBe(false);
  });
});
