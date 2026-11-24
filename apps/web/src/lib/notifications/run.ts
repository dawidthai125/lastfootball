/** One scheduler run: load a page of managers, plan, claim, send. Everything outside is injected. */

import {
  isQuietHour,
  planNotifications,
  type PlannedNotification,
  type PlannerUser,
} from '@/lib/notifications/planner';

export type ClaimResult = 'claimed' | 'taken' | 'error';

/** retry releases the claim, lost keeps it, stop releases it and closes the channel for this run. */
export type SendResult = 'sent' | 'retry' | 'lost' | 'stop';

export type NotifyPage = {
  readonly users: readonly PlannerUser[];
  /** Null after the last page. */
  readonly next: string | null;
};

export type NotifyDeps = {
  readonly loadPage: (after: string | null, now: Date) => Promise<NotifyPage | null>;
  readonly claim: (item: PlannedNotification) => Promise<ClaimResult>;
  readonly release: (item: PlannedNotification) => Promise<void>;
  readonly send: (item: PlannedNotification) => Promise<SendResult>;
  readonly clock: () => number;
};

export type NotifyCounts = {
  readonly users: number;
  readonly planned: number;
  readonly sent: number;
  readonly failed: number;
  /** True when every page was seen before the time or batch limit. */
  readonly complete: boolean;
};

export const RUN_LIMITS = { budgetMs: 40_000, maxPages: 40, maxSends: 500 } as const;

export async function runNotifications(deps: NotifyDeps, now: Date): Promise<NotifyCounts> {
  const counts = { users: 0, planned: 0, sent: 0, failed: 0 };
  if (isQuietHour(now)) return { ...counts, complete: true };

  const deadline = deps.clock() + RUN_LIMITS.budgetMs;
  const closed = new Set<string>();
  let after: string | null = null;
  let attempts = 0;

  for (let page = 0; page < RUN_LIMITS.maxPages; page += 1) {
    const loaded = await deps.loadPage(after, now);
    if (!loaded) return { ...counts, complete: false };

    for (const user of loaded.users) {
      counts.users += 1;
      for (const item of planNotifications(user, now)) {
        if (closed.has(item.channel)) continue;
        if (deps.clock() >= deadline || attempts >= RUN_LIMITS.maxSends) {
          return { ...counts, complete: false };
        }
        counts.planned += 1;
        if ((await deps.claim(item)) !== 'claimed') continue;
        attempts += 1;
        const result = await deps.send(item).catch((): SendResult => 'lost');
        if (result === 'sent') {
          counts.sent += 1;
          continue;
        }
        counts.failed += 1;
        if (result === 'stop') closed.add(item.channel);
        if (result !== 'lost') await deps.release(item);
      }
    }

    after = loaded.next;
    if (!after) return { ...counts, complete: true };
    if (deps.clock() >= deadline) return { ...counts, complete: false };
  }
  return { ...counts, complete: false };
}
