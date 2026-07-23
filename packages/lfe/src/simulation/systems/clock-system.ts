import { tickDurationMs } from '../../config';

import { SystemPriority } from '../priority';
import type { SimulationSystem, SystemContext } from '../system';

/** Advances simulation clock and syncs WorldState clock/rng mirrors. */
export function createClockSystem(): SimulationSystem {
  return {
    id: 'ClockSystem',
    priority: SystemPriority.CLOCK,
    execute(ctx: SystemContext) {
      ctx.clock.advance(ctx.config.ticksPerSecond);
      ctx.world.tick = ctx.clock.tick;
      ctx.world.clock = ctx.clock.snapshot();
      ctx.world.rng = ctx.rng.getState();
      ctx.world.settings.ticksPerSecond = ctx.config.ticksPerSecond;
      ctx.events.emit('CLOCK_TICK', ctx.tick, {
        elapsedMs: ctx.clock.elapsedMs,
        matchMinute: ctx.clock.matchMinute,
        dtMs: tickDurationMs(ctx.config.ticksPerSecond),
      });
      ctx.logger.debug('ClockSystem', undefined, ctx.tick);
    },
  };
}
