import type { PlayerStatus } from '@/lib/squad/types';
import { resolveCareerPhase } from '@/lib/squad/career-phase';
import { allowGrowthImpulse } from '@/lib/squad/growth-gate';
import {
  bumpGroup,
  energyAfterTraining,
  groupKeyForFocus,
  type AttrGroups,
} from '@/lib/squad/truth';
import {
  TRAINING_THIN,
  type TrainingFocusId,
  type TrainingIntensityId,
  type TrainingSessionSummary,
} from '@/lib/training/types';

export type TrainingPlayerSlice = {
  readonly id: string;
  readonly name?: string;
  readonly status: PlayerStatus;
  readonly skill: number;
  readonly potential: number;
  /** Required for Career Phase / Growth Gate (LFE-CAREER-DECLINE-01). */
  readonly age: number;
  readonly pos?: string;
  readonly groups?: AttrGroups;
  readonly energy?: number;
};

function focusSkillOffset(focusId: TrainingFocusId): number {
  switch (focusId) {
    case 'technique':
      return 1;
    case 'physical':
      return 2;
    case 'tactics':
    default:
      return 0;
  }
}

function skillBoostIds(
  players: readonly TrainingPlayerSlice[],
  focusId: TrainingFocusId,
  intensityId: TrainingIntensityId,
  impulseKey: string,
): ReadonlySet<string> {
  if (intensityId === 'light' || focusId === 'regeneration') {
    return new Set();
  }

  const eligible = players.filter((p) => {
    if (p.status === 'INJURED' || p.status === 'SUSPENDED' || p.status === 'DEPARTED') {
      return false;
    }
    if (p.skill >= 99) return false;
    if (p.skill >= p.potential) return false;
    if (p.skill >= TRAINING_THIN.SKILL_SOFT_CEILING && intensityId !== 'high') {
      return false;
    }
    return true;
  });

  const sorted = eligible.map((p) => p.id).sort();
  if (sorted.length === 0) return new Set();

  const byId = new Map(players.map((p) => [p.id, p]));
  const offset = focusSkillOffset(focusId) % sorted.length;
  const rotated = [...sorted.slice(offset), ...sorted.slice(0, offset)];
  const step = intensityId === 'high' ? 2 : 3;
  const toBoost = new Set<string>();
  for (
    let i = 0;
    i < rotated.length && toBoost.size < TRAINING_THIN.SKILL_UP_MAX_PER_SESSION;
    i += step
  ) {
    const id = rotated[i];
    if (!id) continue;
    const row = byId.get(id);
    if (!row) continue;
    const phase = resolveCareerPhase({ age: row.age });
    if (!allowGrowthImpulse(id, impulseKey, phase)) continue;
    toBoost.add(id);
  }
  return toBoost;
}

/**
 * Pure status + skill transitions for a team training session.
 * Never changes roster size — only `status` and `players.skill` (Thin depth).
 * Anti-farm: max +1 skill / player / session; K = SKILL_UP_MAX_PER_SESSION;
 * Growth Gate by Career Phase (shared helper with Match PRIMARY).
 */
export function applyTrainingSessionEffects(
  players: readonly TrainingPlayerSlice[],
  focusId: TrainingFocusId,
  intensityId: TrainingIntensityId,
  impulseKey = 'training',
): TrainingPlayerSlice[] {
  if (focusId === 'regeneration') {
    return players.map((p) => {
      const trained =
        typeof p.energy === 'number'
          ? energyAfterTraining({
              energy: p.energy,
              focus: focusId,
              intensity: intensityId,
              status: p.status,
            })
          : null;
      if (p.status === 'TIRED' || trained?.status === 'READY') {
        return {
          ...p,
          status: 'READY' as const,
          skill: p.skill,
          energy: trained?.energy ?? p.energy,
        };
      }
      return p;
    });
  }

  if (intensityId === 'light') {
    return players.map((p) => {
      if (typeof p.energy !== 'number') return p;
      const trained = energyAfterTraining({
        energy: p.energy,
        focus: focusId,
        intensity: intensityId,
        status: p.status,
      });
      return { ...p, energy: trained.energy, status: trained.status };
    });
  }

  // Deterministic: sort by id, mark every Nth READY → TIRED.
  const step = intensityId === 'high' ? 2 : 3;
  const readyIds = players
    .filter((p) => p.status === 'READY')
    .map((p) => p.id)
    .sort();
  const toTire = new Set<string>();
  for (let i = 0; i < readyIds.length; i += step) {
    const id = readyIds[i];
    if (id) toTire.add(id);
  }

  const toBoost = skillBoostIds(players, focusId, intensityId, impulseKey);

  return players.map((p) => {
    let status = p.status;
    if (p.status !== 'INJURED' && p.status !== 'SUSPENDED' && p.status !== 'DEPARTED') {
      if (p.status === 'READY' && toTire.has(p.id)) {
        status = 'TIRED';
      }
    }

    let skill = p.skill;
    let groups = p.groups;
    if (toBoost.has(p.id)) {
      skill = Math.min(99, p.potential, p.skill + TRAINING_THIN.SKILL_UP_MAX_PER_PLAYER);
      const key = groupKeyForFocus(focusId, p.pos ?? '');
      if (groups && key) {
        groups = bumpGroup(groups, key, 1, p.potential);
      }
    }

    const trained =
      typeof p.energy === 'number'
        ? energyAfterTraining({
            energy: p.energy,
            focus: focusId,
            intensity: intensityId,
            status,
          })
        : null;

    return {
      ...p,
      status: trained?.status ?? status,
      skill,
      groups,
      energy: trained?.energy ?? p.energy,
      potential: p.potential,
      age: p.age,
    };
  });
}

/** Diff summary for post-session feedback (pure). */
export function summarizeTrainingSessionEffects(
  before: readonly TrainingPlayerSlice[],
  after: readonly TrainingPlayerSlice[],
): TrainingSessionSummary {
  const byId = new Map(after.map((p) => [p.id, p]));
  let tired = 0;
  let regenerated = 0;
  let skillUp = 0;
  const skillUpNames: { id: string; name: string }[] = [];
  for (const b of before) {
    const a = byId.get(b.id);
    if (!a) continue;
    if (b.status === 'READY' && a.status === 'TIRED') tired += 1;
    if (b.status === 'TIRED' && a.status === 'READY') regenerated += 1;
    if (a.skill > b.skill) {
      skillUp += 1;
      skillUpNames.push({ id: b.id, name: b.name ?? b.id });
    }
  }
  return {
    trained: before.length,
    tired,
    regenerated,
    skillUp,
    skillUpNames,
  };
}
