import type { LeagueTier } from '@/lib/league/league-tier';

/**
 * Domain contract: league sporting strength for AI world (LFE-LEAGUE-WORLD-02).
 * Extensible — future fields (style, pressing, academy quality, …) may be added
 * without breaking resolveLeagueStrengthProfile consumers that only read min/max.
 */
export type LeagueStrengthProfile = {
  readonly minSkill: number;
  readonly maxSkill: number;
};

const PROFILES: Record<LeagueTier, LeagueStrengthProfile> = {
  iv: Object.freeze({ minSkill: 42, maxSkill: 58 }),
  iii: Object.freeze({ minSkill: 50, maxSkill: 66 }),
  ii: Object.freeze({ minSkill: 58, maxSkill: 74 }),
  i: Object.freeze({ minSkill: 66, maxSkill: 82 }),
};

/** Sole SSOT for tier → strength band. */
export function resolveLeagueStrengthProfile(tier: LeagueTier): LeagueStrengthProfile {
  return PROFILES[tier];
}

/**
 * Deterministic AI player skill within profile band.
 * skill = min + (hash(oppId:index) % (max - min + 1))
 */
export function resolveOpponentPlayerSkill(
  opponentClubId: string,
  slotIndex: number,
  profile: LeagueStrengthProfile,
): number {
  const min = profile.minSkill;
  const max = profile.maxSkill;
  const span = max - min + 1;
  const h = stableHash(`${opponentClubId}:${slotIndex}`);
  return min + (h % span);
}

function stableHash(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
