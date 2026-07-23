import type { Formation, FormationSlot } from '../domain/formation';
import type { PitchRole, PitchSide, PlayerId } from '../domain/ids';
import type { Lineup } from '../domain/lineup';
import type { Pitch } from '../domain/pitch';

import type { Position } from './coordinates';
import { pitchCoordinates } from './coordinates';
import { sideOrientation } from './sides';

/** One absolute slot placement derived from formation. */
export interface FormationLayoutSlot {
  readonly slotIndex: number;
  readonly role: PitchRole;
  readonly side: PitchSide;
  /** Normalized attacking-relative anchor from formation template. */
  readonly normalized: { readonly x: number; readonly y: number };
  /** World metres. */
  readonly position: Position;
  readonly facing: number;
}

/**
 * Absolute layout for one side's formation on a pitch.
 * Deterministic: same formation + side + pitch ⇒ identical positions.
 */
export interface FormationLayout {
  readonly side: PitchSide;
  readonly formationCode: string;
  readonly slots: readonly FormationLayoutSlot[];
}

export function buildFormationLayout(
  formation: Formation,
  side: PitchSide,
  pitch: Pitch,
): FormationLayout {
  const orientation = sideOrientation(side);
  const slots = formation.slots.map((slot: FormationSlot) => {
    const pos = pitchCoordinates.toWorld(slot.anchor, side, pitch);
    return Object.freeze({
      slotIndex: slot.slotIndex,
      role: slot.role,
      side,
      normalized: Object.freeze({ x: slot.anchor.x, y: slot.anchor.y }),
      position: pos,
      facing: orientation.attackFacing,
    });
  });
  return Object.freeze({
    side,
    formationCode: formation.code,
    slots: Object.freeze(slots),
  });
}

/** Bind lineup player ids onto layout slots (by slotIndex order). */
export interface OccupiedSlot extends FormationLayoutSlot {
  readonly playerId: PlayerId;
}

export function occupyFormationLayout(
  layout: FormationLayout,
  lineup: Lineup,
): readonly OccupiedSlot[] {
  const bySlot = new Map(lineup.slots.map((s) => [s.slotIndex, s.playerId]));
  return Object.freeze(
    layout.slots.map((slot) => {
      const playerId = bySlot.get(slot.slotIndex);
      if (!playerId) {
        throw new Error(`Lineup missing player for slot ${slot.slotIndex} (${layout.side})`);
      }
      return Object.freeze({ ...slot, playerId });
    }),
  );
}
