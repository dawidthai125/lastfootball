import { describe, expect, it } from 'vitest';

import type { PlannerUser } from '@/lib/notifications/planner';
import { runNotifications, type NotifyDeps, type SendResult } from '@/lib/notifications/run';

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
      },
    ],
    challenges: [],
    log: [],
  };
}

function harness(send: (channel: string) => SendResult, log = new Set<string>()) {
  const tried: string[] = [];
  const deps: NotifyDeps = {
    clock: () => 0,
    loadPage: async () => ({ users: [manager('a'), manager('b')], next: null }),
    claim: async (item) => {
      const key = `${item.userId}|${item.kind}|${item.ref}|${item.channel}`;
      if (log.has(key)) return 'taken';
      log.add(key);
      return 'claimed';
    },
    release: async (item) => {
      log.delete(`${item.userId}|${item.kind}|${item.ref}|${item.channel}`);
    },
    send: async (item) => {
      tried.push(`${item.channel}:${item.userId}`);
      return send(item.channel);
    },
  };
  return { deps, tried, log };
}

describe('scheduler run', () => {
  it('claims before sending, so a second run sends nothing', async () => {
    const { deps, tried } = harness(() => 'sent');
    const first = await runNotifications(deps, NOW);
    expect(first).toEqual({ users: 2, planned: 4, sent: 4, failed: 0, complete: true });
    expect((await runNotifications(deps, NOW)).sent).toBe(0);
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
    expect(tried).toEqual(['push:a', 'email:a', 'push:b']);
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

  it('stops at the time budget', async () => {
    let time = 0;
    const { deps, tried } = harness(() => 'sent');
    const slow = { ...deps, clock: () => (time += 30_000) };
    expect((await runNotifications(slow, NOW)).complete).toBe(false);
    expect(tried.length).toBeLessThan(4);
  });
});
