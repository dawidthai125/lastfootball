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
 * Pure season age tick (LFE-AGE-01 · REUSE PLAYERS-02).
 * Sole rule SSOT for age++ / soft regress — Career Stages (Prime / Decline / …)
 * must derive from `age` + `DEVELOPMENT_THIN.AGE_REGRESS_FROM`, not forked constants.
 */
export function applySeasonAgeEffects(
  players: readonly SeasonAgePlayerSlice[],
): SeasonAgeResultSlice[] {
  return players.map((p) => {
    const age = Math.min(50, p.age + 1);
    let skill = p.skill;
    if (age >= DEVELOPMENT_THIN.AGE_REGRESS_FROM && skill > 1) {
      skill = Math.max(1, Math.min(p.potential, skill - 1));
    }
    skill = Math.min(skill, p.potential);
    return { id: p.id, age, skill };
  });
}
