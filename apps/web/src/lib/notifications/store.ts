/** Server only. Reads what the planner needs and wires the real claim and senders. */

import { createHash } from 'node:crypto';

import { env } from '@/config/env';
import { emailGate } from '@/lib/auth/email-confirm-policy';
import { warsawDateKey } from '@/lib/fixtures/matchday-gate';
import { humanRoundFromFixture } from '@/lib/league/human-league';
import { emailLetter, pushPayload } from '@/lib/notifications/content';
import { emailProvider, sendEmail } from '@/lib/notifications/email';
import {
  isHumanWindow,
  NOTIFY_RULES,
  type PlannedNotification,
  type PlannerUser,
} from '@/lib/notifications/planner';
import { listPushDevices, sendPushToDevices, type PushDevice } from '@/lib/notifications/push';
import type { ClaimResult, NotifyDeps, NotifyPage, SendResult } from '@/lib/notifications/run';
import { loadVapidKeys } from '@/lib/notifications/server-secrets';
import { ensureUnsubscribeToken } from '@/lib/notifications/unsubscribe';
import { tryAdminClient } from '@/lib/supabase/admin';

type Admin = NonNullable<ReturnType<typeof tryAdminClient>>;

const PAGE_SIZE = 50;
const ROWS = 1000;
const MAX_ROW_PAGES = 5;

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
  readonly seasonKey: string;
  readonly playedByClub: ReadonlyMap<string, { rounds: number[]; playedAt: string[] }>;
};

/** Null outside the 17:15 window, so the other runs of the day skip these reads. */
async function loadHumanFacts(
  admin: Admin,
  clubIds: readonly string[],
  now: Date,
): Promise<HumanFacts | null> {
  if (!isHumanWindow(now)) return null;
  const league = await admin.from('human_league').select('season_key').eq('id', 1).maybeSingle();
  if (league.error || !league.data) return null;
  const seats = await admin
    .from('human_league_seats')
    .select('ref_id')
    .eq('kind', 'human')
    .in('ref_id', [...clubIds]);
  if (seats.error || !seats.data || seats.data.length === 0) return null;
  const seated = seats.data.map((row) => row.ref_id);
  const played = await admin
    .from('fixtures')
    .select('club_id, matchday, played_at')
    .in('club_id', seated)
    .eq('competition', 'human')
    .eq('status', 'played');
  if (played.error || !played.data) return null;
  const playedByClub = new Map(
    seated.map((id) => [id, { rounds: [] as number[], playedAt: [] as string[] }]),
  );
  for (const row of played.data) {
    const club = playedByClub.get(row.club_id);
    const round = humanRoundFromFixture(row.matchday);
    if (!club || round == null) continue;
    club.rounds.push(round);
    if (row.played_at) club.playedAt.push(row.played_at);
  }
  return { seasonKey: league.data.season_key, playedByClub };
}

type PageContext = {
  readonly devices: Map<string, PushDevice[]>;
  readonly clubNames: Map<string, string>;
};

async function loadPage(
  admin: Admin,
  context: PageContext,
  channels: { readonly push: boolean; readonly email: boolean },
  after: string | null,
  now: Date,
): Promise<NotifyPage> {
  let query = admin
    .from('notification_prefs')
    .select(
      'user_id, push_enabled, email_enabled, kind_matchday, kind_human_round, kind_offer, kind_challenge, updated_at',
    )
    .or('push_enabled.eq.true,email_enabled.eq.true')
    .order('user_id', { ascending: true })
    .limit(PAGE_SIZE);
  if (after) query = query.gt('user_id', after);
  const prefsResult = await query;
  if (prefsResult.error) throw new Error('notify read failed');
  const prefs = prefsResult.data;
  const next = prefs.length === PAGE_SIZE ? prefs[prefs.length - 1]!.user_id : null;
  if (prefs.length === 0) return { users: [], next };
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
  if (clubs.length === 0) return { users: [], next };
  const clubIds = clubs.map((club) => club.id);
  const since = (ms: number) => new Date(now.getTime() - ms).toISOString();

  const [upcoming, played, sellerOffers, buyerOffers, challenges, log, mails, human, devices] =
    await Promise.all([
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
      // Any competition: the Warsaw day rule and the activity rule both look at every match.
      allRows<{ club_id: string; played_at: string | null }>((from, to) =>
        admin
          .from('fixtures')
          .select('club_id, played_at')
          .in('club_id', clubIds)
          .eq('status', 'played')
          .gte('played_at', since(NOTIFY_RULES.activeMs))
          .order('played_at', { ascending: false })
          .range(from, to),
      ),
      allRows<OfferRow>((from, to) =>
        admin
          .from('transfer_offers')
          .select('id, seller_club_id, buyer_club_id, status, phase, created_at')
          .in('seller_club_id', clubIds)
          .eq('status', 'pending')
          .eq('phase', 'opening')
          .gte('created_at', since(NOTIFY_RULES.offerFreshMs))
          .order('id')
          .range(from, to),
      ),
      allRows<OfferRow>((from, to) =>
        admin
          .from('transfer_offers')
          .select('id, seller_club_id, buyer_club_id, status, phase, created_at')
          .in('buyer_club_id', clubIds)
          .eq('status', 'pending')
          .eq('phase', 'countered')
          .gte('created_at', since(NOTIFY_RULES.counterFreshMs))
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
            .gte('sent_at', since(NOTIFY_RULES.counterFreshMs + 24 * 60 * 60 * 1000))
            .order('sent_at', { ascending: false })
            .range(from, to),
      ),
      allRows<{
        user_id: string;
        confirmed_at: string | null;
        deadline_at: string;
      }>((from, to) =>
        admin
          .from('manager_email_status')
          .select('user_id, confirmed_at, deadline_at')
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

  const clubByOwner = new Map(clubs.map((club) => [club.owner_id, club]));
  const upcomingClubs = new Set(upcoming.map((row) => row.club_id));
  const playedByClub = groupBy(played, (row) => row.club_id);
  const selling = groupBy(sellerOffers, (row) => row.seller_club_id);
  const buying = groupBy(buyerOffers, (row) => row.buyer_club_id);
  const challengesByClub = groupBy(challenges, (row) => row.rival_club_id);
  const logByUser = groupBy(log, (row) => row.user_id);
  const mailByUser = new Map(mails.map((row) => [row.user_id, row]));
  const today = warsawDateKey(now);

  const users: PlannerUser[] = [];
  for (const row of prefs) {
    const club = clubByOwner.get(row.user_id);
    if (!club) continue;
    context.clubNames.set(row.user_id, club.name);
    const userDevices = devices.get(row.user_id) ?? [];
    if (userDevices.length > 0) context.devices.set(row.user_id, userDevices);
    const mail = mailByUser.get(row.user_id) ?? null;
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
    const lastPlayedAt = latest((playedByClub.get(club.id) ?? []).map((item) => item.played_at));
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
      // A missing row is not a confirmation here: letters go only to a confirmed address.
      canEmail: channels.email && Boolean(mail?.confirmed_at),
      firstMatchDone: Boolean(club.first_match_completed_at),
      inSeason: club.season_phase !== 'offseason',
      hasUpcomingLeague: upcomingClubs.has(club.id),
      matchesBlocked: gate.matchesBlocked,
      lastPlayedAt,
      lastActiveAt: latest([
        lastPlayedAt,
        club.last_training_on,
        club.first_match_completed_at,
        row.updated_at,
      ]),
      human:
        human && humanClub
          ? {
              seasonKey: human.seasonKey,
              playedRounds: humanClub.rounds,
              playedToday: humanClub.playedAt.some((at) => warsawDateKey(new Date(at)) === today),
            }
          : null,
      offers: [
        ...(selling.get(club.id) ?? []).map((offer) => plannerOffer(offer, 'seller')),
        ...(buying.get(club.id) ?? []).map((offer) => plannerOffer(offer, 'buyer')),
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
  return { users, next };
}

type OfferRow = {
  id: string;
  seller_club_id: string;
  buyer_club_id: string;
  status: string;
  phase: string;
  created_at: string;
};

function plannerOffer(row: OfferRow, side: 'seller' | 'buyer') {
  return { id: row.id, side, status: row.status, phase: row.phase, createdAt: row.created_at };
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
  item: PlannedNotification,
): Promise<SendResult> {
  const provider = emailProvider();
  if (!provider) return 'stop';
  const [account, token] = await Promise.all([
    admin.auth.admin.getUserById(item.userId),
    ensureUnsubscribeToken(admin, item.userId),
  ]);
  if (account.error || !token) return 'retry';
  const to = account.data.user.email;
  if (!to) return 'lost';
  const origin = appOrigin();
  const unsubscribeUrl = `${origin}/api/notify/unsubscribe?t=${token}`;
  const outcome = await sendEmail(provider, {
    to,
    unsubscribeUrl,
    letter: emailLetter({
      kind: item.kind,
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
  const channels = { push: vapid !== null, email: emailProvider() !== null };
  if (!channels.push && !channels.email) return null;
  const context: PageContext = { devices: new Map(), clubNames: new Map() };

  return {
    clock: () => Date.now(),
    loadPage: async (after, now) => {
      try {
        return await loadPage(admin, context, channels, after, now);
      } catch {
        return null;
      }
    },
    claim: (item) => claim(admin, item),
    release: (item) => release(admin, item),
    send: async (item) => {
      if (item.channel === 'email') return sendLetter(admin, context, item);
      const devices = context.devices.get(item.userId);
      if (!vapid || !devices) return 'lost';
      return sendPushToDevices(admin, devices, pushPayload(item.kind), vapid);
    },
  };
}
