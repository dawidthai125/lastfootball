/** One scheduler run: take the longest waiting managers, plan, claim, send. All i/o is injected. */

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
  /** Every manager of the page, also one without a club. */
  readonly ids: readonly string[];
  readonly users: readonly PlannerUser[];
  /** Details could not be read. The page goes to the back, so it cannot block the others. */
  readonly failed: boolean;
};

export type NotifyDeps = {
  /** Managers not yet processed since `now`, longest waiting first. Null when unreadable. */
  readonly loadPage: (now: Date) => Promise<NotifyPage | null>;
  readonly markProcessed: (ids: readonly string[], now: Date) => Promise<boolean>;
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
  /** True when every manager was seen. The rest goes first in the next run. */
  readonly complete: boolean;
};

export const RUN_LIMITS = {
  budgetMs: 40_000,
  maxPages: 40,
  maxSends: 500,
  pushConcurrency: 8,
  /** Letters in a row that did not get through: the provider is down, push goes on alone. */
  maxEmailRetries: 3,
} as const;

async function pool<T>(items: readonly T[], size: number, work: (item: T) => Promise<void>) {
  let index = 0;
  const worker = async () => {
    while (index < items.length) await work(items[index++]!);
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
}

export async function runNotifications(deps: NotifyDeps, now: Date): Promise<NotifyCounts> {
  const counts = { users: 0, planned: 0, sent: 0, failed: 0 };
  if (isQuietHour(now)) return { ...counts, complete: true };

  const deadline = deps.clock() + RUN_LIMITS.budgetMs;
  const closed = new Set<string>();
  const seen = new Set<string>();
  let attempts = 0;
  let emailRetries = 0;
  let unread = false;

  for (let page = 0; page < RUN_LIMITS.maxPages; page += 1) {
    const loaded = await deps.loadPage(now).catch(() => null);
    if (!loaded) return { ...counts, complete: false };
    const fresh = loaded.ids.filter((id) => !seen.has(id));
    if (fresh.length === 0) return { ...counts, complete: loaded.ids.length === 0 && !unread };
    unread ||= loaded.failed;
    fresh.forEach((id) => seen.add(id));

    /** Managers with something left over when the time ran out: they keep their place in line. */
    const cut = new Set<string>();
    const handle = async (item: PlannedNotification) => {
      if (closed.has(item.channel)) return;
      if (deps.clock() >= deadline || attempts >= RUN_LIMITS.maxSends) {
        cut.add(item.userId);
        return;
      }
      attempts += 1;
      if ((await deps.claim(item)) !== 'claimed') return;
      const result = await deps.send(item).catch((): SendResult => 'lost');
      if (item.channel === 'email') {
        emailRetries = result === 'retry' ? emailRetries + 1 : 0;
        if (emailRetries >= RUN_LIMITS.maxEmailRetries) closed.add('email');
      }
      if (result === 'sent') {
        counts.sent += 1;
        return;
      }
      counts.failed += 1;
      if (result === 'stop') closed.add(item.channel);
      if (result !== 'lost') await deps.release(item);
    };

    const items = loaded.users.flatMap((user) => planNotifications(user, now));
    counts.users += loaded.users.length;
    counts.planned += items.length;
    await Promise.all([
      pool(
        items.filter((item) => item.channel === 'push'),
        RUN_LIMITS.pushConcurrency,
        handle,
      ),
      pool(
        items.filter((item) => item.channel === 'email'),
        1,
        handle,
      ),
    ]);

    const marked = await deps.markProcessed(
      loaded.ids.filter((id) => !cut.has(id)),
      now,
    );
    if (!marked || cut.size > 0 || deps.clock() >= deadline) return { ...counts, complete: false };
  }
  return { ...counts, complete: false };
}
