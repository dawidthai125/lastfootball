import type { Command, CommandResult } from '../../commands';
import {
  createEndMatchCommand,
  createPauseMatchCommand,
  createResumeMatchCommand,
  createStartMatchCommand,
} from '../../commands';
import type { ReplaySnapshot } from '../../replay';
import { createSimulation } from '../../simulation';
import type { MatchState } from '../domain';
import { createMatchSpatialState } from '../positioning';
import type { MatchSpatialState } from '../positioning';
import type { MatchEvent, MatchResult } from '../types';
import type { WorldState } from '../../world';

import { buildMatchFromConfig } from './build-match';
import { createSessionLifecycle } from './lifecycle';
import type { MatchSession, MatchSessionContext } from './session';
import type { MatchSessionConfig } from './types';

function assertNotDisposed(status: string, op: string): void {
  if (status === 'disposed') {
    throw new Error(`MatchSession.${op}: session is disposed`);
  }
}

/**
 * Creates a MatchSession — the sole public entry to run a match.
 * Owns World, Pipeline, CommandBus, Match State Machine binding, Scheduler, Replay.
 */
export function createMatch(config: MatchSessionConfig): MatchSession {
  const match = buildMatchFromConfig(config);
  const lifecycle = createSessionLifecycle('created');

  const simulation = createSimulation({
    seed: config.seed,
    config: config.engine,
    logger: config.logger,
    matchState: match.state,
  });

  simulation.setLifecycleFacts({
    homeLineupConfirmed: true,
    awayLineupConfirmed: true,
    enableExtraTime: match.settings.enableExtraTime,
    enablePenalties: match.settings.enablePenalties,
    scoreTied: false,
    halfDurationMs: match.settings.halfDurationMs,
    halfTimeDurationMs: match.settings.halfTimeDurationMs,
  });

  lifecycle.transition('ready');

  let disposed = false;
  let spatial: MatchSpatialState = createMatchSpatialState(match.state);

  function syncScoreTied(): void {
    const state = simulation.getMatchState();
    if (!state) return;
    simulation.setLifecycleFacts({
      scoreTied: state.score.home === state.score.away,
    });
  }

  function requireActive(op: string): void {
    assertNotDisposed(lifecycle.status, op);
    if (lifecycle.status === 'stopped') {
      throw new Error(`MatchSession.${op}: session is stopped`);
    }
  }

  const session: MatchSession = {
    get id() {
      return match.id;
    },
    get status() {
      return lifecycle.status;
    },
    get config() {
      return config;
    },

    context(): MatchSessionContext {
      assertNotDisposed(lifecycle.status, 'context');
      const matchState = simulation.getMatchState() ?? match.state;
      return {
        sessionId: match.id,
        status: lifecycle.status,
        seed: match.seed,
        tick: simulation.clock.tick,
        phase: matchState.phase,
        world: simulation.world,
        match: { ...match, state: matchState },
        matchState,
        spatial,
        simulation,
        commands: simulation.commands,
        events: simulation.events,
        scheduler: simulation.scheduler,
        clock: simulation.clock,
        time: simulation.time,
      };
    },

    start() {
      requireActive('start');
      if (lifecycle.status === 'paused') {
        return session.resume();
      }
      const result = simulation.dispatch(
        createStartMatchCommand({ tick: simulation.clock.tick, source: 'system' }),
      );
      if (result.ok && lifecycle.status === 'ready') {
        lifecycle.transition('running');
      }
      return result;
    },

    pause() {
      requireActive('pause');
      if (lifecycle.status !== 'running') {
        return {
          ok: false,
          commandId: 'session-pause',
          errors: [
            {
              code: 'SESSION_NOT_RUNNING',
              message: `Cannot pause from status ${lifecycle.status}`,
            },
          ],
          events: Object.freeze([]),
        };
      }
      const result = simulation.dispatch(
        createPauseMatchCommand({ tick: simulation.clock.tick, source: 'system' }),
      );
      if (result.ok) lifecycle.transition('paused');
      return result;
    },

    resume() {
      requireActive('resume');
      if (lifecycle.status !== 'paused') {
        return {
          ok: false,
          commandId: 'session-resume',
          errors: [
            {
              code: 'SESSION_NOT_PAUSED',
              message: `Cannot resume from status ${lifecycle.status}`,
            },
          ],
          events: Object.freeze([]),
        };
      }
      const result = simulation.dispatch(
        createResumeMatchCommand({ tick: simulation.clock.tick, source: 'system' }),
      );
      if (result.ok) lifecycle.transition('running');
      return result;
    },

    stop() {
      assertNotDisposed(lifecycle.status, 'stop');
      if (lifecycle.status === 'stopped') {
        return {
          ok: true,
          commandId: 'session-stop-noop',
          errors: Object.freeze([]),
          events: Object.freeze([]),
        };
      }
      const result = simulation.dispatch(
        createEndMatchCommand({ tick: simulation.clock.tick, source: 'system' }),
      );
      if (lifecycle.canTransition('stopped')) {
        lifecycle.transition('stopped');
      }
      return result;
    },

    dispatch(command: Command): CommandResult {
      requireActive('dispatch');
      syncScoreTied();
      const result = simulation.dispatch(command);
      if (result.ok) {
        if (command.type === 'PauseMatch' && lifecycle.status === 'running') {
          lifecycle.transition('paused');
        } else if (command.type === 'ResumeMatch' && lifecycle.status === 'paused') {
          lifecycle.transition('running');
        } else if (
          (command.type === 'EndMatch' ||
            command.type === 'AbandonMatch' ||
            command.type === 'DeclareWalkover') &&
          lifecycle.canTransition('stopped')
        ) {
          lifecycle.transition('stopped');
        }
      }
      return result;
    },

    step(): ReplaySnapshot | undefined {
      requireActive('step');
      if (lifecycle.status !== 'running' && lifecycle.status !== 'paused') {
        throw new Error(
          `MatchSession.step: status must be running|paused (got ${lifecycle.status})`,
        );
      }
      // Paused session: still allow headless step for determinism tests (time scale separate)
      syncScoreTied();
      return simulation.step();
    },

    run(ticks: number) {
      requireActive('run');
      const n = Math.max(0, Math.floor(ticks));
      for (let i = 0; i < n; i += 1) {
        session.step();
      }
    },

    getMatchState(): MatchState {
      assertNotDisposed(lifecycle.status, 'getMatchState');
      return simulation.getMatchState() ?? match.state;
    },

    getWorld(): WorldState {
      assertNotDisposed(lifecycle.status, 'getWorld');
      return simulation.world;
    },

    getSpatialState(): MatchSpatialState {
      assertNotDisposed(lifecycle.status, 'getSpatialState');
      return spatial;
    },

    snapshots() {
      assertNotDisposed(lifecycle.status, 'snapshots');
      return simulation.snapshots();
    },

    latestSnapshot() {
      assertNotDisposed(lifecycle.status, 'latestSnapshot');
      return simulation.latestSnapshot();
    },

    dispose() {
      if (disposed) return;
      if (lifecycle.status !== 'stopped' && lifecycle.status !== 'disposed') {
        try {
          simulation.dispatch(
            createEndMatchCommand({ tick: simulation.clock.tick, source: 'system' }),
          );
        } catch {
          /* ignore */
        }
      }
      if (lifecycle.canTransition('disposed')) {
        lifecycle.transition('disposed');
      } else if (lifecycle.status === 'stopped') {
        lifecycle.transition('disposed');
      }
      disposed = true;
      simulation.setMatchState(null);
    },

    runToEnd(maxTicks = 20_000): MatchResult {
      requireActive('runToEnd');
      if (lifecycle.status === 'ready') {
        session.start();
      }
      let steps = 0;
      while (
        steps < maxTicks &&
        (lifecycle.status === 'running' || lifecycle.status === 'paused')
      ) {
        session.step();
        steps += 1;
        const phase = session.getMatchState().phase;
        if (phase === 'FINISHED') {
          session.stop();
          break;
        }
      }
      if (lifecycle.status === 'running' || lifecycle.status === 'paused') {
        session.stop();
      }
      const state = session.getMatchState();
      return {
        homeGoals: state.score.home,
        awayGoals: state.score.away,
        events: session.getEvents(),
        completed: state.phase === 'FINISHED' || lifecycle.status === 'stopped',
      };
    },

    getEvents(): MatchEvent[] {
      assertNotDisposed(lifecycle.status, 'getEvents');
      return simulation.events.history().map((e) => ({
        minute: simulation.clock.matchMinute,
        type: String(e.type),
        message: e.payload !== undefined ? JSON.stringify(e.payload) : '',
      }));
    },
  };

  return session;
}
