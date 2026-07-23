import type { PitchSide } from '../match/domain';

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
 * Neutral (0–0, early) → 0 so ENGINE-01 baselines stay intact.
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

function freshnessModifier(freshness: number): number {
  // Fresh teams press/attack slightly more; tired reduce chance.
  return (freshness - 1) * 0.06;
}

function strengthDelta(ours: number, theirs: number): number {
  return (ours - theirs) * 0.08;
}

/**
 * Who keeps the ball — both sides' strength, tactics, fatigue, score.
 * At default equal teams / 0–0 → ~0.48 (ENGINE-01 home baseline).
 */
export function decidePossession(ctx: MatchAiContext): MatchAiPossessionDecision {
  const h = ctx.home;
  const a = ctx.away;

  const homeMentality = h.tactics.mentality / 100;
  const homePressing = h.tactics.pressing / 100;
  let homeChance =
    0.48 + (homeMentality - 0.5) * 0.12 + (homePressing - 0.5) * 0.06;

  homeChance += strengthDelta(h.strength, a.strength);
  homeChance += (h.freshness - a.freshness) * 0.04;
  homeChance += (h.formationAggressiveness - a.formationAggressiveness) * 0.03;
  homeChance += scorePhaseModifier(h, ctx.displayMinute) * 0.5;
  homeChance -= scorePhaseModifier(a, ctx.displayMinute) * 0.5;
  // Slight continuity of current possession share
  homeChance += (h.possessionShare - 0.5) * 0.04;

  return Object.freeze({ homeChance: clamp01(homeChance) });
}

/**
 * In-possession action ladder for `side`.
 * Baseline matches MATCH-ENGINE-01 when tactics default & score neutral.
 */
export function decideAction(
  ctx: MatchAiContext,
  side: PitchSide,
): MatchAiActionDecision {
  const ours = sideContext(ctx, side);
  const theirs = sideContext(ctx, side === 'home' ? 'away' : 'home');
  const t = ours.tactics;
  const pressure = scorePhaseModifier(ours, ctx.displayMinute);
  const fresh = freshnessModifier(ours.freshness);
  const str = strengthDelta(ours.strength, theirs.strength);
  const form = (ours.formationAggressiveness - 0.5) * 0.06;
  const width = (t.width / 100 - 0.5) * 0.04;
  const tempo = t.tempo / 100;
  const mentality = t.mentality / 100;
  const pressing = t.pressing / 100;

  const attackChance = clamp01(
    0.08 + tempo * 0.06 + pressure * 0.6 + fresh + str * 0.5 + form + width * 0.5,
  );
  const shotChance = clamp01(
    0.35 + mentality * 0.15 + pressure * 0.5 + str * 0.4 + form * 0.5,
  );
  const foulChance = clamp01(0.12 + (pressing - 0.5) * 0.06 + (1 - ours.freshness) * 0.04);
  const onTargetChance = clamp01(0.45 + str * 0.5 + (ours.strength - 0.5) * 0.1);
  const cornerChance = clamp01(0.25 + width * 0.5 + (t.width / 100 - 0.5) * 0.05);
  const goalChance = clamp01(
    0.22 + mentality * 0.08 + pressure * 0.35 + str * 0.6 + form * 0.4,
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

export function decidePossessionFromState(state: MatchState): MatchAiPossessionDecision {
  return decidePossession(buildMatchAiContext(state));
}

export function decideActionFromState(
  state: MatchState,
  side: PitchSide,
): MatchAiActionDecision {
  return decideAction(buildMatchAiContext(state), side);
}
