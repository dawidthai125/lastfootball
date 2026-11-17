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

export type DeparturePreviewPlayer = DeparturePlayer & { readonly name: string };

export type DeparturePreviewSlot = {
  readonly id: string;
  readonly name: string;
  readonly age: number;
  readonly skill: number;
};

export type DeparturePreview = {
  readonly retire: DeparturePreviewSlot | null;
  readonly promote: DeparturePreviewSlot | null;
  readonly summary: string;
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

function slotFrom(
  players: readonly DeparturePreviewPlayer[],
  id: string | null,
): DeparturePreviewSlot | null {
  if (!id) return null;
  const player = players.find((p) => p.id === id);
  if (!player) return null;
  return { id: player.id, name: player.name, age: player.age, skill: player.skill };
}

/**
 * Information Thin foreshadow of Confirm N+1 departure (planSeasonDeparture).
 * Pure — no mutate; summary is Polish copy only.
 */
export function resolveDeparturePreview(
  players: readonly DeparturePreviewPlayer[],
): DeparturePreview {
  const plan = planSeasonDeparture(players);
  const retire = slotFrom(players, plan.retireId);
  const promote = slotFrom(players, plan.promoteId);

  if (!retire) {
    return {
      retire: null,
      promote: null,
      summary: 'Przy starcie kolejnego sezonu nikt nie kończy kariery automatycznie.',
    };
  }

  if (promote) {
    return {
      retire,
      promote,
      summary: `Przy potwierdzeniu startu N+1 ${retire.name} (lat ${retire.age}) kończy karierę. Z akademii wchodzi ${promote.name}.`,
    };
  }

  return {
    retire,
    promote: null,
    summary: `Przy potwierdzeniu startu N+1 ${retire.name} (lat ${retire.age}) kończy karierę. Akademia jest pusta — nabór uzupełni skład przy starcie.`,
  };
}
