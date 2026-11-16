/** One late player leaves after the age tick. Academy fills the spot when one exists. */

export type DeparturePlayer = {
  readonly id: string;
  readonly age: number;
  readonly skill: number;
  readonly academyTrack: boolean;
  readonly departed: boolean;
};

export type DeparturePlan = {
  readonly retireId: string | null;
  readonly promoteId: string | null;
};

/** Lowest skill among age 38+, tie-break by id. No late player means nobody moves. */
export function planSeasonDeparture(players: readonly DeparturePlayer[]): DeparturePlan {
  const active = players.filter((player) => !player.departed);
  const late = active.filter((player) => !player.academyTrack && player.age >= 38);
  if (late.length === 0) return { retireId: null, promoteId: null };

  const retire = late.slice().sort((a, b) => a.skill - b.skill || a.id.localeCompare(b.id))[0];
  if (!retire) return { retireId: null, promoteId: null };

  const academy = active
    .filter((player) => player.academyTrack)
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))[0];

  return { retireId: retire.id, promoteId: academy?.id ?? null };
}
