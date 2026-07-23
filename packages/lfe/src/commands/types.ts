import type { EngineEvent } from '../events';
import type { GameClock, Logger, TimeController } from '../core';
import type { MatchState } from '../match/domain';
import type { MatchLifecycleEvent } from '../match/state-machine';
import type { Rng } from '../rng';
import type { LifecycleFacts } from '../simulation/system';
import type { WorldState } from '../world';

/** Who issued the command — same execution path for all sources. */
export type CommandSource = 'ai' | 'ui' | 'bot' | 'replay' | 'multiplayer' | 'test' | 'system';

/**
 * Base command — serializable, deterministic, no I/O.
 * Every world mutation for match control starts here (EPIC-5).
 */
export interface Command<TType extends string = string, TPayload = unknown> {
  readonly id: string;
  readonly type: TType;
  /** Simulation tick at which the command applies. */
  readonly tick: number;
  readonly source: CommandSource;
  readonly payload?: TPayload;
}

export interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

export interface CommandResult {
  readonly ok: boolean;
  readonly commandId: string;
  readonly errors: readonly ValidationError[];
  /** Events produced by the handler (also emitted on EventBus when ok). */
  readonly events: readonly EngineEvent[];
}

/**
 * Mutable execution context supplied by CommandBus.
 * Handlers mutate world/match only through this context.
 */
export interface CommandContext {
  readonly tick: number;
  readonly world: WorldState;
  readonly clock: GameClock;
  readonly rng: Rng;
  readonly logger: Logger;
  readonly time: TimeController;
  getMatchState(): MatchState | null;
  setMatchState(state: MatchState | null): void;
  getLifecycleFacts(): LifecycleFacts;
  setLifecycleFacts(partial: Partial<LifecycleFacts>): void;
  enqueueLifecycle(event: MatchLifecycleEvent): void;
  /** Buffer an engine event; bus emits after successful handle. */
  recordEvent(type: string, payload?: unknown): void;
}

export type CommandValidator<C extends Command = Command> = (
  command: C,
  ctx: CommandContext,
) => readonly ValidationError[];

export interface CommandHandler<C extends Command = Command> {
  readonly type: C['type'];
  validate?: CommandValidator<C>;
  execute(command: C, ctx: CommandContext): void;
}
