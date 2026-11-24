/**
 * What may be sent right now (D132). Pure: the clock and every fact come in as input.
 * An invitation, never pressure: opt-in, quiet hours, one per matter, two a day.
 */

import { kickoffBlockReason } from '@/lib/fixtures/kickoff-gate';
import { warsawDateKey } from '@/lib/fixtures/matchday-gate';
import {
  HUMAN_ROUND_COUNT,
  kickoffDate,
  KICKOFF_OPEN_HOUR,
  warsawHour,
} from '@/lib/league/human-league';
import type {
  NotificationChannel,
  NotificationKind,
  NotificationPrefs,
} from '@/lib/notifications/types';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { isAllowedAgreedAmount } from '@/lib/transfers/resolve-negotiation';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const NOTIFY_RULES = {
  quietFromHour: 22,
  quietToHour: 8,
  matchdayFromHour: 17,
  matchdayToHour: 20,
  humanHour: 17,
  humanFromMinute: 15,
  maxPerDay: 2,
  activeMs: 14 * DAY_MS,
  /** Covers the quiet hours. Older news is no longer news. */
  offerFreshMs: 2 * DAY_MS,
  /** A counter has no own timestamp, so the offer it belongs to is the bound. */
  counterFreshMs: 14 * DAY_MS,
  challengeFreshMs: DAY_MS,
  /** A club behind in the human league cannot catch up by itself, so it hears about it rarely. */
  overdueEveryMs: 7 * DAY_MS,
  maxTtlSeconds: 3 * 60 * 60,
} as const;

export type PlannerOffer = {
  readonly id: string;
  readonly side: 'seller' | 'buyer';
  readonly status: string;
  readonly phase: string;
  readonly createdAt: string;
  readonly playerId: string;
  readonly sellerClubId: string;
  readonly buyerClubId: string;
  readonly amount: number;
  /** The player as he is now. Null when he is not on the market. */
  readonly player: {
    readonly clubId: string;
    readonly listed: boolean;
    readonly departed: boolean;
    readonly skill: number;
    readonly age: number;
  } | null;
};

export type PlannerChallenge = {
  readonly id: string;
  readonly status: string;
  readonly playedAt: string | null;
};

export type PlannerLogRow = {
  readonly kind: string;
  readonly ref: string;
  readonly channel: string;
  readonly sentAt: string;
};

export type PlannerUser = {
  readonly userId: string;
  readonly prefs: NotificationPrefs;
  /** The channel can deliver: a device is registered, or the address is confirmed. */
  readonly canPush: boolean;
  readonly canEmail: boolean;
  readonly firstMatchDone: boolean;
  readonly inSeason: boolean;
  readonly hasUpcomingLeague: boolean;
  /** E-mail confirmation deadline passed, so kickoffs are closed. */
  readonly matchesBlocked: boolean;
  readonly lastPlayedAt: string | null;
  readonly lastActiveAt: string | null;
  readonly human: {
    readonly seasonKey: string;
    readonly playedRounds: readonly number[];
    readonly playedToday: boolean;
  } | null;
  readonly offers: readonly PlannerOffer[];
  /** Challenges against this club. */
  readonly challenges: readonly PlannerChallenge[];
  readonly log: readonly PlannerLogRow[];
};

export type PlannedNotification = {
  readonly userId: string;
  readonly kind: NotificationKind;
  readonly ref: string;
  readonly channel: NotificationChannel;
};

export function isQuietHour(now: Date): boolean {
  const hour = warsawHour(now);
  return hour >= NOTIFY_RULES.quietFromHour || hour < NOTIFY_RULES.quietToHour;
}

/** Window of the human round reminder, also used to skip reads outside it. */
export function isHumanWindow(now: Date): boolean {
  return (
    warsawHour(now) === NOTIFY_RULES.humanHour &&
    // Warsaw is always a whole number of hours from UTC.
    now.getUTCMinutes() >= NOTIFY_RULES.humanFromMinute
  );
}

function isMatchdayWindow(now: Date): boolean {
  const hour = warsawHour(now);
  return hour >= NOTIFY_RULES.matchdayFromHour && hour < NOTIFY_RULES.matchdayToHour;
}

function within(iso: string | null, now: Date, ms: number): boolean {
  if (!iso) return false;
  const age = now.getTime() - Date.parse(iso);
  // A time in the future is not news, it is a wrong or forged row. NaN fails both checks.
  return age >= 0 && age <= ms;
}

function matchdayRef(user: PlannerUser, now: Date): string | null {
  if (!isMatchdayWindow(now) || !user.inSeason || !user.hasUpcomingLeague) return null;
  if (!within(user.lastActiveAt, now, NOTIFY_RULES.activeMs)) return null;
  const blocked = kickoffBlockReason({
    matchesBlocked: user.matchesBlocked,
    competition: 'league',
    lastPlayedAt: user.lastPlayedAt,
    now,
  });
  return blocked ? null : warsawDateKey(now);
}

const OVERDUE_REF = 'overdue:';

export function isOverdueRef(ref: string): boolean {
  return ref.startsWith(OVERDUE_REF);
}

/**
 * The 18:00 reminder belongs to the round of today. A club with an older unplayed round plays that
 * one first, so it hears "you have an overdue round" instead, at most once in seven days.
 */
function humanRef(user: PlannerUser, now: Date, rows: readonly PlannerLogRow[]): string | null {
  const { human } = user;
  if (!human || !isHumanWindow(now) || user.matchesBlocked || human.playedToday) return null;
  const today = warsawDateKey(now);
  const played = new Set(human.playedRounds);
  let behind = false;
  for (let round = 1; round <= HUMAN_ROUND_COUNT; round += 1) {
    if (played.has(round)) continue;
    const date = kickoffDate(human.seasonKey, round);
    if (date > today) break;
    if (date === today && !behind) return today;
    behind = true;
  }
  if (!behind || !within(user.lastActiveAt, now, NOTIFY_RULES.activeMs)) return null;
  const told = rows.some(
    (row) =>
      row.kind === 'human_round' &&
      isOverdueRef(row.ref) &&
      now.getTime() - Date.parse(row.sentAt) < NOTIFY_RULES.overdueEveryMs,
  );
  return told ? null : `${OVERDUE_REF}${today}`;
}

/** The seller can still close this deal. The same checks as the settlement itself. */
function isRealOffer(offer: PlannerOffer): boolean {
  const { player } = offer;
  if (!player || !player.listed || player.departed) return false;
  if (player.clubId !== offer.sellerClubId || offer.sellerClubId === offer.buyerClubId) {
    return false;
  }
  return isAllowedAgreedAmount(deriveTransferFee(player.skill, player.age), offer.amount);
}

/** One matter = one player and one buyer, however many rows stand behind it. */
function offerRefs(user: PlannerUser, now: Date): string[] {
  const refs = user.offers
    .filter((offer) => {
      if (offer.status !== 'pending' || !isRealOffer(offer)) return false;
      if (offer.side === 'seller') {
        return offer.phase === 'opening' && within(offer.createdAt, now, NOTIFY_RULES.offerFreshMs);
      }
      return (
        offer.phase === 'countered' && within(offer.createdAt, now, NOTIFY_RULES.counterFreshMs)
      );
    })
    .map((offer) => `${offer.playerId}:${offer.buyerClubId}`);
  return [...new Set(refs)].sort();
}

function challengeRefs(user: PlannerUser, now: Date): string[] {
  return user.challenges
    .filter(
      (row) => row.status === 'played' && within(row.playedAt, now, NOTIFY_RULES.challengeFreshMs),
    )
    .map((row) => row.id)
    .sort();
}

/** Seconds until the given Warsaw hour today. The clock never changes between 08:00 and 22:00. */
function secondsToHour(now: Date, hour: number): number {
  return (hour - warsawHour(now)) * 3600 - now.getUTCMinutes() * 60 - now.getUTCSeconds();
}

/** How long a push service may hold the message: never into the quiet hours or past its matter. */
export function pushTtlSeconds(kind: NotificationKind, ref: string, now: Date): number {
  let end: number = NOTIFY_RULES.quietFromHour;
  if (kind === 'matchday') end = NOTIFY_RULES.matchdayToHour;
  if (kind === 'human_round' && !isOverdueRef(ref)) end = KICKOFF_OPEN_HOUR;
  return Math.max(0, Math.min(NOTIFY_RULES.maxTtlSeconds, secondsToHour(now, end)));
}

/** In order of urgency. At most one of a kind per run, so a busy day never floods a phone. */
export function planNotifications(user: PlannerUser, now: Date): PlannedNotification[] {
  if (isQuietHour(now) || !user.firstMatchDone) return [];

  const { kinds } = user.prefs;
  const single = (ref: string | null) => (ref ? [ref] : []);
  const offers = kinds.offer ? offerRefs(user, now) : [];
  const matchday = kinds.matchday ? single(matchdayRef(user, now)) : [];
  const challenges = kinds.challenge ? challengeRefs(user, now) : [];

  const channels: NotificationChannel[] = [];
  if (user.prefs.push && user.canPush) channels.push('push');
  if (user.prefs.email && user.canEmail) channels.push('email');

  const today = warsawDateKey(now);
  const planned: PlannedNotification[] = [];
  for (const channel of channels) {
    const rows = user.log.filter((row) => row.channel === channel && row.kind !== 'test');
    const sent = new Set(rows.map((row) => `${row.kind}|${row.ref}`));
    const candidates: readonly (readonly [NotificationKind, readonly string[]])[] = [
      ['human_round', kinds.human_round ? single(humanRef(user, now, rows)) : []],
      ['offer', offers],
      ['matchday', matchday],
      ['challenge', challenges],
    ];
    let left =
      NOTIFY_RULES.maxPerDay -
      rows.filter((row) => warsawDateKey(new Date(row.sentAt)) === today).length;
    for (const [kind, refs] of candidates) {
      if (left <= 0) break;
      const ref = refs.find((item) => !sent.has(`${kind}|${item}`));
      if (!ref) continue;
      planned.push({ userId: user.userId, kind, ref, channel });
      left -= 1;
    }
  }
  return planned;
}
