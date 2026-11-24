import { describe, expect, it } from 'vitest';

import { isQuietHour, planNotifications, type PlannerUser } from '@/lib/notifications/planner';

const ALL = { matchday: true, human_round: true, offer: true, challenge: true };
const NONE = { matchday: false, human_round: false, offer: false, challenge: false };

// Tuesday, winter time: Warsaw = UTC + 1.
const at = (hhmm: string, day = '2026-11-24') => new Date(`${day}T${hhmm}:00+01:00`);

function user(patch: Partial<PlannerUser> = {}): PlannerUser {
  return {
    userId: 'u1',
    prefs: { push: true, email: false, kinds: ALL },
    canPush: true,
    canEmail: true,
    firstMatchDone: true,
    inSeason: true,
    hasUpcomingLeague: false,
    matchesBlocked: false,
    lastPlayedAt: null,
    lastActiveAt: at('10:00', '2026-11-23').toISOString(),
    human: null,
    offers: [],
    challenges: [],
    log: [],
    ...patch,
  };
}

const kinds = (patch: Partial<PlannerUser>, now: Date) =>
  planNotifications(user(patch), now).map((item) => item.kind);

const offer = (id: string, createdAt: string) => ({
  id,
  side: 'seller' as const,
  status: 'pending',
  phase: 'opening',
  createdAt,
});

const sent = (kind: string, ref: string, when: Date, channel = 'push') => ({
  kind,
  ref,
  channel,
  sentAt: when.toISOString(),
});

describe('matchday', () => {
  const open = { hasUpcomingLeague: true };

  it('comes once, only between 17:00 and 19:59 Warsaw', () => {
    expect(kinds(open, at('16:59'))).toEqual([]);
    expect(kinds(open, at('17:00'))).toEqual(['matchday']);
    expect(kinds(open, at('19:59'))).toEqual(['matchday']);
    expect(kinds(open, at('20:00'))).toEqual([]);
    const log = [sent('matchday', '2026-11-24', at('17:00'))];
    expect(kinds({ ...open, log }, at('17:30'))).toEqual([]);
    expect(kinds({ ...open, log }, at('17:00', '2026-11-25'))).toEqual(['matchday']);
  });

  it('is silent when today is played, in the off-season, or while kickoffs are closed', () => {
    expect(kinds({ ...open, lastPlayedAt: at('09:00').toISOString() }, at('18:00'))).toEqual([]);
    expect(kinds({ ...open, inSeason: false }, at('18:00'))).toEqual([]);
    expect(kinds({ ...open, matchesBlocked: true }, at('18:00'))).toEqual([]);
    expect(kinds({ ...open, firstMatchDone: false }, at('18:00'))).toEqual([]);
    expect(kinds({ hasUpcomingLeague: false }, at('18:00'))).toEqual([]);
  });

  it('counts a match before Warsaw midnight as yesterday', () => {
    const lastPlayedAt = at('23:59', '2026-11-23').toISOString();
    expect(kinds({ ...open, lastPlayedAt }, at('18:00'))).toEqual(['matchday']);
  });

  it('stops after 14 quiet days', () => {
    const active = at('18:00', '2026-11-10').toISOString();
    const gone = at('17:00', '2026-11-10').toISOString();
    expect(kinds({ ...open, lastActiveAt: active }, at('18:00'))).toEqual(['matchday']);
    expect(kinds({ ...open, lastActiveAt: gone }, at('18:00'))).toEqual([]);
    expect(kinds({ ...open, lastActiveAt: null }, at('18:00'))).toEqual([]);
  });

  it('follows the Warsaw clock on both days of the clock change', () => {
    const active = { ...open, lastActiveAt: '2026-10-24T12:00:00Z' };
    // 2026-10-25: summer time ends, 17:00 is 16:00 UTC.
    expect(kinds(active, new Date('2026-10-25T15:30:00Z'))).toEqual([]);
    expect(kinds(active, new Date('2026-10-25T16:00:00Z'))).toEqual(['matchday']);
    // 2027-03-28: summer time starts, 17:00 is 15:00 UTC.
    const spring = { ...open, lastActiveAt: '2027-03-27T12:00:00Z' };
    expect(kinds(spring, new Date('2027-03-28T14:30:00Z'))).toEqual([]);
    expect(kinds(spring, new Date('2027-03-28T15:00:00Z'))).toEqual(['matchday']);
  });
});

describe('human round', () => {
  // Season from Nov 22: round 3 is on Nov 24.
  const human = { seasonKey: '2026-11-22', playedRounds: [1, 2], playedToday: false };

  it('comes about 17:30 for a club with a round today', () => {
    expect(kinds({ human }, at('17:00'))).toEqual([]);
    expect(kinds({ human }, at('17:30'))).toEqual(['human_round']);
    expect(kinds({ human }, at('18:00'))).toEqual([]);
  });

  it('is silent for a club that is behind, done, or not in the league', () => {
    expect(kinds({ human: { ...human, playedRounds: [1] } }, at('17:30'))).toEqual([]);
    expect(
      kinds({ human: { ...human, playedRounds: [1, 2, 3], playedToday: true } }, at('17:30')),
    ).toEqual([]);
    expect(kinds({ human, matchesBlocked: true }, at('17:30'))).toEqual([]);
    expect(kinds({ human: null }, at('17:30'))).toEqual([]);
  });
});

describe('offer', () => {
  const fresh = at('23:30', '2026-11-23').toISOString();

  it('waits for 08:00 and is sent once', () => {
    const offers = [offer('o1', fresh)];
    expect(kinds({ offers }, at('07:59'))).toEqual([]);
    expect(kinds({ offers }, at('08:00'))).toEqual(['offer']);
    const log = [sent('offer', 'o1:opening', at('08:00'))];
    expect(kinds({ offers, log }, at('08:30'))).toEqual([]);
  });

  it('asks only the side that has to decide', () => {
    const countered = { ...offer('o1', fresh), phase: 'countered' };
    expect(kinds({ offers: [countered] }, at('10:00'))).toEqual([]);
    expect(kinds({ offers: [{ ...countered, side: 'buyer' }] }, at('10:00'))).toEqual(['offer']);
    expect(kinds({ offers: [{ ...offer('o1', fresh), side: 'buyer' }] }, at('10:00'))).toEqual([]);
  });

  it('ignores answered and old offers', () => {
    expect(kinds({ offers: [{ ...offer('o1', fresh), status: 'accepted' }] }, at('10:00'))).toEqual(
      [],
    );
    expect(
      kinds({ offers: [offer('o1', at('09:00', '2026-11-20').toISOString())] }, at('10:00')),
    ).toEqual([]);
  });

  it('sends one of several per run and the next one later', () => {
    const offers = [offer('o1', fresh), offer('o2', fresh)];
    expect(planNotifications(user({ offers }), at('10:00'))).toHaveLength(1);
    const log = [sent('offer', 'o1:opening', at('10:00'))];
    expect(planNotifications(user({ offers, log }), at('10:30'))[0]?.ref).toBe('o2:opening');
  });
});

describe('challenge', () => {
  it('tells about a finished one for a day', () => {
    const row = { id: 'c1', status: 'played', playedAt: at('09:00').toISOString() };
    expect(kinds({ challenges: [row] }, at('10:00'))).toEqual(['challenge']);
    expect(
      kinds({ challenges: [{ ...row, status: 'open', playedAt: null }] }, at('10:00')),
    ).toEqual([]);
    expect(kinds({ challenges: [row] }, at('10:00', '2026-11-25'))).toEqual([]);
  });
});

describe('limits and consent', () => {
  const busy = {
    offers: [offer('o1', at('09:00').toISOString())],
    challenges: [{ id: 'c1', status: 'played', playedAt: at('09:00').toISOString() }],
    hasUpcomingLeague: true,
    human: { seasonKey: '2026-11-22', playedRounds: [1, 2], playedToday: false },
  };

  it('keeps quiet from 22:00 to 08:00, also on the clock change days', () => {
    expect(isQuietHour(at('21:59'))).toBe(false);
    expect(isQuietHour(at('22:00'))).toBe(true);
    expect(isQuietHour(new Date('2026-10-25T06:59:00Z'))).toBe(true);
    expect(isQuietHour(new Date('2026-10-25T07:00:00Z'))).toBe(false);
    expect(isQuietHour(new Date('2027-03-28T06:00:00Z'))).toBe(false);
    expect(kinds(busy, at('22:00'))).toEqual([]);
  });

  it('never sends more than two a day on a channel', () => {
    expect(kinds(busy, at('17:30'))).toEqual(['human_round', 'offer']);
    const one = [sent('challenge', 'c0', at('08:00'))];
    expect(kinds({ ...busy, log: one }, at('17:30'))).toEqual(['human_round']);
    const two = [...one, sent('offer', 'o0:opening', at('09:00'))];
    expect(kinds({ ...busy, log: two }, at('17:30'))).toEqual([]);
    const yesterday = two.map((row) => ({
      ...row,
      sentAt: at('21:00', '2026-11-23').toISOString(),
    }));
    expect(kinds({ ...busy, log: yesterday }, at('17:30'))).toHaveLength(2);
  });

  it('counts each channel on its own and skips test pushes', () => {
    const prefs = { push: true, email: true, kinds: ALL };
    const log = [
      sent('offer', 'o1:opening', at('08:00')),
      sent('challenge', 'c1', at('08:30')),
      sent('test', '1', at('08:31'), 'email'),
    ];
    const planned = planNotifications(user({ ...busy, prefs, log }), at('10:00'));
    expect(planned.map((item) => `${item.channel}:${item.kind}`)).toEqual([
      'email:offer',
      'email:challenge',
    ]);
  });

  it('sends nothing without consent or without a way to deliver', () => {
    expect(
      kinds({ ...busy, prefs: { push: false, email: false, kinds: ALL } }, at('17:30')),
    ).toEqual([]);
    expect(
      kinds({ ...busy, prefs: { push: true, email: true, kinds: NONE } }, at('17:30')),
    ).toEqual([]);
    const prefs = { push: true, email: true, kinds: ALL };
    expect(kinds({ ...busy, prefs, canPush: false, canEmail: false }, at('17:30'))).toEqual([]);
  });
});
