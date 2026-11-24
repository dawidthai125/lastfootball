import { DEFAULT_PLAYER_CONDITION, type PitchSide } from '../match/domain';

import { buildMatchAiContext, sideContext } from './context';
import type {
  MatchAiActionDecision,
  MatchAiContext,
  MatchAiPossessionDecision,
  MatchAiSideContext,
} from './types';
import type { MatchState } from '../match/domain';

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * Score / clock pressure: trailing → attack more; leading → sit deeper.
 * Neutral (0–0, early) → 0 so MATCH_BALANCE bases stay intact.
 */
export function scorePhaseModifier(side: MatchAiSideContext, displayMinute: number): number {
  let m = 0;
  const diff = side.scoreDiff;
  if (diff < 0) m += 0.035 * Math.min(3, -diff);
  if (diff > 0) m -= 0.028 * Math.min(3, diff);
  if (displayMinute >= 75 && diff < 0) m += 0.045;
  if (displayMinute >= 75 && diff > 0) m -= 0.035;
  if (displayMinute >= 85 && diff < 0) m += 0.02;
  return m;
}

/**
 * MATCH-BALANCE-01 — sole SSOT for match rates, per tick of a 45 s half (about 1800 play ticks).
 * Equal teams, default tactics: ~2.7 goals, ~25 shots, ~25% draws, home ~55% of goals.
 * Guarded by match-balance01.test.ts. Modifiers multiply, so they scale with the base.
 */
export const MATCH_BALANCE = Object.freeze({
  HOME_POSSESSION: 0.51,
  ATTACK: 0.0385,
  SHOT: 0.37,
  ON_TARGET: 0.36,
  GOAL: 0.3,
  FOUL: 0.5,
  CORNER: 0.3,
  HOME_ATTACK_EDGE: 0.07,
  STRENGTH_POSSESSION: 0.25,
  STRENGTH_ATTACK: 0.7,
  STRENGTH_ON_TARGET: 0.5,
  STRENGTH_GOAL: 0.75,
  FRESHNESS_ATTACK: 0.35,
  /** The default condition, carried by every opponent without stored morale. */
  MORALE_NEUTRAL: DEFAULT_PLAYER_CONDITION.morale,
  /** Points from neutral to the full effect, up and down. */
  MORALE_SPAN: 30,
  MORALE_ATTACK: 0.06,
  MORALE_GOAL: 0.06,
  /** Per player more than the rival has (D151). */
  MEN_ATTACK: 0.12,
  MEN_GOAL: 0.06,
  MEN_POSSESSION: 0.05,
  /** Full effect of the best captain; double while the team is behind. */
  CAPTAIN: 0.025,
  SCORE_ATTACK: 1,
  SCORE_GOAL: 0.3,
  EXPOSURE_MENTALITY: 0.75,
  EXPOSURE_FORMATION: 0.3,
  EXPOSURE_TEMPO: 0.42,
  EXPOSURE_WIDTH: 0.12,
  EXPOSURE_PRESSING: 0.15,
  /** Half length the rates are tuned for. */
  REFERENCE_HALF_MS: 45_000,
});

/** 4-4-2 shape value — the neutral formation for exposure and attack. */
const NEUTRAL_SHAPE = 0.35 * 0.5 + 0.65 * (2 / 3);

function factor(n: number): number {
  return Math.max(0.2, Math.min(2.2, n));
}

/** -1 (broken team) … 0 (neutral) … 1 (flying). */
function moraleEdge(side: MatchAiSideContext): number {
  const edge = (side.morale - MATCH_BALANCE.MORALE_NEUTRAL) / MATCH_BALANCE.MORALE_SPAN;
  return Math.max(-1, Math.min(1, edge));
}

function menGap(ours: MatchAiSideContext, theirs: MatchAiSideContext): number {
  return (ours.men ?? 11) - (theirs.men ?? 11);
}

function captainFactor(side: MatchAiSideContext): number {
  return factor(1 + (side.captain ?? 0) * MATCH_BALANCE.CAPTAIN * (side.scoreDiff < 0 ? 2 : 1));
}

/**
 * Who keeps the ball — both sides' strength, tactics, fatigue, score.
 * At default equal teams / 0–0 → MATCH_BALANCE.HOME_POSSESSION.
 */
export function decidePossession(ctx: MatchAiContext): MatchAiPossessionDecision {
  const h = ctx.home;
  const a = ctx.away;

  const homeMentality = h.tactics.mentality / 100;
  const homePressing = h.tactics.pressing / 100;
  const awayMentality = a.tactics.mentality / 100;
  const awayPressing = a.tactics.pressing / 100;
  let homeChance =
    (ctx.neutral ? 0.5 : MATCH_BALANCE.HOME_POSSESSION) +
    (homeMentality - 0.5) * 0.04 +
    (homePressing - 0.5) * 0.06 -
    (awayMentality - 0.5) * 0.04 -
    (awayPressing - 0.5) * 0.06;

  homeChance += (h.strength - a.strength) * MATCH_BALANCE.STRENGTH_POSSESSION;
  homeChance += menGap(h, a) * MATCH_BALANCE.MEN_POSSESSION;
  homeChance += (h.freshness - a.freshness) * 0.04;
  homeChance += (h.formationAggressiveness - a.formationAggressiveness) * 0.03;
  homeChance += scorePhaseModifier(h, ctx.displayMinute) * 0.2;
  homeChance -= scorePhaseModifier(a, ctx.displayMinute) * 0.2;
  // Slight continuity of current possession share
  homeChance += (h.possessionShare - 0.5) * 0.04;

  return Object.freeze({ homeChance: clamp01(homeChance) });
}

/**
 * How open our own setup leaves us. Attacking mentality, forward formations, tempo,
 * width and pressing raise the rival's chances; deep, slow setups lower them.
 */
function exposure(side: MatchAiSideContext): number {
  return factor(
    1 +
      (side.tactics.mentality / 100 - 0.5) * MATCH_BALANCE.EXPOSURE_MENTALITY +
      (side.formationAggressiveness - NEUTRAL_SHAPE) * MATCH_BALANCE.EXPOSURE_FORMATION +
      (side.tactics.tempo / 100 - 0.5) * MATCH_BALANCE.EXPOSURE_TEMPO +
      (side.tactics.width / 100 - 0.5) * MATCH_BALANCE.EXPOSURE_WIDTH +
      (side.tactics.pressing / 100 - 0.5) * MATCH_BALANCE.EXPOSURE_PRESSING,
  );
}

/**
 * In-possession action ladder for `side`.
 * Default tactics, equal teams, level score → MATCH_BALANCE bases.
 */
export function decideAction(ctx: MatchAiContext, side: PitchSide): MatchAiActionDecision {
  const ours = sideContext(ctx, side);
  const theirs = sideContext(ctx, side === 'home' ? 'away' : 'home');
  const t = ours.tactics;
  const pressure = scorePhaseModifier(ours, ctx.displayMinute);
  const gap = ours.strength - theirs.strength;
  const morale = moraleEdge(ours);
  const shape = ours.formationAggressiveness - NEUTRAL_SHAPE;
  const width = t.width / 100 - 0.5;
  const tempo = t.tempo / 100 - 0.5;
  const mentality = t.mentality / 100 - 0.5;
  const pressing = t.pressing / 100;
  const edge = ctx.neutral ? 0 : MATCH_BALANCE.HOME_ATTACK_EDGE;
  const homeEdge = side === 'home' ? edge : -edge;

  const attackChance = clamp01(
    MATCH_BALANCE.ATTACK *
      factor(1 + homeEdge) *
      factor(1 + gap * MATCH_BALANCE.STRENGTH_ATTACK) *
      factor(1 + (ours.freshness - 1) * MATCH_BALANCE.FRESHNESS_ATTACK) *
      factor(1 + morale * MATCH_BALANCE.MORALE_ATTACK) *
      factor(1 + menGap(ours, theirs) * MATCH_BALANCE.MEN_ATTACK) *
      captainFactor(ours) *
      factor(1 + pressure * MATCH_BALANCE.SCORE_ATTACK) *
      factor(1 + tempo * 0.5 + shape * 0.35 + width * 0.2) *
      exposure(theirs),
  );
  const shotChance = clamp01(MATCH_BALANCE.SHOT * factor(1 + mentality * 0.35));
  const foulChance = clamp01(
    MATCH_BALANCE.FOUL * factor(1 + (pressing - 0.5) * 0.5 + (1 - ours.freshness) * 0.3),
  );
  const onTargetChance = clamp01(
    MATCH_BALANCE.ON_TARGET * factor(1 + gap * MATCH_BALANCE.STRENGTH_ON_TARGET),
  );
  const cornerChance = clamp01(MATCH_BALANCE.CORNER * factor(1 + width * 0.4));
  const goalChance = clamp01(
    MATCH_BALANCE.GOAL *
      factor(1 + gap * MATCH_BALANCE.STRENGTH_GOAL) *
      factor(1 + menGap(ours, theirs) * MATCH_BALANCE.MEN_GOAL) *
      captainFactor(ours) *
      factor(1 + morale * MATCH_BALANCE.MORALE_GOAL) *
      factor(1 + mentality * 0.2 + pressure * MATCH_BALANCE.SCORE_GOAL),
  );

  return Object.freeze({
    side,
    attackChance,
    shotChance,
    foulChance,
    onTargetChance,
    cornerChance,
    goalChance,
  });
}

/** A shorter match (onboarding) keeps full-match goal totals: more attacks per tick. */
export function attackScaleForHalf(halfDurationMs: number): number {
  if (!(halfDurationMs > 0)) return 1;
  return Math.max(1, Math.min(4, MATCH_BALANCE.REFERENCE_HALF_MS / halfDurationMs));
}

export function decidePossessionFromState(state: MatchState): MatchAiPossessionDecision {
  return decidePossession(buildMatchAiContext(state));
}

export function decideActionFromState(state: MatchState, side: PitchSide): MatchAiActionDecision {
  return decideAction(buildMatchAiContext(state), side);
}
