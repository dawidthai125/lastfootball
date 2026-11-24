/**
 * What may be sent right now (D132). Pure: the clock and every fact come in as input.
 * An invitation, never pressure: opt-in, quiet hours, one per matter, two a day.
 */

import { kickoffBlockReason } from '@/lib/fixtures/kickoff-gate';
import { warsawDateKey } from '@/lib/fixtures/matchday-gate';
import { kickoffDate, nextHumanRound, warsawHour } from '@/lib/league/human-league';
import type {
  NotificationChannel,
  NotificationKind,
  NotificationPrefs,
} from '@/lib/notifications/types';

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
} as const;

export type PlannerOffer = {
  readonly id: string;
  readonly side: 'seller' | 'buyer';
  readonly status: string;
  readonly phase: string;
  readonly createdAt: string;
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
  const at = Date.parse(iso);
  return Number.isFinite(at) && now.getTime() - at <= ms;
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

function humanRef(user: PlannerUser, now: Date): string | null {
  if (!user.human || !isHumanWindow(now) || user.matchesBlocked) return null;
  const round = nextHumanRound({
    seasonKey: user.human.seasonKey,
    playedRounds: user.human.playedRounds,
    now,
    playedHumanToday: user.human.playedToday,
  });
  if (!round) return null;
  // A club that is behind catches up any time: today's shared kickoff is not its match.
  const today = warsawDateKey(now);
  return kickoffDate(user.human.seasonKey, round) === today ? today : null;
}

function offerRefs(user: PlannerUser, now: Date): string[] {
  return user.offers
    .filter((offer) => {
      if (offer.status !== 'pending') return false;
      if (offer.side === 'seller') {
        return offer.phase === 'opening' && within(offer.createdAt, now, NOTIFY_RULES.offerFreshMs);
      }
      return (
        offer.phase === 'countered' && within(offer.createdAt, now, NOTIFY_RULES.counterFreshMs)
      );
    })
    .map((offer) => `${offer.id}:${offer.phase}`)
    .sort();
}

function challengeRefs(user: PlannerUser, now: Date): string[] {
  return user.challenges
    .filter(
      (row) => row.status === 'played' && within(row.playedAt, now, NOTIFY_RULES.challengeFreshMs),
    )
    .map((row) => row.id)
    .sort();
}

/** In order of urgency. At most one of a kind per run, so a busy day never floods a phone. */
export function planNotifications(user: PlannerUser, now: Date): PlannedNotification[] {
  if (isQuietHour(now) || !user.firstMatchDone) return [];

  const single = (ref: string | null) => (ref ? [ref] : []);
  const candidates: readonly (readonly [NotificationKind, readonly string[]])[] = [
    ['human_round', user.prefs.kinds.human_round ? single(humanRef(user, now)) : []],
    ['offer', user.prefs.kinds.offer ? offerRefs(user, now) : []],
    ['matchday', user.prefs.kinds.matchday ? single(matchdayRef(user, now)) : []],
    ['challenge', user.prefs.kinds.challenge ? challengeRefs(user, now) : []],
  ];

  const channels: NotificationChannel[] = [];
  if (user.prefs.push && user.canPush) channels.push('push');
  if (user.prefs.email && user.canEmail) channels.push('email');

  const today = warsawDateKey(now);
  const planned: PlannedNotification[] = [];
  for (const channel of channels) {
    const rows = user.log.filter((row) => row.channel === channel && row.kind !== 'test');
    const sent = new Set(rows.map((row) => `${row.kind}|${row.ref}`));
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
