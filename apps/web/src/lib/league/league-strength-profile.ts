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
  iv: Object.freeze({ minSkill: 47, maxSkill: 63 }),
  iii: Object.freeze({ minSkill: 56, maxSkill: 72 }),
  ii: Object.freeze({ minSkill: 65, maxSkill: 81 }),
  i: Object.freeze({ minSkill: 74, maxSkill: 90 }),
};

/** The cup keeps the bands of D130, so a new club meets the same guests as before (D162). */
const CUP_PROFILES: Record<LeagueTier, LeagueStrengthProfile> = {
  iv: Object.freeze({ minSkill: 47, maxSkill: 63 }),
  iii: Object.freeze({ minSkill: 53, maxSkill: 69 }),
  ii: Object.freeze({ minSkill: 59, maxSkill: 75 }),
  i: Object.freeze({ minSkill: 66, maxSkill: 82 }),
};

export function resolveCupStrengthProfile(tier: LeagueTier): LeagueStrengthProfile {
  return CUP_PROFILES[tier];
}

/** Sole SSOT for tier → strength band of a league. */
export function resolveLeagueStrengthProfile(tier: LeagueTier): LeagueStrengthProfile {
  return PROFILES[tier];
}

/**
 * Deterministic AI player skill within profile band.
 * skill = min + (hash(oppId:index) % (max - min + 1)) + club offset, kept inside the band
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
  return Math.max(min, Math.min(max, min + (h % span) + opponentClubOffset(opponentClubId)));
}

/** Fixed club class inside the band: -4..4 skill points. XI averages alone sit within ~2. */
function opponentClubOffset(opponentClubId: string): number {
  let h = stableHash(`${opponentClubId}|ai-strength`);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (((h ^ (h >>> 16)) >>> 0) % 9) - 4;
}

function stableHash(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
