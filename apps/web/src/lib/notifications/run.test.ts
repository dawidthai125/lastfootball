import { describe, expect, it } from 'vitest';

import type { PlannerUser } from '@/lib/notifications/planner';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import {
  RUN_LIMITS,
  runNotifications,
  type NotifyDeps,
  type SendResult,
} from '@/lib/notifications/run';

const NOW = new Date('2026-11-24T10:00:00Z');

function manager(id: string): PlannerUser {
  return {
    userId: id,
    prefs: {
      push: true,
      email: true,
      kinds: { matchday: false, human_round: false, offer: true, challenge: false },
    },
    canPush: true,
    canEmail: true,
    firstMatchDone: true,
    inSeason: true,
    hasUpcomingLeague: false,
    matchesBlocked: false,
    lastPlayedAt: null,
    lastActiveAt: null,
    human: null,
    offers: [
      {
        id: `o-${id}`,
        side: 'seller',
        status: 'pending',
        phase: 'opening',
        createdAt: '2026-11-24T08:00:00Z',
        playerId: `p-${id}`,
        sellerClubId: id,
        buyerClubId: 'buyer',
        amount: deriveTransferFee(60, 24),
        player: { clubId: id, listed: true, departed: false, skill: 60, age: 24 },
      },
    ],
    challenges: [],
    log: [],
  };
}

function harness(
  send: (channel: string, user: string) => SendResult | Promise<SendResult>,
  ids = ['a', 'b'],
  pageSize = 50,
) {
  const tried: string[] = [];
  const log = new Set<string>();
  /** The cursor, as the database keeps it between runs. */
  const processed = new Map<string, number>(ids.map((id) => [id, 0]));
  const key = (item: { userId: string; kind: string; ref: string; channel: string }) =>
    `${item.userId}|${item.kind}|${item.ref}|${item.channel}`;
  const deps: NotifyDeps = {
    clock: () => 0,
    loadPage: async (now) => {
      const page = [...processed]
        .filter(([, at]) => at < now.getTime())
        .sort((x, y) => x[1] - y[1] || x[0].localeCompare(y[0]))
        .slice(0, pageSize)
        .map(([id]) => id);
      return { ids: page, users: page.map(manager), failed: false };
    },
    markProcessed: async (done, now) => {
      done.forEach((id) => processed.set(id, now.getTime()));
      return true;
    },
    claim: async (item) => {
      if (log.has(key(item))) return 'taken';
      log.add(key(item));
      return 'claimed';
    },
    release: async (item) => {
      log.delete(key(item));
    },
    send: async (item) => {
      tried.push(`${item.channel}:${item.userId}`);
      return send(item.channel, item.userId);
    },
  };
  return { deps, tried, log, processed };
}

const LATER = new Date(NOW.getTime() + 30 * 60 * 1000);

describe('scheduler run', () => {
  it('claims before sending, so a second run sends nothing', async () => {
    const { deps, tried } = harness(() => 'sent');
    const first = await runNotifications(deps, NOW);
    expect(first).toEqual({ users: 2, planned: 4, sent: 4, failed: 0, complete: true });
    expect((await runNotifications(deps, LATER)).sent).toBe(0);
    expect(tried).toHaveLength(4);
  });

  it('frees the claim for a retry, keeps it when the delivery is uncertain', async () => {
    const retry = harness(() => 'retry');
    await runNotifications(retry.deps, NOW);
    expect(retry.log.size).toBe(0);
    const lost = harness(() => 'lost');
    await runNotifications(lost.deps, NOW);
    expect(lost.log.size).toBe(4);
  });

  it('closes only the failing channel', async () => {
    const { deps, tried } = harness((channel) => (channel === 'email' ? 'stop' : 'sent'));
    await runNotifications(deps, NOW);
    expect([...tried].sort()).toEqual(['email:a', 'push:a', 'push:b']);
  });

  it('one timed-out letter does not stop the next one, three in a row do', async () => {
    const once = harness((channel, id) => (channel === 'email' && id === 'a' ? 'retry' : 'sent'));
    expect((await runNotifications(once.deps, NOW)).sent).toBe(3);
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const down = harness((channel) => (channel === 'email' ? 'retry' : 'sent'), ids);
    await runNotifications(down.deps, NOW);
    expect(down.tried.filter((item) => item.startsWith('email'))).toHaveLength(3);
    expect(down.tried.filter((item) => item.startsWith('push'))).toHaveLength(5);
  });

  it('reaches every manager page by page', async () => {
    const ids = Array.from({ length: 23 }, (_, i) => `u${String(i).padStart(2, '0')}`);
    const { deps, tried } = harness(() => 'sent', ids, 5);
    const counts = await runNotifications(deps, NOW);
    expect(counts).toMatchObject({ users: 23, sent: 46, complete: true });
    expect(new Set(tried).size).toBe(46);
  });

  it('starts the next run with those the time did not reach', async () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
    const { deps, tried, processed } = harness(() => 'sent', ids, 2);
    let time = 0;
    const slow = { ...deps, clock: () => (time += 8_000) };
    expect((await runNotifications(slow, NOW)).complete).toBe(false);
    const missed = ids.filter((id) => processed.get(id) === 0);
    expect(missed.length).toBeGreaterThan(0);
    tried.length = 0;
    expect((await runNotifications(deps, LATER)).complete).toBe(true);
    expect(missed.every((id) => processed.get(id) === LATER.getTime())).toBe(true);
    expect(tried[0]!.endsWith(missed[0]!)).toBe(true);
  });

  it('moves an unreadable page to the back instead of stopping there', async () => {
    const ids = ['a', 'b', 'c', 'd'];
    const { deps, tried } = harness(() => 'sent', ids, 2);
    const broken: NotifyDeps = {
      ...deps,
      loadPage: async (now) => {
        const page = await deps.loadPage(now);
        return page?.ids.includes('a') ? { ...page, users: [], failed: true } : page;
      },
    };
    expect((await runNotifications(broken, NOW)).complete).toBe(false);
    expect(new Set(tried.map((item) => item.split(':')[1]))).toEqual(new Set(['c', 'd']));
  });

  it('ends when the cursor cannot be saved', async () => {
    const { deps } = harness(() => 'sent');
    const stuck = { ...deps, markProcessed: async () => false };
    expect((await runNotifications(stuck, NOW)).complete).toBe(false);
  });

  it('bounds parallel pushes and sends letters one by one', async () => {
    const ids = Array.from({ length: 30 }, (_, i) => `u${i}`);
    const open = { push: 0, email: 0 };
    const most = { push: 0, email: 0 };
    const { deps } = harness(async (channel): Promise<SendResult> => {
      const name = channel as 'push' | 'email';
      open[name] += 1;
      most[name] = Math.max(most[name], open[name]);
      await new Promise((resolve) => setTimeout(resolve, 1));
      open[name] -= 1;
      return 'sent';
    }, ids);
    await runNotifications(deps, NOW);
    expect(most.email).toBe(1);
    expect(most.push).toBeGreaterThan(1);
    expect(most.push).toBeLessThanOrEqual(RUN_LIMITS.pushConcurrency);
  });

  it('reads nothing in quiet hours and reports a failed read', async () => {
    const { deps } = harness(() => 'sent');
    let reads = 0;
    const counted = {
      ...deps,
      loadPage: async () => {
        reads += 1;
        return null;
      },
    };
    expect((await runNotifications(counted, new Date('2026-11-24T22:00:00Z'))).complete).toBe(true);
    expect(reads).toBe(0);
    expect((await runNotifications(counted, NOW)).complete).toBe(false);
  });
});
