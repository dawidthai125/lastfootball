import { SystemPriority } from '../priority';
import type { SimulationSystem, SystemContext } from '../system';

/** Runs due scheduled jobs for the current tick. */
export function createSchedulerSystem(): SimulationSystem {
  return {
    id: 'SchedulerSystem',
    priority: SystemPriority.SCHEDULER,
    execute(ctx: SystemContext) {
      const ran = ctx.scheduler.runDue(ctx.tick);
      ctx.logger.debug(`SchedulerSystem ran=${ran}`, undefined, ctx.tick);
    },
  };
}
