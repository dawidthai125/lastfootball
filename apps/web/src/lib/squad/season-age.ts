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
 * Pure season-end age tick (LFE-PLAYERS-02).
 * NOT wired to product IO — no auto age++ until real season-end exists.
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
    // skill never exceeds potential
    skill = Math.min(skill, p.potential);
    return { id: p.id, age, skill };
  });
}

/**
 * Product hook placeholder — call only from a future real season-end pipeline.
 * Currently a no-op document of intent (does not mutate DB).
 */
export function onSeasonEnd(_clubId: string): void {
  // Hook only — Owner lock: no automatic age++ in LFE-PLAYERS-02.
  void _clubId;
}
