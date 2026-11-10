import {
  formationByCode,
  orderPlayersByRole,
  type FormationCode,
  type PitchRole,
} from '@lastfootball/lfe';

type XiPlayer = { readonly role: PitchRole };

/** Same slot order the match engine uses when the shape changes. */
export function orderForFormation<T extends XiPlayer>(
  players: readonly T[],
  formationCode: FormationCode,
): T[] {
  return orderPlayersByRole(players, formationCode);
}

/** Shirt numbers on the pre-match pitch, same order the match will use. */
export function pitchSlotsFor(
  players: readonly (XiPlayer & { readonly number: number })[],
  formationCode: FormationCode,
): { number: number; x: number; y: number }[] {
  const ordered = orderForFormation(players, formationCode);
  const slots = formationByCode(formationCode).slots;
  return ordered.map((player, index) => {
    const anchor = slots[index]?.anchor ?? { x: 0.5, y: 0.5 };
    return {
      number: player.number,
      x: Math.round(anchor.y * 100),
      y: Math.round((1 - anchor.x) * 100),
    };
  });
}
