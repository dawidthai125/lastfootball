import { applyLifecycleEvent } from '../../match/state-machine';
import type { MatchLifecycleState } from '../../match/state-machine';

import { SystemPriority } from '../priority';
import type { SimulationSystem, SystemContext } from '../system';

function syncMatchMeta(ctx: SystemContext, phase: MatchLifecycleState): void {
  if (phase === 'FINISHED') {
    ctx.world.match.status = 'finished';
  } else if (phase === 'PRE_MATCH' || phase === 'LINEUP') {
    ctx.world.match.status = 'idle';
  } else {
    ctx.world.match.status = 'running';
  }
}

/**
 * Drains lifecycleQueue and applies EPIC-3 transitions when matchState is bound.
 * Without matchState: maps coarse MATCH meta only from queue COMPLETE/ABANDON hints.
 */
export function createLifecycleSystem(): SimulationSystem {
  return {
    id: 'LifecycleSystem',
    priority: SystemPriority.LIFECYCLE,
    execute(ctx: SystemContext) {
      if (ctx.lifecycleQueue.length === 0) return;

      const facts = ctx.lifecycleFacts;
      const lifecycleCtx = {
        tick: ctx.tick,
        homeLineupConfirmed: facts.homeLineupConfirmed,
        awayLineupConfirmed: facts.awayLineupConfirmed,
        enableExtraTime: facts.enableExtraTime,
        enablePenalties: facts.enablePenalties,
        scoreTied: facts.scoreTied,
      };

      const queue = ctx.lifecycleQueue.splice(0, ctx.lifecycleQueue.length);

      if (ctx.matchState) {
        let phase = ctx.matchState.phase;
        for (const event of queue) {
          const result = applyLifecycleEvent(phase, event, lifecycleCtx);
          if (result.ok) {
            phase = result.to;
            ctx.matchState = Object.freeze({
              ...ctx.matchState,
              phase,
              tick: event.tick,
            });
            ctx.events.emit('SYSTEM', event.tick, {
              kind: 'lifecycle',
              from: result.from,
              to: result.to,
              event: event.type,
            });
          } else {
            ctx.logger.warn(
              `LifecycleSystem rejected ${event.type}: ${result.reason}`,
              undefined,
              ctx.tick,
            );
          }
        }
        syncMatchMeta(ctx, phase);
      } else {
        for (const event of queue) {
          if (
            event.type === 'COMPLETE_MATCH' ||
            event.type === 'ABANDON_MATCH' ||
            event.type === 'DECLARE_WALKOVER'
          ) {
            ctx.world.match.status = 'finished';
          } else if (event.type === 'OPEN_PLAY' || event.type === 'START_SECOND_HALF') {
            ctx.world.match.status = 'running';
          }
          ctx.events.emit('SYSTEM', event.tick, {
            kind: 'lifecycle_unbound',
            event: event.type,
          });
        }
      }
    },
  };
}
