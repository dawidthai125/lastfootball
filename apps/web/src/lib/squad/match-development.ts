import { resolveCareerPhase } from '@/lib/squad/career-phase';
import { DEVELOPMENT_THIN } from '@/lib/squad/development-thin';
import { allowGrowthImpulse, resolveGrowthSkillDelta, stableHash } from '@/lib/squad/growth-gate';

export type MatchDevPlayerSlice = {
  readonly id: string;
  readonly name?: string;
  readonly skill: number;
  readonly potential: number;
  readonly starter: boolean;
  /** Required for Career Phase / Growth Gate (LFE-CAREER-DECLINE-01). */
  readonly age: number;
};

export type MatchDevResultSlice = {
  readonly id: string;
  readonly skill: number;
};

export type MatchDevelopmentSummary = {
  readonly skillUp: number;
  readonly skillUpIds: readonly string[];
  readonly skillUpNames: readonly string[];
};

/**
 * Primary growth path (GDD §7.12) — Thin.
 * Max +1 skill / player / match; K_MATCH among starters; skill ≤ potential;
 * Growth Gate by Career Phase (decline/late soft coefficient).
 */
export function applyMatchDevelopmentEffects(
  players: readonly MatchDevPlayerSlice[],
  impulseKey = 'match',
): MatchDevResultSlice[] {
  // Another order in every match, so the same few players do not take all the growth.
  const eligible = players
    .filter((p) => p.starter && p.skill < p.potential && p.skill < 99 && p.potential >= 1)
    .map((p) => ({ p, at: stableHash(`${p.id}:${impulseKey}:order`) }))
    .sort((a, b) => a.at - b.at || (a.p.id < b.p.id ? -1 : 1))
    .map(({ p }) => p);

  const toBoost = new Set<string>();
  for (const row of eligible) {
    if (toBoost.size >= DEVELOPMENT_THIN.SKILL_UP_MAX_PER_MATCH) break;
    const phase = resolveCareerPhase({ age: row.age });
    if (!allowGrowthImpulse(row.id, impulseKey, phase)) continue;
    toBoost.add(row.id);
  }

  return players.map((p) => {
    if (!toBoost.has(p.id)) return { id: p.id, skill: p.skill };
    const phase = resolveCareerPhase({ age: p.age });
    const delta = resolveGrowthSkillDelta(p.id, impulseKey, phase);
    const next = Math.min(99, p.potential, p.skill + delta);
    return { id: p.id, skill: next };
  });
}

export function summarizeMatchDevelopment(
  before: readonly MatchDevPlayerSlice[],
  after: readonly MatchDevResultSlice[],
): MatchDevelopmentSummary {
  const byId = new Map(after.map((p) => [p.id, p]));
  const skillUpIds: string[] = [];
  const skillUpNames: string[] = [];
  for (const b of before) {
    const a = byId.get(b.id);
    if (!a || a.skill <= b.skill) continue;
    skillUpIds.push(b.id);
    if (b.name) skillUpNames.push(b.name);
  }
  return {
    skillUp: skillUpIds.length,
    skillUpIds,
    skillUpNames,
  };
}
