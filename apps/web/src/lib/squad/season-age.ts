import { resolveCareerPhase } from '@/lib/squad/career-phase';
import { DEVELOPMENT_THIN } from '@/lib/squad/development-thin';

export type SeasonAgePlayerSlice = {
  readonly id: string;
  readonly age: number;
  readonly skill: number;
  readonly potential: number;
};

export type SeasonAgeResultSlice = {
  readonly id: string;
  readonly age: number;
  readonly skill: number;
};

/**
 * Pure season age tick (LFE-AGE-01 · LFE-CAREER-DECLINE-01).
 * Sole rule SSOT for age++ / seasonal skill regress — one path for full roster
 * (senior + academy_track). Career Phase derive drives regress Δ.
 */
export function applySeasonAgeEffects(
  players: readonly SeasonAgePlayerSlice[],
): SeasonAgeResultSlice[] {
  return players.map((p) => {
    const age = Math.min(50, p.age + 1);
    const phase = resolveCareerPhase({ age });
    let skill = p.skill;
    const delta = seasonalRegressDelta(phase);
    if (delta > 0 && skill > 1) {
      skill = Math.max(1, Math.min(p.potential, skill - delta));
    }
    skill = Math.min(skill, p.potential);
    return { id: p.id, age, skill };
  });
}

function seasonalRegressDelta(phase: ReturnType<typeof resolveCareerPhase>): number {
  switch (phase) {
    case 'decline':
      return DEVELOPMENT_THIN.REGRESS_DELTA_DECLINE;
    case 'late':
      return DEVELOPMENT_THIN.REGRESS_DELTA_LATE;
    default:
      return 0;
  }
}
