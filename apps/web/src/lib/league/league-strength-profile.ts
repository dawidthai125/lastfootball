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
