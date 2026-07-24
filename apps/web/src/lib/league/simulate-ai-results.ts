/**
 * Deterministic AI↔AI scores for Thin league table (not Match Engine).
 * Stable for a given player club seed + pair of opponent catalog ids.
 */

export type AiMatchResult = {
  readonly homeId: string;
  readonly awayId: string;
  readonly homeScore: number;
  readonly awayScore: number;
};

/** All unordered AI pairs as home/away (lower id = home). */
export function planAiVsAiMatches(aiIds: readonly string[]): readonly AiMatchResult[] {
  const sorted = [...aiIds].sort((a, b) => a.localeCompare(b));
  const out: AiMatchResult[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      const homeId = sorted[i]!;
      const awayId = sorted[j]!;
      const { homeScore, awayScore } = scorePair(homeId, awayId);
      out.push({ homeId, awayId, homeScore, awayScore });
    }
  }
  return out;
}

function scorePair(homeId: string, awayId: string): { homeScore: number; awayScore: number } {
  const h = hashSeed(`${homeId}|${awayId}|ai-v1`);
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
