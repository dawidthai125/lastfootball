export type { ClockSnapshot, GameClock } from './game-clock';
export { createGameClock } from './game-clock';
export type { LogLevel, LogRecord, LogSink, Logger } from './logger';
export { createLogger } from './logger';
export type { TickEngine, TickPhaseContext, TickPhases } from './tick-engine';
export { createTickEngine } from './tick-engine';
export type { TimeController, TimeControllerStatus } from './time-controller';
export { createTimeController } from './time-controller';

/** @deprecated Prefer GameClock — kept for early scaffold compatibility. */
export type { Seed } from './compat';
export type { ClockState } from './compat';
