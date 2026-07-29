/** Player Development Thin — potential SSOT helpers (LFE-PLAYERS-02). */

export type PotentialBandId = 'low' | 'medium' | 'high' | 'elite';

export const POTENTIAL_BAND_LABEL: Record<PotentialBandId, string> = {
  low: 'Niski',
  medium: 'Średni',
  high: 'Wysoki',
  elite: 'Bardzo wysoki',
};

/** FNV-1a 32-bit — shared with SQL backfill parity. */
export function hashPlayerId(playerId: string): number {
  let h = 2166136261;
  for (let i = 0; i < playerId.length; i++) {
    h ^= playerId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic seeded ceiling (wariant B) — independent of current skill.
 * Age bias: younger → higher typical ceiling.
 */
export function seedPotentialCeiling(playerId: string, age: number): number {
  const h = hashPlayerId(playerId);
  let base = 62 + (h % 29); // 62..90
  if (age <= 21) base += 4 + (h % 5);
  else if (age <= 24) base += 2 + (h % 3);
  else if (age >= 32) base -= 2 + (h % 5);
  else if (age >= 28) base -= h % 3;
  return Math.min(99, Math.max(55, base));
}

/** potential = max(skill, seeded) — never below skill, never > 99. */
export function resolvePlayerPotential(skill: number, playerId: string, age: number): number {
  const seeded = seedPotentialCeiling(playerId, age);
  return Math.max(1, Math.min(99, Math.max(skill, seeded)));
}

/** UI pasmo — never expose raw potential number in presentation. */
export function resolvePotentialBand(potential: number): PotentialBandId {
  if (potential >= 88) return 'elite';
  if (potential >= 78) return 'high';
  if (potential >= 68) return 'medium';
  return 'low';
}

export function potentialBandLabel(potential: number): string {
  return POTENTIAL_BAND_LABEL[resolvePotentialBand(potential)];
}
