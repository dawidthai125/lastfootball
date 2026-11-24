import { formatMoney } from '@/lib/finance/format-money';
import {
  isBotClubId,
  kickoffDate,
  kickoffWindowState,
  nextHumanRound,
  pairingForClub,
  type HumanSeat,
} from '@/lib/league/human-league';

/** A message about a match of two clubs (D143). Plain facts, no state of its own. */
export type MatchEventMessage = {
  readonly id: string;
  readonly subject: string;
  readonly fromLabel: string;
  readonly href: string;
};

const DAY_MS = 86_400_000;
export const CHALLENGE_NEWS_MS = 3 * DAY_MS;
export const AWARD_NEWS_MS = 7 * DAY_MS;
const MAX_CHALLENGES = 3;

export type ChallengeNews = {
  readonly id: string;
  readonly challengerName: string;
  readonly rivalName: string;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly playedAt: string;
};

export type HumanNews = {
  readonly seasonKey: string;
  readonly seats: readonly HumanSeat[];
  readonly playedRounds: readonly number[];
  readonly playedToday: boolean;
  /** Rounds whose shared score is known, so the rival has played already. */
  readonly decidedRounds: ReadonlySet<number>;
};

/** Matches other clubs played with ours. Our own score of a human round stays hidden here. */
export function resolveMatchEvents(input: {
  readonly clubId: string;
  readonly now: Date;
  readonly challenges: readonly ChallengeNews[];
  readonly human: HumanNews | null;
  readonly award: {
    readonly league: number;
    readonly season: number;
    readonly place: number;
    readonly amount: number;
    readonly closedAt: string;
  } | null;
}): readonly MatchEventMessage[] {
  const { now } = input;
  const fresh = (at: string, ms: number) => {
    const age = now.getTime() - new Date(at).getTime();
    return age >= 0 && age <= ms;
  };
  const out: MatchEventMessage[] = [];

  const human = input.human ? humanMessage(input.clubId, input.human, now) : null;
  if (human) out.push(human);

  const { award } = input;
  if (award && fresh(award.closedAt, AWARD_NEWS_MS)) {
    out.push({
      id: `msg:human-award:${award.league}:${award.season}`,
      subject:
        `Liga ludzi ${award.league}, sezon ${award.season}: ${award.place}. miejsce` +
        (award.amount > 0 ? `, nagroda ${formatMoney(award.amount)}` : ''),
      fromLabel: 'Liga ludzi',
      href: '/achievements',
    });
  }

  const challenges = input.challenges
    .filter((c) => fresh(c.playedAt, CHALLENGE_NEWS_MS))
    .sort((a, b) => b.playedAt.localeCompare(a.playedAt))
    .slice(0, MAX_CHALLENGES);
  for (const c of challenges) {
    out.push({
      id: `msg:challenge:${c.id}`,
      subject: `Wyzwanie rozegrane: ${c.challengerName} ${c.homeScore}:${c.awayScore} ${c.rivalName}`,
      fromLabel: 'Rywalizacja',
      href: '/rivals',
    });
  }
  return out;
}

function humanMessage(clubId: string, news: HumanNews, now: Date): MatchEventMessage | null {
  const round = nextHumanRound({
    seasonKey: news.seasonKey,
    playedRounds: news.playedRounds,
    now,
    playedHumanToday: news.playedToday,
  });
  if (!round) return null;
  const window = kickoffWindowState(now, kickoffDate(news.seasonKey, round));
  const pair = pairingForClub(news.seats, round, clubId);
  if (window === 'before' || !pair) return null;
  const rival = pair.home.id === clubId ? pair.away : pair.home;
  const rivalPlayed = news.decidedRounds.has(round) && !isBotClubId(rival.id);
  const tail = rivalPlayed
    ? `rywal ${rival.name} ma już ten mecz za sobą`
    : `mecz czeka, rywal ${rival.name}`;
  return {
    id: `msg:human:${news.seasonKey}:${round}${rivalPlayed ? ':played' : ''}`,
    subject: `Liga ludzi, kolejka ${round}: ${tail}`,
    fromLabel: 'Liga ludzi',
    href: '/league',
  };
}
