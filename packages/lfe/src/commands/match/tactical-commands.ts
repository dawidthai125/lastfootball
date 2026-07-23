import type { Command, CommandSource } from '../types';
import { nextCommandId } from '../bus';

/**
 * GAMEPLAY-01 tactical / in-match control commands.
 * CommandBus is the sole source of commands.
 */
export type TacticalCommandType =
  | 'ChangeTactics'
  | 'SubstitutePlayer'
  | 'SetPressing'
  | 'SetTempo'
  | 'SetWidth'
  | 'SetMentality'
  | 'SetPlayerInstruction'
  | 'ChangeFormation';

export interface ChangeTacticsCommand extends Command<
  'ChangeTactics',
  {
    readonly mentality?: number;
    readonly pressing?: number;
    readonly tempo?: number;
    readonly width?: number;
    readonly styleLabel?: string;
  }
> {}

export interface SubstitutePlayerCommand extends Command<
  'SubstitutePlayer',
  {
    readonly side: 'home' | 'away';
    readonly playerOutId: string;
    readonly playerInId: string;
  }
> {}

export interface SetPressingCommand extends Command<'SetPressing', { readonly value: number }> {}
export interface SetTempoCommand extends Command<'SetTempo', { readonly value: number }> {}
export interface SetWidthCommand extends Command<'SetWidth', { readonly value: number }> {}
export interface SetMentalityCommand extends Command<'SetMentality', { readonly value: number }> {}

export interface SetPlayerInstructionCommand extends Command<
  'SetPlayerInstruction',
  { readonly playerId: string; readonly instruction: string }
> {}

export interface ChangeFormationCommand extends Command<
  'ChangeFormation',
  { readonly side: 'home' | 'away'; readonly formationCode: string }
> {}

export type TacticalCommand =
  | ChangeTacticsCommand
  | SubstitutePlayerCommand
  | SetPressingCommand
  | SetTempoCommand
  | SetWidthCommand
  | SetMentalityCommand
  | SetPlayerInstructionCommand
  | ChangeFormationCommand;

interface CreateCommandOpts {
  tick: number;
  source?: CommandSource;
  id?: string;
}

function clamp01to100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function withPayload<T extends string, P>(
  type: T,
  opts: CreateCommandOpts,
  payload: P,
): Command<T, P> {
  return Object.freeze({
    id: opts.id ?? nextCommandId(opts.tick),
    type,
    tick: opts.tick,
    source: opts.source ?? 'ui',
    payload: Object.freeze(payload) as P,
  });
}

export function createChangeTacticsCommand(
  opts: CreateCommandOpts & ChangeTacticsCommand['payload'],
): ChangeTacticsCommand {
  const { tick, source, id, ...payload } = opts;
  return withPayload('ChangeTactics', { tick, source, id }, payload) as ChangeTacticsCommand;
}

export function createSubstitutePlayerCommand(
  opts: CreateCommandOpts & SubstitutePlayerCommand['payload'],
): SubstitutePlayerCommand {
  const { tick, source, id, side, playerOutId, playerInId } = opts;
  return withPayload('SubstitutePlayer', { tick, source, id }, {
    side,
    playerOutId,
    playerInId,
  }) as SubstitutePlayerCommand;
}

export function createSetPressingCommand(
  opts: CreateCommandOpts & { value: number },
): SetPressingCommand {
  return withPayload('SetPressing', opts, { value: clamp01to100(opts.value) }) as SetPressingCommand;
}

export function createSetTempoCommand(opts: CreateCommandOpts & { value: number }): SetTempoCommand {
  return withPayload('SetTempo', opts, { value: clamp01to100(opts.value) }) as SetTempoCommand;
}

export function createSetWidthCommand(opts: CreateCommandOpts & { value: number }): SetWidthCommand {
  return withPayload('SetWidth', opts, { value: clamp01to100(opts.value) }) as SetWidthCommand;
}

export function createSetMentalityCommand(
  opts: CreateCommandOpts & { value: number },
): SetMentalityCommand {
  return withPayload('SetMentality', opts, {
    value: clamp01to100(opts.value),
  }) as SetMentalityCommand;
}

export function createSetPlayerInstructionCommand(
  opts: CreateCommandOpts & { playerId: string; instruction: string },
): SetPlayerInstructionCommand {
  return withPayload('SetPlayerInstruction', opts, {
    playerId: opts.playerId,
    instruction: opts.instruction,
  }) as SetPlayerInstructionCommand;
}

export function createChangeFormationCommand(
  opts: CreateCommandOpts & { side: 'home' | 'away'; formationCode: string },
): ChangeFormationCommand {
  return withPayload('ChangeFormation', opts, {
    side: opts.side,
    formationCode: opts.formationCode,
  }) as ChangeFormationCommand;
}
