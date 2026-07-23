/**
 * Match tactics snapshot — GAMEPLAY-01.
 * Mutated only via CommandBus; read by UI / Match AI.
 */

export interface MatchTactics {
  readonly mentality: number;
  readonly pressing: number;
  readonly tempo: number;
  readonly width: number;
  /** Formation code string mirrored from lineup (updated on ChangeFormation). */
  readonly formationCode: string;
  readonly styleLabel: string;
  readonly playerInstructions: Readonly<Record<string, string>>;
}

export const DEFAULT_MATCH_TACTICS: MatchTactics = Object.freeze({
  mentality: 50,
  pressing: 50,
  tempo: 50,
  width: 50,
  formationCode: '4-4-2',
  styleLabel: 'Zbilansowany',
  playerInstructions: Object.freeze({}),
});

export function createMatchTactics(partial?: Partial<MatchTactics>): MatchTactics {
  return Object.freeze({
    ...DEFAULT_MATCH_TACTICS,
    ...partial,
    playerInstructions: Object.freeze({
      ...(partial?.playerInstructions ?? DEFAULT_MATCH_TACTICS.playerInstructions),
    }),
  });
}
