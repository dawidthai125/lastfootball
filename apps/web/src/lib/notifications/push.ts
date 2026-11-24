/** Server only. Sends one payload to every device of one manager. */

import { sendNotification } from 'web-push';

import type { PushPayload } from '@/lib/notifications/content';
import { isPushEndpoint } from '@/lib/notifications/push-endpoint';
import type { VapidKeys } from '@/lib/notifications/server-secrets';
import { tryAdminClient } from '@/lib/supabase/admin';

type Admin = NonNullable<ReturnType<typeof tryAdminClient>>;

export type PushDevice = {
  readonly id: string;
  readonly endpoint: string;
  readonly p256dh: string;
  readonly auth: string;
  readonly failureCount: number;
};

/** gone: the browser dropped it. refused: bad key or payload. busy: outage. unknown: no answer. */
export type DeviceOutcome = 'accepted' | 'gone' | 'refused' | 'busy' | 'unknown';

/** Push services look at who sends. A site address, not a person's mailbox. */
const VAPID_SUBJECT = 'https://www.lastfootball.pl';
const TIMEOUT_MS = 7_000;
const TTL_SECONDS = 3 * 60 * 60;
export const MAX_PUSH_FAILURES = 5;

export function outcomeFromStatus(status: unknown): DeviceOutcome {
  if (status === 404 || status === 410) return 'gone';
  if (typeof status !== 'number') return 'unknown';
  return status === 429 || status >= 500 ? 'busy' : 'refused';
}

async function sendToDevice(
  device: PushDevice,
  payload: PushPayload,
  vapid: VapidKeys,
): Promise<DeviceOutcome> {
  // A row from before a rule change must not be called either.
  if (!isPushEndpoint(device.endpoint)) return 'gone';
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const sending = sendNotification(
      { endpoint: device.endpoint, keys: { p256dh: device.p256dh, auth: device.auth } },
      JSON.stringify(payload),
      {
        vapidDetails: { subject: VAPID_SUBJECT, ...vapid },
        TTL: TTL_SECONDS,
        topic: payload.tag,
        timeout: TIMEOUT_MS,
      },
    ).then(
      (): DeviceOutcome => 'accepted',
      (error: unknown) => outcomeFromStatus((error as { statusCode?: unknown }).statusCode),
    );
    const late = new Promise<DeviceOutcome>((resolve) => {
      timer = setTimeout(() => resolve('unknown'), TIMEOUT_MS);
    });
    return await Promise.race([sending, late]);
  } catch {
    return 'refused';
  } finally {
    clearTimeout(timer);
  }
}

export async function listPushDevices(
  admin: Admin,
  userIds: readonly string[],
): Promise<Map<string, PushDevice[]>> {
  const devices = new Map<string, PushDevice[]>();
  if (userIds.length === 0) return devices;
  const { data, error } = await admin
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth, failure_count')
    .in('user_id', [...userIds])
    .order('created_at', { ascending: false });
  if (error) return devices;
  for (const row of data) {
    const list = devices.get(row.user_id) ?? [];
    list.push({
      id: row.id,
      endpoint: row.endpoint,
      p256dh: row.p256dh,
      auth: row.auth,
      failureCount: row.failure_count,
    });
    devices.set(row.user_id, list);
  }
  return devices;
}

/** 404 and 410 remove the device, and so do five failures in a row. */
async function recordOutcome(admin: Admin, device: PushDevice, outcome: DeviceOutcome) {
  if (outcome === 'accepted') {
    if (device.failureCount > 0) {
      await admin.from('push_subscriptions').update({ failure_count: 0 }).eq('id', device.id);
    }
    return;
  }
  // An outage of the push service says nothing about the device.
  if (outcome === 'busy') return;
  const failures = device.failureCount + 1;
  if (outcome === 'gone' || failures >= MAX_PUSH_FAILURES) {
    await admin.from('push_subscriptions').delete().eq('id', device.id);
    return;
  }
  await admin.from('push_subscriptions').update({ failure_count: failures }).eq('id', device.id);
}

/** sent: one device took it. retry: certainly not delivered. lost: refused or maybe delivered. */
export type PushResult = 'sent' | 'retry' | 'lost';

export function combineOutcomes(outcomes: readonly DeviceOutcome[]): PushResult {
  if (outcomes.includes('accepted')) return 'sent';
  return outcomes.includes('busy') && !outcomes.includes('unknown') ? 'retry' : 'lost';
}

export async function sendPushToDevices(
  admin: Admin,
  devices: readonly PushDevice[],
  payload: PushPayload,
  vapid: VapidKeys,
): Promise<PushResult> {
  return combineOutcomes(
    await Promise.all(
      devices.map(async (device) => {
        const outcome = await sendToDevice(device, payload, vapid);
        await recordOutcome(admin, device, outcome);
        return outcome;
      }),
    ),
  );
}
