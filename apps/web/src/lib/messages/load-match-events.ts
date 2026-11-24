import { cache } from 'react';

import { warsawDateKey } from '@/lib/fixtures/matchday-gate';
import {
  humanRoundFromFixture,
  humanSeasonFromFixture,
  type HumanSeat,
} from '@/lib/league/human-league';
import {
  CHALLENGE_NEWS_MS,
  resolveMatchEvents,
  type HumanNews,
  type MatchEventMessage,
} from '@/lib/messages/match-events';
import { loadHumanAwards } from '@/lib/stats/store';
import { tryAdminClient } from '@/lib/supabase/admin';

// Not a 'use server' module on purpose: it takes a club id. Callers authorise the owner first.

type Admin = NonNullable<ReturnType<typeof tryAdminClient>>;

async function loadChallenges(admin: Admin, clubId: string, now: Date) {
  const { data } = await admin
    .from('rival_challenges')
    .select('id, challenger_name, rival_name, home_score, away_score, played_at')
    .eq('rival_club_id', clubId)
    .eq('status', 'played')
    .gte('played_at', new Date(now.getTime() - CHALLENGE_NEWS_MS).toISOString())
    .order('played_at', { ascending: false })
    .limit(3);
  return (data ?? []).flatMap((row) =>
    row.home_score == null || row.away_score == null || !row.played_at
      ? []
      : [
          {
            id: row.id,
            challengerName: row.challenger_name,
            rivalName: row.rival_name,
            homeScore: row.home_score,
            awayScore: row.away_score,
            playedAt: row.played_at,
          },
        ],
  );
}

/** Reads only: the league page opens rounds and seasons. Null = no seat or a failed read. */
async function loadHumanNews(admin: Admin, clubId: string, now: Date): Promise<HumanNews | null> {
  const mine = await admin
    .from('human_league_seats')
    .select('league_id')
    .eq('kind', 'human')
    .eq('ref_id', clubId)
    .maybeSingle();
  if (!mine.data) return null;
  const [league, seats, fixtures] = await Promise.all([
    admin
      .from('human_league')
      .select('season_key, season_number')
      .eq('id', mine.data.league_id)
      .maybeSingle(),
    admin
      .from('human_league_seats')
      .select('slot, kind, ref_id, display_name, short_name')
      .eq('league_id', mine.data.league_id)
      .order('slot', { ascending: true }),
    admin
      .from('fixtures')
      .select('matchday, played_at')
      .eq('club_id', clubId)
      .eq('competition', 'human')
      .eq('status', 'played'),
  ]);
  if (!league.data || seats.data?.length !== 12 || !fixtures.data) return null;
  const season = league.data.season_number;
  const table: HumanSeat[] = seats.data.map((row) => ({
    slot: row.slot,
    kind: row.kind === 'human' ? 'human' : 'bot',
    id: row.ref_id,
    name: row.display_name,
    shortName: row.short_name,
  }));
  if (!table.some((seat) => seat.id === clubId)) return null;

  const decided = await admin
    .from('human_broadcasts')
    .select('matchday')
    .eq('season', season)
    .or(`home_id.eq.${clubId},away_id.eq.${clubId}`)
    .not('home_score', 'is', null);
  const today = warsawDateKey(now);
  return {
    seasonKey: league.data.season_key,
    seats: table,
    playedRounds: fixtures.data
      .filter((row) => humanSeasonFromFixture(row.matchday) === season)
      .map((row) => humanRoundFromFixture(row.matchday))
      .filter((round): round is number => round != null),
    playedToday: fixtures.data.some(
      (row) => row.played_at && warsawDateKey(new Date(row.played_at)) === today,
    ),
    decidedRounds: new Set((decided.data ?? []).map((row) => row.matchday)),
  };
}

/** Once per request: the layout and the messages page ask for the same list. */
export const loadMatchEvents = cache(
  async (clubId: string): Promise<readonly MatchEventMessage[]> => {
    const admin = tryAdminClient();
    if (!admin) return [];
    const now = new Date();
    try {
      const [challenges, human, awards] = await Promise.all([
        loadChallenges(admin, clubId, now),
        loadHumanNews(admin, clubId, now),
        loadHumanAwards(clubId),
      ]);
      const latest = awards[0];
      return resolveMatchEvents({
        clubId,
        now,
        challenges,
        human,
        award: latest
          ? {
              league: latest.league,
              season: latest.season,
              place: latest.award.place,
              amount: latest.award.amount,
              closedAt: latest.closedAt,
            }
          : null,
      });
    } catch {
      // Messages never take a page down.
      console.error('loadMatchEvents failed');
      return [];
    }
  },
);
