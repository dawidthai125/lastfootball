import {
  HUMAN_ROUND_COUNT,
  isBotClubId,
  kickoffDate,
  kickoffWindowState,
  pairingsForMatchday,
  type HumanSeat,
} from '@/lib/league/human-league';
import { botScore } from '@/lib/league/human-table';
import { parsePlayerLines } from '@/lib/match/match-players';
import { ScorerTally, type ScorerRow } from '@/lib/stats/scorers';

export type HumanBroadcastStats = {
  readonly homeId: string;
  readonly awayId: string;
  readonly stats: unknown;
};

/** Scorers of one human season (D143). Two bots share out the goals of their table score. */
export function resolveHumanScorers(input: {
  readonly seats: readonly HumanSeat[];
  readonly seasonKey: string;
  readonly broadcasts: readonly HumanBroadcastStats[];
  readonly now: Date;
  readonly clubId: string;
}): readonly ScorerRow[] {
  const tally = new ScorerTally();
  for (const match of input.broadcasts) {
    for (const line of parsePlayerLines(match.stats) ?? []) {
      const team = line.side === 'home' ? match.homeId : match.awayId;
      tally.add(team, line.id, line.name, line.goals, line.assists);
    }
  }
  for (let round = 1; round <= HUMAN_ROUND_COUNT; round += 1) {
    if (kickoffWindowState(input.now, kickoffDate(input.seasonKey, round)) !== 'after') continue;
    for (const { home, away } of pairingsForMatchday(input.seats, round)) {
      if (!isBotClubId(home.id) || !isBotClubId(away.id)) continue;
      const score = botScore(input.seasonKey, round, home.id, away.id);
      const seed = `human|${input.seasonKey}|${round}|${home.id}|${away.id}`;
      tally.addDerived(home.id, 'iv', score.homeScore, seed);
      tally.addDerived(away.id, 'iv', score.awayScore, seed);
    }
  }
  const names = new Map(input.seats.map((seat) => [seat.id, seat.name]));
  return tally.list((id) => names.get(id) ?? 'Rywal', input.clubId);
}
