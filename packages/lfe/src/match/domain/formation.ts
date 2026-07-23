import type { FormationCode } from '@lastfootball/domain';

import type { PitchPoint, PitchRole } from './ids';

export type { FormationCode };

/**
 * One nominal slot in a formation template (relative pitch coords 0–1).
 * x: 0 = own goal line … 1 = opponent goal line (attacking direction).
 * y: 0 = left touchline … 1 = right touchline.
 */
export interface FormationSlot {
  readonly slotIndex: number;
  readonly role: PitchRole;
  readonly anchor: PitchPoint;
}

export interface Formation {
  readonly code: FormationCode;
  readonly name: string;
  readonly slots: readonly FormationSlot[];
}

/** Minimal built-in templates — geometry only, no tactics AI. */
export const FORMATION_442: Formation = Object.freeze({
  code: '4-4-2',
  name: '4-4-2',
  slots: Object.freeze([
    Object.freeze({ slotIndex: 0, role: 'GK', anchor: Object.freeze({ x: 0.05, y: 0.5 }) }),
    Object.freeze({ slotIndex: 1, role: 'RB', anchor: Object.freeze({ x: 0.2, y: 0.85 }) }),
    Object.freeze({ slotIndex: 2, role: 'CB', anchor: Object.freeze({ x: 0.18, y: 0.62 }) }),
    Object.freeze({ slotIndex: 3, role: 'CB', anchor: Object.freeze({ x: 0.18, y: 0.38 }) }),
    Object.freeze({ slotIndex: 4, role: 'LB', anchor: Object.freeze({ x: 0.2, y: 0.15 }) }),
    Object.freeze({ slotIndex: 5, role: 'RM', anchor: Object.freeze({ x: 0.5, y: 0.85 }) }),
    Object.freeze({ slotIndex: 6, role: 'CM', anchor: Object.freeze({ x: 0.48, y: 0.62 }) }),
    Object.freeze({ slotIndex: 7, role: 'CM', anchor: Object.freeze({ x: 0.48, y: 0.38 }) }),
    Object.freeze({ slotIndex: 8, role: 'LM', anchor: Object.freeze({ x: 0.5, y: 0.15 }) }),
    Object.freeze({ slotIndex: 9, role: 'ST', anchor: Object.freeze({ x: 0.78, y: 0.58 }) }),
    Object.freeze({ slotIndex: 10, role: 'ST', anchor: Object.freeze({ x: 0.78, y: 0.42 }) }),
  ]),
});

export const FORMATION_433: Formation = Object.freeze({
  code: '4-3-3',
  name: '4-3-3',
  slots: Object.freeze([
    Object.freeze({ slotIndex: 0, role: 'GK', anchor: Object.freeze({ x: 0.05, y: 0.5 }) }),
    Object.freeze({ slotIndex: 1, role: 'RB', anchor: Object.freeze({ x: 0.2, y: 0.85 }) }),
    Object.freeze({ slotIndex: 2, role: 'CB', anchor: Object.freeze({ x: 0.18, y: 0.62 }) }),
    Object.freeze({ slotIndex: 3, role: 'CB', anchor: Object.freeze({ x: 0.18, y: 0.38 }) }),
    Object.freeze({ slotIndex: 4, role: 'LB', anchor: Object.freeze({ x: 0.2, y: 0.15 }) }),
    Object.freeze({ slotIndex: 5, role: 'CDM', anchor: Object.freeze({ x: 0.4, y: 0.5 }) }),
    Object.freeze({ slotIndex: 6, role: 'CM', anchor: Object.freeze({ x: 0.52, y: 0.68 }) }),
    Object.freeze({ slotIndex: 7, role: 'CM', anchor: Object.freeze({ x: 0.52, y: 0.32 }) }),
    Object.freeze({ slotIndex: 8, role: 'RW', anchor: Object.freeze({ x: 0.78, y: 0.82 }) }),
    Object.freeze({ slotIndex: 9, role: 'ST', anchor: Object.freeze({ x: 0.82, y: 0.5 }) }),
    Object.freeze({ slotIndex: 10, role: 'LW', anchor: Object.freeze({ x: 0.78, y: 0.18 }) }),
  ]),
});

export function formationByCode(code: FormationCode): Formation {
  switch (code) {
    case '4-3-3':
      return FORMATION_433;
    case '4-4-2':
    default:
      return FORMATION_442;
  }
}
