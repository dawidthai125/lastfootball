import { captureSnapshot } from '../../replay';

import { SystemPriority } from '../priority';
import type { SimulationSystem, SystemContext } from '../system';

/**
 * Captures a replay snapshot for the tick into the snapshot buffer.
 * Final snapshot phase in the pipeline is a no-op if ReplaySystem already wrote.
 */
export function createReplaySystem(): SimulationSystem {
  return {
    id: 'ReplaySystem',
    priority: SystemPriority.REPLAY,
    execute(ctx: SystemContext) {
      const tickEvents =
        ctx.tickEvents.length > 0
          ? ctx.tickEvents
          : ctx.events.history().filter((e) => e.tick === ctx.tick);
      const snap = captureSnapshot(ctx.world, tickEvents);
      ctx.snapshots.push(snap);
      ctx.lastSnapshot = snap;
      ctx.logger.debug('ReplaySystem snapshot', undefined, ctx.tick);
    },
  };
}
