/**
 * Single-tick pipeline:
 * update → systems → events → snapshot → next
 */

export interface TickPhaseContext {
  tick: number;
}

export interface TickPhases {
  update: (ctx: TickPhaseContext) => void;
  systems: (ctx: TickPhaseContext) => void;
  events: (ctx: TickPhaseContext) => void;
  snapshot: (ctx: TickPhaseContext) => void;
}

export interface TickEngine {
  /** Execute one full tick pipeline. */
  runTick(tick: number): void;
}

export function createTickEngine(phases: TickPhases): TickEngine {
  return {
    runTick(tick) {
      const ctx: TickPhaseContext = { tick };
      phases.update(ctx);
      phases.systems(ctx);
      phases.events(ctx);
      phases.snapshot(ctx);
    },
  };
}
