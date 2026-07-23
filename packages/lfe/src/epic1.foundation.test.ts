import { describe, expect, it } from 'vitest';

import { createEventBus } from './events';
import { createRng } from './rng';
import { createScheduler } from './scheduler';
import { createSimulation } from './simulation';
import { DEFAULT_LFE_CONFIG, tickDurationMs } from './config';

describe('RNG', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('diverges for different seeds', () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a.next()).not.toBe(b.next());
  });
});

describe('Event Bus', () => {
  it('queues then flushes to subscribers', () => {
    const bus = createEventBus();
    const seen: string[] = [];
    bus.on('GOAL', (e) => seen.push(e.type));
    bus.emit('GOAL', 3, { side: 'home' });
    expect(bus.peek()).toHaveLength(1);
    expect(seen).toEqual([]);
    const flushed = bus.flush();
    expect(flushed).toHaveLength(1);
    expect(seen).toEqual(['GOAL']);
    expect(bus.peek()).toHaveLength(0);
  });
});

describe('Scheduler', () => {
  it('runs jobs after N ticks', () => {
    let tick = 0;
    const fired: number[] = [];
    const scheduler = createScheduler({
      ticksPerSecond: 20,
      getCurrentTick: () => tick,
    });
    scheduler.scheduleInTicks(5, (t) => fired.push(t));
    for (tick = 1; tick <= 5; tick += 1) {
      scheduler.runDue(tick);
    }
    expect(fired).toEqual([5]);
  });

  it('converts seconds using ticksPerSecond', () => {
    let tick = 0;
    const fired: number[] = [];
    const scheduler = createScheduler({
      ticksPerSecond: 20,
      getCurrentTick: () => tick,
    });
    scheduler.scheduleInSeconds(1, (t) => fired.push(t)); // 20 ticks
    for (tick = 1; tick <= 20; tick += 1) {
      scheduler.runDue(tick);
    }
    expect(fired).toEqual([20]);
  });
});

describe('Simulation loop', () => {
  it('uses 20 ticks per second by default', () => {
    expect(DEFAULT_LFE_CONFIG.ticksPerSecond).toBe(20);
    expect(tickDurationMs(20)).toBe(50);
  });

  it('advances clock and emits CLOCK_TICK each step', () => {
    const sim = createSimulation({ seed: 7, config: { snapshotHistoryLimit: 50 } });
    sim.start();
    sim.run(10);
    expect(sim.clock.tick).toBe(10);
    expect(sim.clock.elapsedMs).toBe(500);
    const ticks = sim.events.history().filter((e) => e.type === 'CLOCK_TICK');
    expect(ticks).toHaveLength(10);
    expect(sim.snapshots()).toHaveLength(10);
  });

  it('produces identical snapshots for the same seed', () => {
    const a = createSimulation({ seed: 99, config: { logLevel: 'silent' } });
    const b = createSimulation({ seed: 99, config: { logLevel: 'silent' } });
    a.systems.register('probe', (world) => {
      world.players.push(a.rng.next());
    });
    b.systems.register('probe', (world) => {
      world.players.push(b.rng.next());
    });
    a.run(40);
    b.run(40);
    expect(a.latestSnapshot()?.world).toEqual(b.latestSnapshot()?.world);
    expect(a.rng.getState()).toEqual(b.rng.getState());
  });

  it('fires scheduler callbacks inside the tick pipeline', () => {
    const sim = createSimulation({ seed: 1, config: { logLevel: 'silent' } });
    const hits: number[] = [];
    sim.scheduler.scheduleInTicks(3, (t) => hits.push(t));
    sim.run(3);
    expect(hits).toEqual([3]);
  });
});
