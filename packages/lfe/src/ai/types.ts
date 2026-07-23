import type { MatchPhase, MatchState, MatchTactics, PitchSide } from '../match/domain';

/** Snapshot of factors AI uses for a side — pure data, no RNG. */
export type MatchAiSideContext = {
  readonly side: PitchSide;
  readonly tactics: MatchTactics;
  /** 0–1 relative squad strength from skills. */
  readonly strength: number;
  /** 0–1 remaining energy/freshness (1 = fresh). */
  readonly freshness: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  /** goalsFor - goalsAgainst */
  readonly scoreDiff: number;
  readonly formationAggressiveness: number;
  readonly possessionShare: number;
};

export type MatchAiContext = {
  readonly phase: MatchPhase;
  readonly displayMinute: number;
  readonly home: MatchAiSideContext;
  readonly away: MatchAiSideContext;
};

/** Who should hold the ball this tick (probability of home). */
export type MatchAiPossessionDecision = {
  readonly homeChance: number;
};

/**
 * Probabilities for the in-possession resolution ladder.
 * Engine rolls RNG against these; AI never mutates MatchState.
 */
export type MatchAiActionDecision = {
  readonly attackChance: number;
  readonly shotChance: number;
  readonly foulChance: number;
  readonly onTargetChance: number;
  readonly cornerChance: number;
  readonly goalChance: number;
  /** Debug / tests — which side the decision was built for. */
  readonly side: PitchSide;
};

export type MatchAiDecision =
  | { readonly kind: 'possession'; readonly decision: MatchAiPossessionDecision }
  | { readonly kind: 'action'; readonly decision: MatchAiActionDecision };
