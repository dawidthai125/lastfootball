import type { MatchState } from '../../match/domain';
import { createMatchTactics } from '../../match/domain';
import type { CommandHandler, CommandValidator, ValidationError } from '../types';

import type {
  ChangeFormationCommand,
  ChangeTacticsCommand,
  SetMentalityCommand,
  SetPlayerInstructionCommand,
  SetPressingCommand,
  SetTempoCommand,
  SetWidthCommand,
  SubstitutePlayerCommand,
} from './tactical-commands';

const requireMatchState: CommandValidator = (_command, ctx) => {
  if (!ctx.getMatchState()) {
    return [
      {
        code: 'NO_MATCH_STATE',
        message: 'MatchState is not bound',
      },
    ];
  }
  return [];
};

function requireNotFinished(command: { type: string }, ctx: Parameters<CommandValidator>[1]) {
  const errors: ValidationError[] = [];
  if (ctx.world.match.status === 'finished') {
    errors.push({
      code: 'MATCH_FINISHED',
      message: `Cannot apply ${command.type} — match already finished`,
    });
  }
  return errors;
}

function patchTactics(
  state: MatchState,
  patch: Partial<MatchState['tactics']>,
): MatchState {
  return Object.freeze({
    ...state,
    tactics: createMatchTactics({
      ...state.tactics,
      ...patch,
      playerInstructions: {
        ...state.tactics.playerInstructions,
        ...(patch.playerInstructions ?? {}),
      },
    }),
  });
}

export const changeTacticsHandler: CommandHandler<ChangeTacticsCommand> = {
  type: 'ChangeTactics',
  validate(command, ctx) {
    return [...requireMatchState(command, ctx), ...requireNotFinished(command, ctx)];
  },
  execute(command, ctx) {
    const state = ctx.getMatchState()!;
    const p = command.payload ?? {};
    const next = patchTactics(state, {
      mentality: p.mentality ?? state.tactics.mentality,
      pressing: p.pressing ?? state.tactics.pressing,
      tempo: p.tempo ?? state.tactics.tempo,
      width: p.width ?? state.tactics.width,
      styleLabel: p.styleLabel ?? state.tactics.styleLabel,
    });
    ctx.setMatchState(next);
    ctx.recordEvent('SYSTEM', { kind: 'tactics_change', commandId: command.id, tactics: next.tactics });
  },
};

export const setPressingHandler: CommandHandler<SetPressingCommand> = {
  type: 'SetPressing',
  validate(command, ctx) {
    return [...requireMatchState(command, ctx), ...requireNotFinished(command, ctx)];
  },
  execute(command, ctx) {
    const state = ctx.getMatchState()!;
    const value = command.payload!.value;
    ctx.setMatchState(patchTactics(state, { pressing: value }));
    ctx.recordEvent('SYSTEM', { kind: 'pressing', value, commandId: command.id });
  },
};

export const setTempoHandler: CommandHandler<SetTempoCommand> = {
  type: 'SetTempo',
  validate(command, ctx) {
    return [...requireMatchState(command, ctx), ...requireNotFinished(command, ctx)];
  },
  execute(command, ctx) {
    const state = ctx.getMatchState()!;
    const value = command.payload!.value;
    ctx.setMatchState(patchTactics(state, { tempo: value }));
    ctx.recordEvent('SYSTEM', { kind: 'tempo', value, commandId: command.id });
  },
};

export const setWidthHandler: CommandHandler<SetWidthCommand> = {
  type: 'SetWidth',
  validate(command, ctx) {
    return [...requireMatchState(command, ctx), ...requireNotFinished(command, ctx)];
  },
  execute(command, ctx) {
    const state = ctx.getMatchState()!;
    const value = command.payload!.value;
    ctx.setMatchState(patchTactics(state, { width: value }));
    ctx.recordEvent('SYSTEM', { kind: 'width', value, commandId: command.id });
  },
};

export const setMentalityHandler: CommandHandler<SetMentalityCommand> = {
  type: 'SetMentality',
  validate(command, ctx) {
    return [...requireMatchState(command, ctx), ...requireNotFinished(command, ctx)];
  },
  execute(command, ctx) {
    const state = ctx.getMatchState()!;
    const value = command.payload!.value;
    ctx.setMatchState(patchTactics(state, { mentality: value }));
    ctx.recordEvent('SYSTEM', { kind: 'mentality', value, commandId: command.id });
  },
};

export const setPlayerInstructionHandler: CommandHandler<SetPlayerInstructionCommand> = {
  type: 'SetPlayerInstruction',
  validate(command, ctx) {
    return [...requireMatchState(command, ctx), ...requireNotFinished(command, ctx)];
  },
  execute(command, ctx) {
    const state = ctx.getMatchState()!;
    const { playerId, instruction } = command.payload!;
    ctx.setMatchState(
      patchTactics(state, {
        playerInstructions: {
          ...state.tactics.playerInstructions,
          [playerId]: instruction,
        },
      }),
    );
    ctx.recordEvent('SYSTEM', {
      kind: 'player_instruction',
      playerId,
      instruction,
      commandId: command.id,
    });
  },
};

export const changeFormationHandler: CommandHandler<ChangeFormationCommand> = {
  type: 'ChangeFormation',
  validate(command, ctx) {
    return [...requireMatchState(command, ctx), ...requireNotFinished(command, ctx)];
  },
  execute(command, ctx) {
    const state = ctx.getMatchState()!;
    const { formationCode, side } = command.payload!;
    const next = patchTactics(state, {
      formationCode: side === 'home' ? formationCode : state.tactics.formationCode,
    });
    ctx.setMatchState(next);
    ctx.recordEvent('FORMATION_CHANGE', {
      side,
      formationCode,
      commandId: command.id,
    });
  },
};

export const substitutePlayerHandler: CommandHandler<SubstitutePlayerCommand> = {
  type: 'SubstitutePlayer',
  validate(command, ctx) {
    const errors = [...requireMatchState(command, ctx), ...requireNotFinished(command, ctx)];
    const state = ctx.getMatchState();
    const p = command.payload;
    if (!state || !p) return errors;

    const lineup = p.side === 'home' ? state.homeLineup : state.awayLineup;
    const bench = p.side === 'home' ? state.homeBench : state.awayBench;
    const outOnPitch = lineup.slots.some((s) => s.playerId === p.playerOutId);
    const inOnBench = bench.playerIds.includes(p.playerInId);
    if (!outOnPitch) {
      errors.push({
        code: 'PLAYER_NOT_ON_PITCH',
        message: 'playerOutId must be in the starting lineup',
        field: 'payload.playerOutId',
      });
    }
    if (!inOnBench) {
      errors.push({
        code: 'PLAYER_NOT_ON_BENCH',
        message: 'playerInId must be on the bench',
        field: 'payload.playerInId',
      });
    }
    return errors;
  },
  execute(command, ctx) {
    const state = ctx.getMatchState()!;
    const { side, playerOutId, playerInId } = command.payload!;
    const lineup = side === 'home' ? state.homeLineup : state.awayLineup;
    const bench = side === 'home' ? state.homeBench : state.awayBench;

    const nextSlots = lineup.slots.map((s) =>
      s.playerId === playerOutId ? Object.freeze({ ...s, playerId: playerInId }) : s,
    );
    const nextLineup = Object.freeze({
      ...lineup,
      slots: Object.freeze(nextSlots),
      captainPlayerId:
        lineup.captainPlayerId === playerOutId ? playerInId : lineup.captainPlayerId,
    });
    const nextBenchIds = bench.playerIds
      .filter((id) => id !== playerInId)
      .concat(playerOutId);
    const nextBench = Object.freeze({
      ...bench,
      playerIds: Object.freeze(nextBenchIds),
    });

    const next: MatchState = Object.freeze({
      ...state,
      homeLineup: side === 'home' ? nextLineup : state.homeLineup,
      awayLineup: side === 'away' ? nextLineup : state.awayLineup,
      homeBench: side === 'home' ? nextBench : state.homeBench,
      awayBench: side === 'away' ? nextBench : state.awayBench,
      substitutions: Object.freeze([
        ...state.substitutions,
        Object.freeze({
          id: `sub-${command.id}`,
          side,
          playerOutId,
          playerInId,
          matchMinute: state.clock.displayMinute,
          tick: command.tick,
          reason: 'tactical' as const,
          completed: true,
        }),
      ]),
    });
    ctx.setMatchState(next);
    ctx.recordEvent('SUBSTITUTION', {
      side,
      playerOutId,
      playerInId,
      commandId: command.id,
    });
  },
};

export const TACTICAL_COMMAND_HANDLERS = [
  changeTacticsHandler,
  setPressingHandler,
  setTempoHandler,
  setWidthHandler,
  setMentalityHandler,
  setPlayerInstructionHandler,
  changeFormationHandler,
  substitutePlayerHandler,
] as const;
