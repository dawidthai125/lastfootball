import type { MatchState, MatchTactics, PitchSide, Player } from '../match/domain';
import { createMatchTactics } from '../match/domain';

import type { MatchAiContext, MatchAiSideContext } from './types';

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** Higher = more attacking shape (0–1). */
export function formationAggressiveness(formationCode: string): number {
  const parts = formationCode.split('-').map((p) => Number.parseInt(p, 10));
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return 0.5;
  const defenders = parts[0] ?? 4;
  const attackers = parts[parts.length - 1] ?? 2;
  // 5-x-x defensive, 3-x-3 / 4-3-3 aggressive
  const defFactor = (5 - Math.min(5, Math.max(3, defenders))) / 2; // 3→1, 4→0.5, 5→0
  const atkFactor = Math.min(3, Math.max(1, attackers)) / 3; // 1→0.33, 2→0.66, 3→1
  return clamp01(0.35 * defFactor + 0.65 * atkFactor);
}

function lineupPlayers(state: MatchState, side: PitchSide): readonly Player[] {
  const ids = new Set(
    (side === 'home' ? state.homeLineup : state.awayLineup).slots.map((s) => s.playerId),
  );
  return state.players.filter((p) => p.side === side && ids.has(p.id));
}

function teamStrength(players: readonly Player[]): number {
  if (players.length === 0) return 0.5;
  let sum = 0;
  for (const p of players) {
    const s = p.skills;
    sum +=
      (s.finishing + s.ballControl + s.shortPassing + s.tackling + s.composure + s.positioning) /
      6 /
      100;
  }
  return clamp01(sum / players.length);
}

function teamFreshness(players: readonly Player[]): number {
  if (players.length === 0) return 1;
  let sum = 0;
  for (const p of players) {
    sum += (p.condition.energy + p.condition.freshness) / 200;
  }
  return clamp01(sum / players.length);
}

function tacticsForSide(state: MatchState, side: PitchSide): MatchTactics {
  if (side === 'home') return state.tactics;
  // Away manager stub: mirror formation, balanced dials until multi-manager.
  return createMatchTactics({
    mentality: 50,
    pressing: 50,
    tempo: 50,
    width: 50,
    formationCode: state.awayLineup.formationCode,
    styleLabel: 'Zbilansowany',
  });
}

function buildSide(state: MatchState, side: PitchSide): MatchAiSideContext {
  const players = lineupPlayers(state, side);
  const goalsFor = side === 'home' ? state.score.home : state.score.away;
  const goalsAgainst = side === 'home' ? state.score.away : state.score.home;
  const ourTicks =
    side === 'home' ? state.statistics.home.possessionTicks : state.statistics.away.possessionTicks;
  const theirTicks =
    side === 'home' ? state.statistics.away.possessionTicks : state.statistics.home.possessionTicks;
  const total = ourTicks + theirTicks;
  const tactics = tacticsForSide(state, side);

  return Object.freeze({
    side,
    tactics,
    strength: teamStrength(players),
    freshness: teamFreshness(players),
    goalsFor,
    goalsAgainst,
    scoreDiff: goalsFor - goalsAgainst,
    formationAggressiveness: formationAggressiveness(tactics.formationCode),
    possessionShare: total === 0 ? 0.5 : ourTicks / total,
  });
}

/** Build AI context from MatchState (read-only). */
export function buildMatchAiContext(state: MatchState): MatchAiContext {
  return Object.freeze({
    phase: state.phase,
    displayMinute: state.clock.displayMinute,
    home: buildSide(state, 'home'),
    away: buildSide(state, 'away'),
  });
}

export function sideContext(ctx: MatchAiContext, side: PitchSide): MatchAiSideContext {
  return side === 'home' ? ctx.home : ctx.away;
}
