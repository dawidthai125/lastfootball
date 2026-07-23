import { isPlayLifecycleState } from '../../match/state-machine';
import { simulateMatchTick } from '../../match/engine';

import { SystemPriority } from '../priority';
import type { SimulationSystem, SystemContext } from '../system';

/**
 * Match Engine system — GAMEPLAY priority.
 * Mutates MatchState + emits EventBus; never talks to UI.
 */
export function createMatchEngineSystem(): SimulationSystem {
  return {
    id: 'MatchEngineSystem',
    priority: SystemPriority.GAMEPLAY,
    execute(ctx: SystemContext) {
      if (!ctx.matchState) return;
      const phase = ctx.matchState.phase;
      if (!isPlayLifecycleState(phase) && phase !== 'HALF_TIME' && phase !== 'FULL_TIME') {
        return;
      }
      // FULL_TIME: nothing to simulate (COMPLETE already queued from second half end)
      if (phase === 'FULL_TIME' || phase === 'FINISHED') return;

      const halfDurationMs = ctx.lifecycleFacts.halfDurationMs;
      const halfTimeDurationMs = ctx.lifecycleFacts.halfTimeDurationMs;

      const result = simulateMatchTick(ctx.matchState, {
        tick: ctx.tick,
        dtMs: ctx.dtMs,
        rng: ctx.rng,
        halfDurationMs,
        halfTimeDurationMs,
      });

      ctx.matchState = result.state;
      for (const e of result.emits) {
        ctx.events.emit(e.type, ctx.tick, e.payload);
      }
      for (const life of result.lifecycle) {
        ctx.lifecycleQueue.push(life);
      }
    },
  };
}
