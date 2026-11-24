import {
  HUMAN_ROUND_COUNT,
  isBotClubId,
  kickoffDate,
  kickoffWindowState,
  pairingsForMatchday,
  type HumanSeat,
} from '@/lib/league/human-league';
import { aiTableStrength, scoreFromStrength } from '@/lib/league/simulate-ai-results';

export type HumanTableRow = {
  readonly id: string;
  readonly name: string;
  readonly isBot: boolean;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly points: number;
};

export type HumanResult = {
  readonly round: number;
  readonly homeId: string;
  readonly awayId: string;
  readonly homeScore: number;
  readonly awayScore: number;
};

/**
 * Standings of one season (D138). A match with a human club counts once somebody played it.
 * Two bots play on their own after the shared window, at the strength people meet them with.
 */
export function resolveHumanTable(input: {
  readonly seats: readonly HumanSeat[];
  readonly seasonKey: string;
  readonly results: readonly HumanResult[];
  readonly now: Date;
}): readonly HumanTableRow[] {
  const rows = new Map(
    input.seats.map((seat) => [
      seat.id,
      {
        id: seat.id,
        name: seat.name,
        isBot: seat.kind === 'bot',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      },
    ]),
  );
  const add = (id: string, ours: number, theirs: number) => {
    const row = rows.get(id);
    if (!row) return;
    row.played += 1;
    row.goalsFor += ours;
    row.goalsAgainst += theirs;
    if (ours > theirs) row.won += 1;
    else if (ours < theirs) row.lost += 1;
    else row.drawn += 1;
    row.points += ours > theirs ? 3 : ours === theirs ? 1 : 0;
  };
  const key = (round: number, home: string, away: string) => `${round}|${home}|${away}`;
  const stored = new Map(input.results.map((r) => [key(r.round, r.homeId, r.awayId), r]));

  for (let round = 1; round <= HUMAN_ROUND_COUNT; round += 1) {
    const over = kickoffWindowState(input.now, kickoffDate(input.seasonKey, round)) === 'after';
    for (const { home, away } of pairingsForMatchday(input.seats, round)) {
      const found = stored.get(key(round, home.id, away.id));
      const score =
        found ??
        (over && isBotClubId(home.id) && isBotClubId(away.id)
          ? scoreFromStrength({
              gap: aiTableStrength(home.id, 'iv') - aiTableStrength(away.id, 'iv'),
              seed: `human-table|${input.seasonKey}|${round}|${home.id}|${away.id}`,
            })
          : null);
      if (!score) continue;
      add(home.id, score.homeScore, score.awayScore);
      add(away.id, score.awayScore, score.homeScore);
    }
  }

  return [...rows.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst) ||
      b.goalsFor - a.goalsFor ||
      a.name.localeCompare(b.name, 'pl'),
  );
}
