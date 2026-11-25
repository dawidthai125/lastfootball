import type { PitchSide } from './ids';

/**
 * Full match rules (D151): cards that remove a player, injuries, penalties, free kicks,
 * corners, offsides, tiring legs and the captain. A match without them plays the old way,
 * so a match that was already running when the rules came in keeps its own course.
 */
export interface MatchRules {
  /** Sides whose substitutions the engine makes. A manager's side is not here. */
  readonly autoSides: readonly PitchSide[];
  /** Substitutions per side. */
  readonly maxSubstitutions: number;
  /** Neutral ground: neither side is at home. Absent = the first side hosts. */
  readonly neutral?: boolean;
}

export function createMatchRules(input: Partial<MatchRules>): MatchRules {
  return Object.freeze({
    autoSides: Object.freeze([...(input.autoSides ?? [])]),
    maxSubstitutions: input.maxSubstitutions ?? 3,
    ...(input.neutral ? { neutral: true } : {}),
  });
}
