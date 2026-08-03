import { resolveCareerPhase } from '@/lib/squad/career-phase';
import { DEVELOPMENT_THIN } from '@/lib/squad/development-thin';
import { allowGrowthImpulse } from '@/lib/squad/growth-gate';

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
  const eligible = players
    .filter((p) => p.starter && p.skill < p.potential && p.skill < 99 && p.potential >= 1)
    .map((p) => p.id)
    .sort();

  const byId = new Map(players.map((p) => [p.id, p]));
  const toBoost = new Set<string>();
  const step = 2;
  for (
    let i = 0;
    i < eligible.length && toBoost.size < DEVELOPMENT_THIN.SKILL_UP_MAX_PER_MATCH;
    i += step
  ) {
    const id = eligible[i];
    if (!id) continue;
    const row = byId.get(id);
    if (!row) continue;
    const phase = resolveCareerPhase({ age: row.age });
    if (!allowGrowthImpulse(id, impulseKey, phase)) continue;
    toBoost.add(id);
  }

  return players.map((p) => {
    if (!toBoost.has(p.id)) return { id: p.id, skill: p.skill };
    const next = Math.min(99, p.potential, p.skill + DEVELOPMENT_THIN.SKILL_UP_MAX_PER_PLAYER);
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
