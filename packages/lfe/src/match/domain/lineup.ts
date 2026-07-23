import type { FormationCode } from '@lastfootball/domain';

import type { Formation } from './formation';
import { formationByCode } from './formation';
import type { PlayerId, PitchRole, PitchSide } from './ids';

/** Starting XI assignment: formation slot → player. */
export interface LineupSlot {
  readonly slotIndex: number;
  readonly role: PitchRole;
  readonly playerId: PlayerId;
}

export interface Lineup {
  readonly side: PitchSide;
  readonly formationCode: FormationCode;
  readonly formation: Formation;
  readonly slots: readonly LineupSlot[];
  /** Captain, if selected. */
  readonly captainPlayerId: PlayerId | null;
}

export interface CreateLineupInput {
  side: PitchSide;
  formationCode: FormationCode;
  /** Exactly 11 player ids, order = formation slotIndex 0..10. */
  playerIds: readonly PlayerId[];
  captainPlayerId?: PlayerId | null;
  formation?: Formation;
}

export function createLineup(input: CreateLineupInput): Lineup {
  const formation = input.formation ?? formationByCode(input.formationCode);
  if (input.playerIds.length !== 11) {
    throw new Error('Lineup requires exactly 11 players');
  }
  if (formation.slots.length !== 11) {
    throw new Error('Formation must define 11 slots');
  }
  const slots = formation.slots.map((slot, i) =>
    Object.freeze({
      slotIndex: slot.slotIndex,
      role: slot.role,
      playerId: input.playerIds[i]!,
    }),
  );
  return Object.freeze({
    side: input.side,
    formationCode: input.formationCode,
    formation,
    slots: Object.freeze(slots),
    captainPlayerId: input.captainPlayerId ?? null,
  });
}
