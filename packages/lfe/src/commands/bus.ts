import type { EngineEvent, EventBus } from '../events';
import type { GameClock, Logger, TimeController } from '../core';
import type { MatchState } from '../match/domain';
import type { MatchLifecycleEvent } from '../match/state-machine';
import type { Rng } from '../rng';
import type { LifecycleFacts } from '../simulation/system';
import type { WorldState } from '../world';

import type { CommandRegistry } from './registry';
import type { Command, CommandContext, CommandResult, ValidationError } from './types';

export interface CommandBusDeps {
  readonly world: WorldState;
  readonly clock: GameClock;
  readonly rng: Rng;
  readonly logger: Logger;
  readonly time: TimeController;
  readonly events: EventBus;
  readonly registry: CommandRegistry;
  getMatchState: () => MatchState | null;
  setMatchState: (state: MatchState | null) => void;
  getLifecycleFacts: () => LifecycleFacts;
  setLifecycleFacts: (partial: Partial<LifecycleFacts>) => void;
  enqueueLifecycle: (event: MatchLifecycleEvent) => void;
}

export interface CommandBus {
  /** Register handler (delegates to registry). */
  register: CommandRegistry['register'];
  /** Execute: validate → mutate → emit events → result. Sync only. */
  execute<C extends Command>(command: C): CommandResult;
  /** Peek whether a handler exists. */
  hasHandler(type: string): boolean;
}

let commandSeq = 0;

/** Deterministic-ish id for callers that do not supply one. */
export function nextCommandId(tick: number): string {
  commandSeq += 1;
  return `cmd-${tick}-${commandSeq}`;
}

/** Reset seq — tests only. */
export function resetCommandIdSeq(): void {
  commandSeq = 0;
}

export function createCommandBus(deps: CommandBusDeps): CommandBus {
  return {
    register(handler) {
      deps.registry.register(handler);
    },
    hasHandler(type) {
      return deps.registry.get(type) !== undefined;
    },
    execute(command) {
      const handler = deps.registry.get(command.type);
      if (!handler) {
        return fail(command.id, [
          {
            code: 'NO_HANDLER',
            message: `No handler registered for command type "${command.type}"`,
          },
        ]);
      }

      const recorded: EngineEvent[] = [];

      const ctx: CommandContext = {
        tick: command.tick,
        world: deps.world,
        clock: deps.clock,
        rng: deps.rng,
        logger: deps.logger,
        time: deps.time,
        getMatchState: deps.getMatchState,
        setMatchState: deps.setMatchState,
        getLifecycleFacts: deps.getLifecycleFacts,
        setLifecycleFacts: deps.setLifecycleFacts,
        enqueueLifecycle: deps.enqueueLifecycle,
        recordEvent(type, payload) {
          const event: EngineEvent =
            payload === undefined
              ? { type, tick: command.tick }
              : { type, tick: command.tick, payload };
          recorded.push(event);
        },
      };

      const errors: ValidationError[] = [];
      if (handler.validate) {
        errors.push(...handler.validate(command, ctx));
      }
      if (errors.length > 0) {
        return fail(command.id, errors);
      }

      try {
        handler.execute(command, ctx);
      } catch (err) {
        return fail(command.id, [
          {
            code: 'HANDLER_ERROR',
            message: err instanceof Error ? err.message : String(err),
          },
        ]);
      }

      for (const event of recorded) {
        deps.events.emit(event.type, event.tick, event.payload);
      }

      return {
        ok: true,
        commandId: command.id,
        errors: Object.freeze([]),
        events: Object.freeze(recorded),
      };
    },
  };
}

function fail(commandId: string, errors: ValidationError[]): CommandResult {
  return {
    ok: false,
    commandId,
    errors: Object.freeze(errors),
    events: Object.freeze([]),
  };
}
