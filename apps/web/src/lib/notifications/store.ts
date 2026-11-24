/** Server only. Reads what the planner needs and wires the real claim and senders. */

import { createHash } from 'node:crypto';

import { env } from '@/config/env';
import { emailGate } from '@/lib/auth/email-confirm-policy';
import { isProvenEmail } from '@/lib/auth/email-proof';
import { latestPlayedAt, type KickoffCompetition } from '@/lib/fixtures/kickoff-gate';
import { warsawDateKey } from '@/lib/fixtures/matchday-gate';
import {
  humanFixtureMatchday,
  humanRoundFromFixture,
  humanSeasonFromFixture,
} from '@/lib/league/human-league';
import { emailLetter, pushPayload } from '@/lib/notifications/content';
import { createEmailSender, emailProvider } from '@/lib/notifications/email';
import {
  isHumanWindow,
  NOTIFY_RULES,
  pushTtlSeconds,
  type PlannedNotification,
  type PlannerOffer,
  type PlannerUser,
} from '@/lib/notifications/planner';
import { listPushDevices, sendPushToDevices, type PushDevice } from '@/lib/notifications/push';
import type { ClaimResult, NotifyDeps, NotifyPage, SendResult } from '@/lib/notifications/run';
import { loadVapidKeys } from '@/lib/notifications/server-secrets';
import { ensureUnsubscribeToken } from '@/lib/notifications/unsubscribe';
import { PUSH_ENABLED } from '@/lib/notifications/types';
import { tryAdminClient } from '@/lib/supabase/admin';

type Admin = NonNullable<ReturnType<typeof tryAdminClient>>;

const PAGE_SIZE = 50;
const ROWS = 1000;
const MAX_ROW_PAGES = 8;
/** The cleanup job keeps 30 days: everything the unique key knows, the planner knows too. */
const LOG_DAYS = 32;

export const APP_ORIGIN = 'https://www.lastfootball.pl';

export function appOrigin(): string {
  return (env.appUrl ?? APP_ORIGIN).replace(/\/+$/, '');
}

type RowsQuery<T> = (
  from: number,
  to: number,
) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>;

/** PostgREST answers with at most 1000 rows, so longer lists come in parts. Throws on an error. */
async function allRows<T>(query: RowsQuery<T>): Promise<T[]> {
  const rows: T[] = [];
  for (let page = 0; page < MAX_ROW_PAGES; page += 1) {
    const { data, error } = await query(page * ROWS, (page + 1) * ROWS - 1);
    if (error || !data) throw new Error('notify read failed');
    rows.push(...data);
    if (data.length < ROWS) break;
  }
  return rows;
}

function latest(values: readonly (string | null | undefined)[]): string | null {
  let best: string | null = null;
  for (const value of values) {
    if (!value || Number.isNaN(Date.parse(value))) continue;
    if (best === null || Date.parse(value) > Date.parse(best)) best = value;
  }
  return best;
}

function groupBy<T>(rows: readonly T[], key: (row: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const list = groups.get(key(row)) ?? [];
    list.push(row);
    groups.set(key(row), list);
  }
  return groups;
}

type HumanFacts = {
  readonly playedByClub: ReadonlyMap<
    string,
    { seasonKey: string; rounds: number[]; playedAt: string[] }
  >;
};

/** Null outside the 17:15 window, so the other runs of the day skip these reads. */
export async function loadHumanFacts(
  admin: Admin,
  clubIds: readonly string[],
  now: Date,
): Promise<HumanFacts | null> {
  if (!isHumanWindow(now)) return null;
  const leagues = await admin.from('human_league').select('id, season_key, season_number, frozen');
  if (leagues.error || !leagues.data) return null;
  // Past its first day and nobody has opened it: it may still start again, so no round is due.
  const leagueById = new Map(
    leagues.data
      .filter((row) => row.frozen || row.season_key >= warsawDateKey(now))
      .map((row) => [row.id, row]),
  );
  const seats = await admin
    .from('human_league_seats')
    .select('ref_id, league_id')
    .eq('kind', 'human')
    .in('ref_id', [...clubIds]);
  if (seats.error || !seats.data || seats.data.length === 0) return null;
  const leagueOf = new Map(
    seats.data.flatMap((row) => {
      const league = leagueById.get(row.league_id);
      return league ? [[row.ref_id, league] as const] : [];
    }),
  );
  const seated = [...leagueOf.keys()];
  if (seated.length === 0) return null;
  const oldest = Math.min(...[...leagueOf.values()].map((league) => league.season_number));
  const played = await allRows<{ club_id: string; matchday: number; played_at: string | null }>(
    (from, to) =>
      admin
        .from('fixtures')
        .select('club_id, matchday, played_at')
        .in('club_id', seated)
        .eq('competition', 'human')
        .eq('status', 'played')
        .gte('matchday', humanFixtureMatchday(1, oldest))
        .order('id')
        .range(from, to),
  ).catch(() => null);
  if (!played) return null;
  const playedByClub = new Map(
    seated.map((id) => [
      id,
      {
        seasonKey: leagueOf.get(id)!.season_key,
        rounds: [] as number[],
        playedAt: [] as string[],
      },
    ]),
  );
  for (const row of played) {
    const club = playedByClub.get(row.club_id);
    const round = humanRoundFromFixture(row.matchday);
    if (!club || round == null) continue;
    if (humanSeasonFromFixture(row.matchday) !== leagueOf.get(row.club_id)?.season_number) continue;
    club.rounds.push(round);
    if (row.played_at) club.playedAt.push(row.played_at);
  }
  return { playedByClub };
}

type PageContext = {
  readonly devices: Map<string, PushDevice[]>;
  readonly clubNames: Map<string, string>;
  readonly emailHashes: Map<string, string>;
};

type PrefsRow = {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  kind_matchday: boolean;
  kind_human_round: boolean;
  kind_offer: boolean;
  kind_challenge: boolean;
  chosen_at: string;
};

/** Longest waiting first, and nobody twice in one run. */
async function nextPrefs(admin: Admin, now: Date): Promise<PrefsRow[] | null> {
  const { data, error } = await admin
    .from('notification_prefs')
    .select(
      'user_id, push_enabled, email_enabled, kind_matchday, kind_human_round, kind_offer, kind_challenge, chosen_at',
    )
    .or('push_enabled.eq.true,email_enabled.eq.true')
    .or(`last_processed_at.is.null,last_processed_at.lt.${now.toISOString()}`)
    .order('last_processed_at', { ascending: true, nullsFirst: true })
    .order('user_id', { ascending: true })
    .limit(PAGE_SIZE);
  return error ? null : data;
}

/** The market as it is, read by club: player ids on offers are typed by players and not trusted. */
async function loadMarket(
  admin: Admin,
  clubIds: readonly string[],
): Promise<Map<string, NonNullable<PlannerOffer['player']>>> {
  const market = new Map<string, NonNullable<PlannerOffer['player']>>();
  for (let start = 0; start < clubIds.length; start += PAGE_SIZE) {
    const rows = await allRows<{
      id: string;
      club_id: string;
      transfer_listed_at: string | null;
      departed_at: string | null;
      skill: number;
      age: number;
    }>((from, to) =>
      admin
        .from('players')
        .select('id, club_id, transfer_listed_at, departed_at, skill, age')
        .in('club_id', clubIds.slice(start, start + PAGE_SIZE))
        .not('transfer_listed_at', 'is', null)
        .is('departed_at', null)
        .order('id')
        .range(from, to),
    );
    for (const row of rows) {
      market.set(row.id, {
        clubId: row.club_id,
        listed: row.transfer_listed_at !== null,
        departed: row.departed_at !== null,
        skill: row.skill,
        age: row.age,
      });
    }
  }
  return market;
}

async function loadUsers(
  admin: Admin,
  context: PageContext,
  channels: { readonly push: boolean; readonly email: boolean },
  prefs: readonly PrefsRow[],
  now: Date,
): Promise<PlannerUser[]> {
  const userIds = prefs.map((row) => row.user_id);

  const clubs = await allRows<{
    id: string;
    owner_id: string;
    name: string;
    first_match_completed_at: string | null;
    last_training_on: string | null;
    season_phase: string;
  }>((from, to) =>
    admin
      .from('clubs')
      .select('id, owner_id, name, first_match_completed_at, last_training_on, season_phase')
      .in('owner_id', userIds)
      .order('id')
      .range(from, to),
  );
  if (clubs.length === 0) return [];
  // A blocked player cannot sign in, so a letter that asks to play makes no sense.
  const blocked = new Set(
    (
      await allRows<{ user_id: string }>((from, to) =>
        admin
          .from('blocked_accounts' as never)
          .select('user_id')
          .in('user_id', userIds)
          .order('user_id')
          .range(from, to),
      )
    ).map((row) => row.user_id),
  );
  const clubIds = clubs.map((club) => club.id);
  const since = (ms: number) => new Date(now.getTime() - ms).toISOString();

  type PlayedRow = { club_id: string; competition: string; played_at: string | null };
  const [
    upcoming,
    kept,
    archived,
    sellerOffers,
    buyerOffers,
    challenges,
    log,
    mails,
    human,
    devices,
  ] = await Promise.all([
    allRows<{ club_id: string }>((from, to) =>
      admin
        .from('fixtures')
        .select('club_id')
        .in('club_id', clubIds)
        .eq('competition', 'league')
        .eq('status', 'upcoming')
        .order('id')
        .range(from, to),
    ),
    // Any competition: the activity rule looks at every match, the league day only at its own.
    allRows<PlayedRow>((from, to) =>
      admin
        .from('fixtures')
        .select('club_id, competition, played_at')
        .in('club_id', clubIds)
        .eq('status', 'played')
        .gte('played_at', since(NOTIFY_RULES.activeMs))
        .order('played_at', { ascending: false })
        .range(from, to),
    ),
    // A season start deletes the played fixtures, the archive keeps the day.
    allRows<PlayedRow>((from, to) =>
      admin
        .from('club_matches' as never)
        .select('club_id, competition, played_at')
        .in('club_id', clubIds)
        .gte('played_at', since(NOTIFY_RULES.activeMs))
        .order('played_at', { ascending: false })
        .range(from, to),
    ),
    allRows<OfferRow>((from, to) =>
      admin
        .from('transfer_offers')
        .select(
          'id, player_id, seller_club_id, buyer_club_id, current_amount, status, phase, created_at',
        )
        .in('seller_club_id', clubIds)
        .eq('status', 'pending')
        .eq('phase', 'opening')
        .gte('created_at', since(NOTIFY_RULES.offerFreshMs))
        .lte('created_at', now.toISOString())
        .order('id')
        .range(from, to),
    ),
    allRows<OfferRow>((from, to) =>
      admin
        .from('transfer_offers')
        .select(
          'id, player_id, seller_club_id, buyer_club_id, current_amount, status, phase, created_at',
        )
        .in('buyer_club_id', clubIds)
        .eq('status', 'pending')
        .eq('phase', 'countered')
        .gte('created_at', since(NOTIFY_RULES.counterFreshMs))
        .lte('created_at', now.toISOString())
        .order('id')
        .range(from, to),
    ),
    allRows<{ id: string; rival_club_id: string; status: string; played_at: string | null }>(
      (from, to) =>
        admin
          .from('rival_challenges')
          .select('id, rival_club_id, status, played_at')
          .in('rival_club_id', clubIds)
          .eq('status', 'played')
          .gte('played_at', since(NOTIFY_RULES.challengeFreshMs))
          .order('id')
          .range(from, to),
    ),
    allRows<{ user_id: string; kind: string; ref: string; channel: string; sent_at: string }>(
      (from, to) =>
        admin
          .from('notification_log')
          .select('user_id, kind, ref, channel, sent_at')
          .in('user_id', userIds)
          .neq('kind', 'test')
          .gte('sent_at', since(LOG_DAYS * 24 * 60 * 60 * 1000))
          .order('sent_at', { ascending: false })
          .range(from, to),
    ),
    allRows<{
      user_id: string;
      confirmed_at: string | null;
      deadline_at: string;
      confirmed_email_hash: string | null;
    }>((from, to) =>
      admin
        .from('manager_email_status')
        .select('user_id, confirmed_at, deadline_at, confirmed_email_hash')
        .in('user_id', userIds)
        .order('user_id')
        .range(from, to),
    ),
    loadHumanFacts(admin, clubIds, now),
    channels.push
      ? listPushDevices(
          admin,
          prefs.filter((row) => row.push_enabled).map((row) => row.user_id),
        )
      : Promise.resolve(new Map<string, PushDevice[]>()),
  ]);

  const market = await loadMarket(admin, [
    ...new Set([...sellerOffers, ...buyerOffers].map((row) => row.seller_club_id)),
  ]);

  const clubByOwner = new Map(clubs.map((club) => [club.owner_id, club]));
  const upcomingClubs = new Set(upcoming.map((row) => row.club_id));
  const playedByClub = groupBy([...kept, ...archived], (row) => row.club_id);
  const selling = groupBy(sellerOffers, (row) => row.seller_club_id);
  const buying = groupBy(buyerOffers, (row) => row.buyer_club_id);
  const challengesByClub = groupBy(challenges, (row) => row.rival_club_id);
  const logByUser = groupBy(log, (row) => row.user_id);
  const mailByUser = new Map(mails.map((row) => [row.user_id, row]));
  const today = warsawDateKey(now);

  const users: PlannerUser[] = [];
  for (const row of prefs) {
    const club = clubByOwner.get(row.user_id);
    if (!club || blocked.has(row.user_id)) continue;
    context.clubNames.set(row.user_id, club.name);
    const userDevices = devices.get(row.user_id) ?? [];
    if (userDevices.length > 0) context.devices.set(row.user_id, userDevices);
    const mail = mailByUser.get(row.user_id) ?? null;
    if (mail?.confirmed_at && mail.confirmed_email_hash) {
      context.emailHashes.set(row.user_id, mail.confirmed_email_hash);
    }
    const gate = emailGate(
      mail
        ? {
            confirmedAt: mail.confirmed_at,
            deadlineAt: mail.deadline_at,
            lastSentAt: null,
            sendsToday: 0,
            sendsDay: null,
          }
        : null,
      now.getTime(),
    );
    const matches = playedByClub.get(club.id) ?? [];
    const lastPlayedAt = latestPlayedAt(
      matches.map((item) => ({
        status: 'played',
        competition: item.competition as KickoffCompetition,
        playedAt: item.played_at,
      })),
    );
    const humanClub = human?.playedByClub.get(club.id) ?? null;
    users.push({
      userId: row.user_id,
      prefs: {
        push: row.push_enabled,
        email: row.email_enabled,
        kinds: {
          matchday: row.kind_matchday,
          human_round: row.kind_human_round,
          offer: row.kind_offer,
          challenge: row.kind_challenge,
        },
      },
      canPush: channels.push && userDevices.length > 0,
      // Letters go only to a proven address. The current one is compared again before sending.
      canEmail: channels.email && context.emailHashes.has(row.user_id),
      firstMatchDone: Boolean(club.first_match_completed_at),
      inSeason: club.season_phase !== 'offseason',
      hasUpcomingLeague: upcomingClubs.has(club.id),
      matchesBlocked: gate.matchesBlocked,
      lastPlayedAt,
      lastActiveAt: latest([
        ...matches.map((item) => item.played_at),
        club.last_training_on,
        club.first_match_completed_at,
        row.chosen_at,
      ]),
      human:
        human && humanClub
          ? {
              seasonKey: humanClub.seasonKey,
              playedRounds: humanClub.rounds,
              playedToday: humanClub.playedAt.some((at) => warsawDateKey(new Date(at)) === today),
            }
          : null,
      offers: [
        ...(selling.get(club.id) ?? []).map((offer) => plannerOffer(offer, 'seller', market)),
        ...(buying.get(club.id) ?? []).map((offer) => plannerOffer(offer, 'buyer', market)),
      ],
      challenges: (challengesByClub.get(club.id) ?? []).map((item) => ({
        id: item.id,
        status: item.status,
        playedAt: item.played_at,
      })),
      log: (logByUser.get(row.user_id) ?? []).map((item) => ({
        kind: item.kind,
        ref: item.ref,
        channel: item.channel,
        sentAt: item.sent_at,
      })),
    });
  }
  return users;
}

type OfferRow = {
  id: string;
  player_id: string;
  current_amount: number;
  seller_club_id: string;
  buyer_club_id: string;
  status: string;
  phase: string;
  created_at: string;
};

function plannerOffer(
  row: OfferRow,
  side: 'seller' | 'buyer',
  market: ReadonlyMap<string, NonNullable<PlannerOffer['player']>>,
): PlannerOffer {
  return {
    id: row.id,
    side,
    status: row.status,
    phase: row.phase,
    createdAt: row.created_at,
    playerId: row.player_id,
    sellerClubId: row.seller_club_id,
    buyerClubId: row.buyer_club_id,
    amount: row.current_amount,
    player: market.get(row.player_id) ?? null,
  };
}

async function claim(admin: Admin, item: PlannedNotification): Promise<ClaimResult> {
  const { error } = await admin.from('notification_log').insert({
    user_id: item.userId,
    kind: item.kind,
    ref: item.ref,
    channel: item.channel,
  });
  if (!error) return 'claimed';
  return error.code === '23505' ? 'taken' : 'error';
}

async function release(admin: Admin, item: PlannedNotification): Promise<void> {
  await admin
    .from('notification_log')
    .delete()
    .eq('user_id', item.userId)
    .eq('kind', item.kind)
    .eq('ref', item.ref)
    .eq('channel', item.channel);
}

async function sendLetter(
  admin: Admin,
  context: PageContext,
  sendEmail: ReturnType<typeof createEmailSender>,
  item: PlannedNotification,
): Promise<SendResult> {
  const [account, token] = await Promise.all([
    admin.auth.admin.getUserById(item.userId),
    ensureUnsubscribeToken(admin, item.userId),
  ]);
  if (account.error || !token) return 'retry';
  const to = account.data.user.email;
  // The address may have changed since it was proven.
  if (!to || !isProvenEmail(context.emailHashes.get(item.userId), to)) return 'lost';
  const origin = appOrigin();
  const unsubscribeUrl = `${origin}/api/notify/unsubscribe?t=${token}`;
  const outcome = await sendEmail({
    to,
    unsubscribeUrl,
    letter: emailLetter({
      kind: item.kind,
      ref: item.ref,
      clubName: context.clubNames.get(item.userId) ?? '',
      origin,
      unsubscribeUrl,
    }),
    idempotencyKey: createHash('sha256')
      .update(`${item.userId}|${item.kind}|${item.ref}`)
      .digest('hex'),
  });
  return outcome === 'rejected' ? 'lost' : outcome;
}

/** Null when the tables, the service key or both channels are missing: nothing to send. */
export async function createNotifyDeps(admin: Admin | null): Promise<NotifyDeps | null> {
  if (!admin) return null;
  const vapid = await loadVapidKeys(admin);
  const provider = emailProvider();
  const channels = { push: PUSH_ENABLED && vapid !== null, email: provider !== null };
  if (!channels.push && !channels.email) return null;
  const context: PageContext = {
    devices: new Map(),
    clubNames: new Map(),
    emailHashes: new Map(),
  };
  const sendEmail = provider ? createEmailSender(provider) : null;

  return {
    clock: () => Date.now(),
    loadPage: async (now) => {
      const prefs = await nextPrefs(admin, now);
      if (!prefs) return null;
      const ids = prefs.map((row) => row.user_id);
      try {
        const users = prefs.length > 0 ? await loadUsers(admin, context, channels, prefs, now) : [];
        return { ids, users, failed: false };
      } catch {
        return { ids, users: [], failed: true };
      }
    },
    markProcessed: async (ids, now) => {
      if (ids.length === 0) return true;
      const { error } = await admin
        .from('notification_prefs')
        .update({ last_processed_at: now.toISOString() })
        .in('user_id', [...ids]);
      return !error;
    },
    claim: (item) => claim(admin, item),
    release: (item) => release(admin, item),
    send: async (item) => {
      if (item.channel === 'email') {
        return sendEmail ? sendLetter(admin, context, sendEmail, item) : 'stop';
      }
      const devices = context.devices.get(item.userId);
      if (!PUSH_ENABLED || !vapid || !devices) return 'lost';
      const ttl = pushTtlSeconds(item.kind, item.ref, new Date());
      // The run dragged past the end of this matter: say nothing.
      if (ttl <= 0) return 'retry';
      return sendPushToDevices(admin, devices, pushPayload(item.kind, item.ref), vapid, ttl);
    },
  };
}
