import type { MatchState, PitchSide } from '@lastfootball/lfe';

/** One player of a finished match, as the statistics keep it (D143). */
export type MatchPlayerLine = {
  readonly id: string;
  readonly name: string;
  readonly side: PitchSide;
  readonly goals: number;
  readonly assists: number;
  /** Full rules (D151): what happened to him. Absent = nothing, or an older match. */
  readonly card?: 'yellow' | 'second_yellow' | 'red';
  readonly injury?: 'minor' | 'serious';
  readonly minutes?: number;
};

/** Everybody who was on the pitch. A goal of a penalty shoot-out belongs to nobody. */
export function matchPlayerLines(state: MatchState): readonly MatchPlayerLine[] {
  const names = new Map(state.players.map((p) => [p.id as string, p.name]));
  return state.statistics.players
    .filter(
      (row) =>
        row.minutesPlayed > 0 ||
        // Off in the first minute: he played, for no full minute.
        state.substitutions.some((s) => s.playerOutId === row.playerId) ||
        row.goals > 0 ||
        row.assists > 0 ||
        state.cards.some((c) => c.playerId === row.playerId) ||
        state.injuries.some((i) => i.playerId === row.playerId),
    )
    .map((row) => ({
      id: row.playerId,
      name: names.get(row.playerId) ?? 'Zawodnik',
      side: row.side,
      goals: row.goals,
      assists: row.assists,
      ...(state.rules ? incidentsOf(state, row.playerId, row.minutesPlayed) : {}),
    }));
}

function incidentsOf(
  state: MatchState,
  id: string,
  minutes: number,
): Pick<MatchPlayerLine, 'card' | 'injury' | 'minutes'> {
  // The last card is the heaviest one: a second yellow comes after the first.
  const card = state.cards.filter((c) => c.playerId === id).at(-1)?.type;
  const injury = state.injuries.find((i) => i.playerId === id)?.severity;
  return {
    minutes,
    ...(card ? { card } : {}),
    ...(injury ? { injury: injury === 'serious' ? 'serious' : 'minor' } : {}),
  };
}

/** Facts for the squad after a full-rules match. Null = the match knows none. */
export function incidentsById(
  lines: readonly MatchPlayerLine[],
): Readonly<Record<string, Pick<MatchPlayerLine, 'card' | 'injury' | 'minutes'>>> | null {
  if (!lines.some((line) => line.minutes !== undefined)) return null;
  return Object.fromEntries(
    lines.map(({ id, card, injury, minutes }) => [id, { card, injury, minutes }]),
  );
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
      ...(typeof item.minutes === 'number' ? { minutes: item.minutes } : {}),
      ...(item.card === 'yellow' || item.card === 'second_yellow' || item.card === 'red'
        ? { card: item.card }
        : {}),
      ...(item.injury === 'minor' || item.injury === 'serious' ? { injury: item.injury } : {}),
    });
  }
  return out;
}
