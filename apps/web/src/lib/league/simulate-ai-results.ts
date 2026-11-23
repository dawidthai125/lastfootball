/**
 * Deterministic AI↔AI scores for Thin league table (not Match Engine).
 * Poisson goals from club strength; seed = season + venue pair (`ai-v3`).
 * Double Round Robin (LFE-LEAGUE-04): each AI pair plays home and away.
 * The table counts a week only after the manager has played that matchday.
 */

import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
import type { LeagueTier } from '@/lib/league/league-tier';
import { hashSeed } from '@/lib/match/hash-seed';
import { seedOpponentSquad } from '@/lib/squad/seed-roster';

export type AiMatchResult = {
  readonly homeId: string;
  readonly awayId: string;
  readonly homeScore: number;
  readonly awayScore: number;
};

/** Season being played (or closed) and its tier — always from the same club row. */
export type AiSeasonContext = {
  readonly seasonNumber: number;
  readonly tier: LeagueTier;
};

/** Goals per side for an even pair. With the strength spread below: ~2.7 per match, 55/45. */
const BASE_HOME_GOALS = 1.43;
const BASE_AWAY_GOALS = 1.17;
/** How strongly one skill point of difference moves the expected goals. */
const STRENGTH_WEIGHT = 0.09;
const MAX_GOALS = 9;

/**
 * All ordered AI pairs (home/away both directions) — double RR.
 * Score seed is per season and venue (`ai-v3`) so return legs are independent.
 */
export function planAiVsAiMatches(
  aiIds: readonly string[],
  ctx: AiSeasonContext,
): readonly AiMatchResult[] {
  const sorted = [...aiIds].sort((a, b) => a.localeCompare(b));
  const out: AiMatchResult[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = 0; j < sorted.length; j += 1) {
      if (i === j) continue;
      const homeId = sorted[i]!;
      const awayId = sorted[j]!;
      const { homeScore, awayScore } = scorePair(homeId, awayId, ctx);
      out.push({ homeId, awayId, homeScore, awayScore });
    }
  }
  return out;
}

function scorePair(
  homeId: string,
  awayId: string,
  ctx: AiSeasonContext,
): { homeScore: number; awayScore: number } {
  const gap = aiTableStrength(homeId, ctx.tier) - aiTableStrength(awayId, ctx.tier);
  const edge = Math.exp(STRENGTH_WEIGHT * gap);
  const seed = `${homeId}|${awayId}|s${ctx.seasonNumber}|ai-v3`;
  return {
    homeScore: poissonGoals(BASE_HOME_GOALS * edge, unitHash(`${seed}|home`)),
    awayScore: poissonGoals(BASE_AWAY_GOALS / edge, unitHash(`${seed}|away`)),
  };
}

const strengthCache = new Map<string, number>();

/**
 * Average skill of the XI the manager faces (`seedOpponentSquad`), so the table
 * and the pitch agree on who is strong.
 */
export function aiTableStrength(clubId: string, tier: LeagueTier): number {
  const key = `${tier}|${clubId}`;
  const cached = strengthCache.get(key);
  if (cached !== undefined) return cached;
  const xi = seedOpponentSquad(clubId, tier);
  const strength = xi.reduce((sum, p) => sum + (p.skill ?? 0), 0) / xi.length;
  strengthCache.set(key, strength);
  return strength;
}

/** Inverse Poisson CDF: `u` in [0, 1) → goals. */
function poissonGoals(lambda: number, u: number): number {
  let p = Math.exp(-lambda);
  let cumulative = p;
  let goals = 0;
  while (u >= cumulative && goals < MAX_GOALS) {
    goals += 1;
    p *= lambda / goals;
    cumulative += p;
  }
  return goals;
}

/** FNV alone barely moves the high bits for similar keys, so finish with a full mix. */
function unitHash(key: string): number {
  let h = hashSeed(key);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 2 ** 32;
}

type Pair = { homeId: string; awayId: string };

/** Single round-robin. First id stays fixed; the rest rotate. Even count required. */
function circleRounds(ids: readonly string[]): Pair[][] {
  const fixed = ids[0];
  if (!fixed || ids.length < 2 || ids.length % 2 !== 0) return [];
  const rotating = ids.slice(1);
  const n = ids.length;
  const rounds: Pair[][] = [];
  for (let r = 0; r < n - 1; r += 1) {
    const row = [fixed, ...rotating];
    const pairs: Pair[] = [];
    for (let i = 0; i < n / 2; i += 1) {
      pairs.push({ homeId: row[i]!, awayId: row[n - 1 - i]! });
    }
    rounds.push(pairs);
    const last = rotating.pop();
    if (last) rotating.unshift(last);
  }
  return rounds;
}

/**
 * AI↔AI scores for league weeks the manager has already played.
 * A full set of played matchdays (1–22) is the same ordered pairs as
 * `planAiVsAiMatches`. Unplayed weeks stay off the table.
 */
export function planAiMatchesForPlayedWeeks(
  clubId: string,
  playedMatchdays: ReadonlySet<number>,
  ctx: AiSeasonContext,
): readonly AiMatchResult[] {
  if (playedMatchdays.size === 0) return [];
  const plan = planClubFixtures(clubId);
  const firstLeg = plan.slice(0, 11);
  const rounds = circleRounds([clubId, ...firstLeg.map((p) => p.opponentClubId)]);
  const byOpp = new Map(firstLeg.map((p) => [p.opponentClubId, p]));
  const out: AiMatchResult[] = [];

  for (const pairs of rounds) {
    const playerPair = pairs.find((p) => p.homeId === clubId || p.awayId === clubId);
    if (!playerPair) continue;
    const oppId = playerPair.homeId === clubId ? playerPair.awayId : playerPair.homeId;
    const leg = byOpp.get(oppId);
    if (!leg) continue;
    const flip = (playerPair.homeId === clubId) !== leg.isHome;
    const orient = (p: Pair): Pair => (flip ? { homeId: p.awayId, awayId: p.homeId } : p);
    const aiPairs = pairs.filter((p) => p.homeId !== clubId && p.awayId !== clubId).map(orient);

    const push = (week: number, swap: boolean) => {
      if (!playedMatchdays.has(week)) return;
      for (const p of aiPairs) {
        const pair = swap ? { homeId: p.awayId, awayId: p.homeId } : p;
        const score = scorePair(pair.homeId, pair.awayId, ctx);
        out.push({ homeId: pair.homeId, awayId: pair.awayId, ...score });
      }
    };
    push(leg.matchday, false);
    push(leg.matchday + 11, true);
  }
  return out;
}
