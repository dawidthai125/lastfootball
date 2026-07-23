import type { CommandHandler, CommandValidator, ValidationError } from '../types';

import type {
  AbandonMatchCommand,
  DeclareWalkoverCommand,
  EndMatchCommand,
  KickoffCommand,
  PauseMatchCommand,
  ResumeMatchCommand,
  StartMatchCommand,
} from './commands';

const requireNotFinished: CommandValidator = (command, ctx) => {
  const errors: ValidationError[] = [];
  if (ctx.world.match.status === 'finished') {
    errors.push({
      code: 'MATCH_FINISHED',
      message: `Cannot apply ${command.type} — match already finished`,
    });
  }
  return errors;
};

export const startMatchHandler: CommandHandler<StartMatchCommand> = {
  type: 'StartMatch',
  validate(command, ctx) {
    const errors = [...requireNotFinished(command, ctx)];
    if (ctx.world.match.status === 'running') {
      errors.push({
        code: 'ALREADY_RUNNING',
        message: 'Match is already running',
      });
    }
    return errors;
  },
  execute(command, ctx) {
    ctx.world.match.status = 'running';
    ctx.enqueueLifecycle({ type: 'PREPARE_LINEUPS', tick: command.tick });
    ctx.recordEvent('MATCH_START', { seed: ctx.world.match.seed, commandId: command.id });
  },
};

export const kickoffHandler: CommandHandler<KickoffCommand> = {
  type: 'Kickoff',
  validate: requireNotFinished,
  execute(command, ctx) {
    const phase = ctx.getMatchState()?.phase;
    if (phase === 'KICKOFF' || phase === 'LINEUP' || phase === undefined) {
      ctx.enqueueLifecycle({ type: 'START_KICKOFF', tick: command.tick });
      ctx.enqueueLifecycle({ type: 'OPEN_PLAY', tick: command.tick });
    } else {
      ctx.enqueueLifecycle({ type: 'OPEN_PLAY', tick: command.tick });
    }
    ctx.recordEvent('SYSTEM', { kind: 'kickoff', commandId: command.id });
  },
};

export const pauseMatchHandler: CommandHandler<PauseMatchCommand> = {
  type: 'PauseMatch',
  validate(command, ctx) {
    const errors = [...requireNotFinished(command, ctx)];
    if (ctx.time.isPaused()) {
      errors.push({ code: 'ALREADY_PAUSED', message: 'Match time is already paused' });
    }
    return errors;
  },
  execute(command, ctx) {
    ctx.time.pause();
    ctx.recordEvent('SYSTEM', { kind: 'pause', commandId: command.id });
  },
};

export const resumeMatchHandler: CommandHandler<ResumeMatchCommand> = {
  type: 'ResumeMatch',
  validate(command, ctx) {
    const errors = [...requireNotFinished(command, ctx)];
    if (!ctx.time.isPaused()) {
      errors.push({ code: 'NOT_PAUSED', message: 'Match time is not paused' });
    }
    return errors;
  },
  execute(command, ctx) {
    ctx.time.resume();
    ctx.recordEvent('SYSTEM', { kind: 'resume', commandId: command.id });
  },
};

export const endMatchHandler: CommandHandler<EndMatchCommand> = {
  type: 'EndMatch',
  validate: requireNotFinished,
  execute(command, ctx) {
    const phase = ctx.getMatchState()?.phase;
    if (phase === 'FULL_TIME') {
      ctx.enqueueLifecycle({ type: 'COMPLETE_MATCH', tick: command.tick });
    } else if (phase && phase !== 'FINISHED') {
      ctx.enqueueLifecycle({
        type: 'ABANDON_MATCH',
        tick: command.tick,
        reason: 'end_match',
      });
    }
    ctx.world.match.status = 'finished';
    ctx.recordEvent('MATCH_END', { commandId: command.id, seed: ctx.world.match.seed });
  },
};

export const abandonMatchHandler: CommandHandler<AbandonMatchCommand> = {
  type: 'AbandonMatch',
  validate: requireNotFinished,
  execute(command, ctx) {
    ctx.enqueueLifecycle({
      type: 'ABANDON_MATCH',
      tick: command.tick,
      reason: command.payload?.reason,
    });
    ctx.world.match.status = 'finished';
    ctx.recordEvent('MATCH_END', {
      commandId: command.id,
      abandoned: true,
      reason: command.payload?.reason,
    });
  },
};

export const declareWalkoverHandler: CommandHandler<DeclareWalkoverCommand> = {
  type: 'DeclareWalkover',
  validate(command, ctx) {
    const errors = [...requireNotFinished(command, ctx)];
    const winner = command.payload?.winner;
    if (winner !== 'home' && winner !== 'away') {
      errors.push({
        code: 'INVALID_WINNER',
        message: 'DeclareWalkover requires payload.winner home|away',
        field: 'payload.winner',
      });
    }
    return errors;
  },
  execute(command, ctx) {
    const winner = command.payload!.winner;
    ctx.enqueueLifecycle({
      type: 'DECLARE_WALKOVER',
      tick: command.tick,
      walkoverWinner: winner,
      reason: command.payload?.reason,
    });
    ctx.world.match.status = 'finished';
    ctx.recordEvent('MATCH_END', {
      commandId: command.id,
      walkover: true,
      winner,
    });
  },
};

export const MATCH_COMMAND_HANDLERS = [
  startMatchHandler,
  kickoffHandler,
  pauseMatchHandler,
  resumeMatchHandler,
  endMatchHandler,
  abandonMatchHandler,
  declareWalkoverHandler,
] as const;
