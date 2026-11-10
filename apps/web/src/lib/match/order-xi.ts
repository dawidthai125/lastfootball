import { formationByCode, type FormationCode, type PitchRole } from '@lastfootball/lfe';

/**
 * Near-roles for a formation slot. Exact role wins, then this list, then whoever is left.
 * 4-4-2 has RM/LM; the squad stores RW/LW.
 */
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

type XiPlayer = { readonly role: PitchRole };

/**
 * Puts eleven players into formation slot order.
 * List order must not decide who stands at centre-back.
 */
export function orderForFormation<T extends XiPlayer>(
  players: readonly T[],
  formationCode: FormationCode,
): T[] {
  const unused = players.map((player, index) => ({ player, index }));
  const ordered: T[] = [];

  for (const slot of formationByCode(formationCode).slots) {
    const near = NEAR[slot.role] ?? [slot.role];
    let pick = unused.findIndex((row) => row.player.role === slot.role);
    if (pick < 0) pick = unused.findIndex((row) => near.includes(row.player.role));
    if (pick < 0) pick = 0;
    const taken = unused.splice(pick, 1)[0];
    if (taken) ordered.push(taken.player);
  }

  return ordered;
}
