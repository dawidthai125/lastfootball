import type { PlayerSkills } from '@lastfootball/lfe';

/**
 * Thin Adapter: single DB `players.skill` → uniform LFE PlayerSkills.
 * Not a multi-attribute mapper — future career/attribute models get their own EPIC.
 */
export function mapPlayerSkillToLfeSkills(skill: number): PlayerSkills {
  const v = clampSkill(skill);
  return Object.freeze({
    finishing: v,
    longShots: v,
    volleys: v,
    heading: v,
    shortPassing: v,
    longPassing: v,
    crossing: v,
    ballControl: v,
    dribbling: v,
    tackling: v,
    marking: v,
    positioning: v,
    vision: v,
    composure: v,
    reactions: v,
    gkDiving: v,
    gkHandling: v,
    gkReflexes: v,
    gkPositioning: v,
  });
}

export function clampSkill(skill: number): number {
  if (!Number.isFinite(skill)) return 1;
  return Math.max(1, Math.min(99, Math.trunc(skill)));
}
