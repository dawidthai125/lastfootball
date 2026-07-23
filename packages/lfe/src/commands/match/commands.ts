import type { Command, CommandSource } from '../types';
import { nextCommandId } from '../bus';

/** Match command type literals (EPIC-5). */
export type MatchCommandType =
  | 'StartMatch'
  | 'Kickoff'
  | 'PauseMatch'
  | 'ResumeMatch'
  | 'EndMatch'
  | 'AbandonMatch'
  | 'DeclareWalkover';

export interface StartMatchCommand extends Command<'StartMatch'> {}
export interface KickoffCommand extends Command<'Kickoff'> {}
export interface PauseMatchCommand extends Command<'PauseMatch'> {}
export interface ResumeMatchCommand extends Command<'ResumeMatch'> {}
export interface EndMatchCommand extends Command<'EndMatch'> {}
export interface AbandonMatchCommand extends Command<
  'AbandonMatch',
  { readonly reason?: string }
> {}
export interface DeclareWalkoverCommand extends Command<
  'DeclareWalkover',
  { readonly winner: 'home' | 'away'; readonly reason?: string }
> {}

export type MatchCommand =
  | StartMatchCommand
  | KickoffCommand
  | PauseMatchCommand
  | ResumeMatchCommand
  | EndMatchCommand
  | AbandonMatchCommand
  | DeclareWalkoverCommand;

interface CreateCommandOpts {
  tick: number;
  source?: CommandSource;
  id?: string;
}

function base<T extends MatchCommandType>(type: T, opts: CreateCommandOpts): Command<T> {
  return Object.freeze({
    id: opts.id ?? nextCommandId(opts.tick),
    type,
    tick: opts.tick,
    source: opts.source ?? 'system',
  });
}

export function createStartMatchCommand(opts: CreateCommandOpts): StartMatchCommand {
  return base('StartMatch', opts) as StartMatchCommand;
}

export function createKickoffCommand(opts: CreateCommandOpts): KickoffCommand {
  return base('Kickoff', opts) as KickoffCommand;
}

export function createPauseMatchCommand(opts: CreateCommandOpts): PauseMatchCommand {
  return base('PauseMatch', opts) as PauseMatchCommand;
}

export function createResumeMatchCommand(opts: CreateCommandOpts): ResumeMatchCommand {
  return base('ResumeMatch', opts) as ResumeMatchCommand;
}

export function createEndMatchCommand(opts: CreateCommandOpts): EndMatchCommand {
  return base('EndMatch', opts) as EndMatchCommand;
}

export function createAbandonMatchCommand(
  opts: CreateCommandOpts & { reason?: string },
): AbandonMatchCommand {
  return Object.freeze({
    ...base('AbandonMatch', opts),
    payload: Object.freeze({ reason: opts.reason }),
  });
}

export function createDeclareWalkoverCommand(
  opts: CreateCommandOpts & { winner: 'home' | 'away'; reason?: string },
): DeclareWalkoverCommand {
  return Object.freeze({
    ...base('DeclareWalkover', opts),
    payload: Object.freeze({ winner: opts.winner, reason: opts.reason }),
  });
}
