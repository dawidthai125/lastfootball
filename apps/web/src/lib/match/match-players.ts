import type { MatchState, PitchSide } from '@lastfootball/lfe';

/** One player of a finished match, as the statistics keep it (D143). */
export type MatchPlayerLine = {
  readonly id: string;
  readonly name: string;
  readonly side: PitchSide;
  readonly goals: number;
  readonly assists: number;
};

/** Everybody who was on the pitch. A goal of a penalty shoot-out belongs to nobody. */
export function matchPlayerLines(state: MatchState): readonly MatchPlayerLine[] {
  const names = new Map(state.players.map((p) => [p.id as string, p.name]));
  return state.statistics.players
    .filter((row) => row.minutesPlayed > 0 || row.goals > 0 || row.assists > 0)
    .map((row) => ({
      id: row.playerId,
      name: names.get(row.playerId) ?? 'Zawodnik',
      side: row.side,
      goals: row.goals,
      assists: row.assists,
    }));
}

/** What `settle_match` stores: our whole team, and opponents who scored or assisted. */
export function toStoredPlayers(lines: readonly MatchPlayerLine[], ourSide: PitchSide) {
  return lines
    .filter((line) => line.side === ourSide || line.goals > 0 || line.assists > 0)
    .map(({ id, name, side, goals, assists }) => ({
      id,
      name,
      mine: side === ourSide,
      goals,
      assists,
    }));
}

/** Stored JSON of a shared match. Null for a match from before the statistics. */
export function parsePlayerLines(raw: unknown): readonly MatchPlayerLine[] | null {
  if (!Array.isArray(raw)) return null;
  const out: MatchPlayerLine[] = [];
  for (const item of raw as Partial<MatchPlayerLine>[]) {
    if (typeof item?.id !== 'string' || typeof item.name !== 'string') return null;
    if (item.side !== 'home' && item.side !== 'away') return null;
    out.push({
      id: item.id,
      name: item.name,
      side: item.side,
      goals: Number(item.goals) || 0,
      assists: Number(item.assists) || 0,
    });
  }
  return out;
}
