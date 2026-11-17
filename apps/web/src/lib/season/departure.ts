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

/** Post–Confirm flash: who left (+ promote) this UTC day. */
export type RetirementFarewellPlayer = {
  readonly id: string;
  readonly name: string;
  readonly departedAt: string | null;
  readonly promotedAt: string | null;
  readonly status: string;
};

export type RetirementFarewell = {
  readonly retireName: string;
  readonly promoteName: string | null;
  readonly subject: string;
  readonly summary: string;
};

function onUtcDay(iso: string | null, todayUtc: string): boolean {
  if (!iso) return false;
  return iso.slice(0, 10) === todayUtc;
}

/**
 * Information Thin farewell after Confirm N+1 departure.
 * Pure — picks today's DEPARTED senior and optional same-day promote/intake.
 */
export function resolveRetirementFarewell(
  players: readonly RetirementFarewellPlayer[],
  todayUtc: string,
): RetirementFarewell | null {
  const departed = players
    .filter(
      (player) =>
        (player.status === 'DEPARTED' || player.departedAt != null) &&
        onUtcDay(player.departedAt, todayUtc),
    )
    .slice()
    .sort(
      (a, b) => (b.departedAt ?? '').localeCompare(a.departedAt ?? '') || a.id.localeCompare(b.id),
    );
  const retire = departed[0];
  if (!retire) return null;

  const promote = players
    .filter(
      (player) =>
        player.id !== retire.id &&
        player.departedAt == null &&
        player.status !== 'DEPARTED' &&
        onUtcDay(player.promotedAt, todayUtc),
    )
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))[0];

  return formatRetirementFarewell(retire.name, promote?.name ?? null);
}

/** Build farewell copy from known names (Confirm / openNextSeason return). */
export function formatRetirementFarewell(
  retireName: string,
  promoteName: string | null,
): RetirementFarewell {
  const retire = retireName.trim();
  const promote = promoteName?.trim() || null;
  const subject = promote
    ? `${retire} zakończył karierę · wchodzi ${promote}`
    : `${retire} zakończył karierę`;
  const summary = promote
    ? `${retire} zakończył karierę. Z akademii / naboru wchodzi ${promote}.`
    : `${retire} zakończył karierę.`;
  return { retireName: retire, promoteName: promote, subject, summary };
}
