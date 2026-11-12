/** Plan a shirt-number change. A taken number swaps with that player. */

export type ShirtPlayer = {
  readonly id: string;
  readonly shirtNumber: number;
  readonly name?: string;
};

export type ShirtUpdate = {
  readonly id: string;
  readonly shirtNumber: number;
};

export type ShirtPlan =
  | { ok: true; updates: readonly ShirtUpdate[]; swappedWith: string | null }
  | { ok: false; reason: 'range' | 'missing' | 'full' };

export function planShirtAssignment(
  players: readonly ShirtPlayer[],
  playerId: string,
  next: number,
): ShirtPlan {
  if (!Number.isInteger(next) || next < 1 || next > 99) {
    return { ok: false, reason: 'range' };
  }
  const self = players.find((player) => player.id === playerId);
  if (!self) return { ok: false, reason: 'missing' };
  if (self.shirtNumber === next) return { ok: true, updates: [], swappedWith: null };

  const other = players.find((player) => player.id !== playerId && player.shirtNumber === next);
  if (!other) {
    return { ok: true, updates: [{ id: playerId, shirtNumber: next }], swappedWith: null };
  }

  const used = new Set(players.map((player) => player.shirtNumber));
  let temp = 0;
  for (let n = 1; n <= 99; n += 1) {
    if (!used.has(n)) {
      temp = n;
      break;
    }
  }
  if (temp === 0) return { ok: false, reason: 'full' };

  return {
    ok: true,
    swappedWith: other.name ?? 'inny zawodnik',
    updates: [
      { id: other.id, shirtNumber: temp },
      { id: playerId, shirtNumber: next },
      { id: other.id, shirtNumber: self.shirtNumber },
    ],
  };
}
