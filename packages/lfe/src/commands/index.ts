/**
 * EPIC-5 — Match Command System.
 * Source → Command → Validate → Mutate → Event → (Replay via tick pipeline)
 */

export type {
  Command,
  CommandSource,
  CommandContext,
  CommandResult,
  CommandHandler,
  CommandValidator,
  ValidationError,
} from './types';

export type { CommandRegistry } from './registry';
export { createCommandRegistry } from './registry';

export type { CommandBus, CommandBusDeps } from './bus';
export { createCommandBus, nextCommandId, resetCommandIdSeq } from './bus';

export type {
  MatchCommand,
  MatchCommandType,
  StartMatchCommand,
  KickoffCommand,
  PauseMatchCommand,
  ResumeMatchCommand,
  EndMatchCommand,
  AbandonMatchCommand,
  DeclareWalkoverCommand,
} from './match/commands';
export {
  createStartMatchCommand,
  createKickoffCommand,
  createPauseMatchCommand,
  createResumeMatchCommand,
  createEndMatchCommand,
  createAbandonMatchCommand,
  createDeclareWalkoverCommand,
} from './match/commands';
export { registerMatchCommands } from './match/index';
export { MATCH_COMMAND_HANDLERS } from './match/handlers';
