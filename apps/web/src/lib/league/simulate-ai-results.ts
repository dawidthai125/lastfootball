/**
 * Deterministic AI↔AI scores for Thin league table (not Match Engine).
 * Double Round Robin (LFE-LEAGUE-04): each AI pair plays home and away.
 * The table counts a week only after the manager has played that matchday.
 */

import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';

export type AiMatchResult = {
  readonly homeId: string;
  readonly awayId: string;
  readonly homeScore: number;
  readonly awayScore: number;
};

/**
 * All ordered AI pairs (home/away both directions) — double RR.
 * Score seed is per venue (`ai-v2`) so return legs are independent.
 */
export function planAiVsAiMatches(aiIds: readonly string[]): readonly AiMatchResult[] {
  const sorted = [...aiIds].sort((a, b) => a.localeCompare(b));
  const out: AiMatchResult[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = 0; j < sorted.length; j += 1) {
      if (i === j) continue;
      const homeId = sorted[i]!;
      const awayId = sorted[j]!;
      const { homeScore, awayScore } = scorePair(homeId, awayId);
      out.push({ homeId, awayId, homeScore, awayScore });
    }
  }
  return out;
}

function scorePair(homeId: string, awayId: string): { homeScore: number; awayScore: number } {
  const h = hashSeed(`${homeId}|${awayId}|ai-v2`);
  const homeScore = h % 4; // 0–3
  const awayScore = Math.floor(h / 4) % 4;
  return { homeScore, awayScore };
}

function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
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
        const score = scorePair(pair.homeId, pair.awayId);
        out.push({ homeId: pair.homeId, awayId: pair.awayId, ...score });
      }
    };
    push(leg.matchday, false);
    push(leg.matchday + 11, true);
  }
  return out;
}
