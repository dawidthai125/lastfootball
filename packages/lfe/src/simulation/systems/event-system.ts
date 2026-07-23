import { SystemPriority } from '../priority';
import type { SimulationSystem, SystemContext } from '../system';

/** Flushes the event bus into world.events and ctx.tickEvents. */
export function createEventSystem(): SimulationSystem {
  return {
    id: 'EventSystem',
    priority: SystemPriority.EVENT,
    execute(ctx: SystemContext) {
      const flushed = ctx.events.flush();
      ctx.tickEvents = flushed;
      ctx.world.events = ctx.events.history().slice();
      ctx.logger.debug(`EventSystem flushed=${flushed.length}`, undefined, ctx.tick);
    },
  };
}
