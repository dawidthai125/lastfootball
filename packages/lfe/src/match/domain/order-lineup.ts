import type { FormationCode } from '@lastfootball/domain';

import { formationByCode } from './formation';
import type { PitchRole } from './ids';

/** Exact role first, then these neighbours, then whoever is still free. */
const NEAR: Record<PitchRole, readonly PitchRole[]> = {
  GK: ['GK'],
  RB: ['RB', 'RWB'],
  CB: ['CB'],
  LB: ['LB', 'LWB'],
  RWB: ['RWB', 'RB', 'RM'],
  LWB: ['LWB', 'LB', 'LM'],
  CDM: ['CDM', 'CM'],
  CM: ['CM', 'CDM', 'CAM'],
  CAM: ['CAM', 'CM'],
  RM: ['RM', 'RW', 'RB'],
  LM: ['LM', 'LW', 'LB'],
  RW: ['RW', 'RM'],
  LW: ['LW', 'LM'],
  ST: ['ST', 'CF'],
  CF: ['CF', 'ST'],
};

/**
 * Slot order for a formation. A winger stays wide when the shape changes.
 */
export function orderPlayersByRole<T extends { readonly role: PitchRole }>(
  players: readonly T[],
  formationCode: FormationCode,
): T[] {
  const unused = players.slice();
  const ordered: T[] = [];

  for (const slot of formationByCode(formationCode).slots) {
    const near = NEAR[slot.role] ?? [slot.role];
    let pick = unused.findIndex((player) => player.role === slot.role);
    if (pick < 0) pick = unused.findIndex((player) => near.includes(player.role));
    if (pick < 0) pick = 0;
    const taken = unused.splice(pick, 1)[0];
    if (taken) ordered.push(taken);
  }

  return ordered;
}
