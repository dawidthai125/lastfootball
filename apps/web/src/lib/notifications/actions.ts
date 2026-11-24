'use server';

import { revalidatePath } from 'next/cache';

import { getAuthUser } from '@/lib/auth/session';
import { warsawDateKey } from '@/lib/fixtures/matchday-gate';
import { TEST_PUSH_PAYLOAD } from '@/lib/notifications/content';
import { forgetPushDevice } from '@/lib/notifications/devices';
import { listPushDevices, sendPushToDevices } from '@/lib/notifications/push';
import { isPushEndpoint, parsePushDevice } from '@/lib/notifications/push-endpoint';
import { loadVapidKeys } from '@/lib/notifications/server-secrets';
import { emailChannelState, readPrefs } from '@/lib/notifications/settings';
import {
  MAX_PUSH_DEVICES,
  PUSH_ENABLED,
  NOTIFICATION_KINDS,
  type NotificationActionResult,
  type NotificationChanges,
  type PushDeviceOwner,
} from '@/lib/notifications/types';
import { tryAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database';

const UNAVAILABLE: NotificationActionResult = {
  ok: false,
  message: 'Powiadomienia są teraz niedostępne.',
};

const TEST_GAP_MS = 2 * 60 * 1000;
const TESTS_PER_DAY = 5;
const TEST_TTL_SECONDS = 10 * 60;

/** The signed-in user and the server writer. Every action starts here. */
async function authorize() {
  const user = await getAuthUser().catch(() => null);
  const admin = tryAdminClient();
  return user && admin ? { userId: user.id, admin } : null;
}

type Access = NonNullable<Awaited<ReturnType<typeof authorize>>>;

async function setPush({ admin, userId }: Access, enabled: boolean): Promise<boolean> {
  const now = new Date().toISOString();
  const { error } = await admin
    .from('notification_prefs')
    .upsert(
      { user_id: userId, push_enabled: enabled, updated_at: now, chosen_at: now },
      { onConflict: 'user_id' },
    );
  return !error;
}

/** Whose is this browser's subscription? Unknown when the server cannot tell. */
export async function checkPushDevice(endpoint: unknown): Promise<PushDeviceOwner> {
  if (!isPushEndpoint(endpoint)) return 'unknown';
  const access = await authorize();
  if (!access) return 'unknown';
  const { data, error } = await access.admin
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', access.userId)
    .eq('endpoint', endpoint)
    .maybeSingle();
  if (error) return 'unknown';
  return data ? 'own' : 'foreign';
}

export async function savePushDevice(raw: unknown): Promise<NotificationActionResult> {
  if (!PUSH_ENABLED) return UNAVAILABLE;
  const device = parsePushDevice(raw);
  if (!device) return { ok: false, message: 'Ta przeglądarka podała nieobsługiwany adres.' };
  const access = await authorize();
  if (!access) return UNAVAILABLE;
  const { admin, userId } = access;

  const inserted = await admin.from('push_subscriptions').insert({ user_id: userId, ...device });
  if (inserted.error) {
    if (inserted.error.code !== '23505') return UNAVAILABLE;
    // Known device. Same keys prove it is the same browser, for example after a change of account.
    const moved = await admin
      .from('push_subscriptions')
      .update({ user_id: userId, failure_count: 0 })
      .eq('endpoint', device.endpoint)
      .eq('p256dh', device.p256dh)
      .eq('auth', device.auth)
      .select('id');
    if (moved.error) return UNAVAILABLE;
    if (moved.data.length === 0) {
      return { ok: false, message: 'Nie udało się zapisać urządzenia. Spróbuj ponownie.' };
    }
  }

  // Newest five stay, so an old phone gives way to the new one. This one always stays.
  const devices = await admin
    .from('push_subscriptions')
    .select('id, endpoint')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  const extra = (devices.data ?? [])
    .filter((row) => row.endpoint !== device.endpoint)
    .slice(MAX_PUSH_DEVICES - 1)
    .map((row) => row.id);
  if (extra.length > 0) {
    await admin.from('push_subscriptions').delete().eq('user_id', userId).in('id', extra);
  }

  if (!(await setPush(access, true))) return UNAVAILABLE;
  revalidatePath('/settings');
  return { ok: true, message: 'Powiadomienia na tym urządzeniu są włączone.' };
}

export async function removePushDevice(endpoint: unknown): Promise<NotificationActionResult> {
  if (!isPushEndpoint(endpoint)) return UNAVAILABLE;
  const access = await authorize();
  if (!access) return UNAVAILABLE;
  if (!(await forgetPushDevice(access.userId, endpoint, access.admin))) return UNAVAILABLE;
  revalidatePath('/settings');
  return { ok: true, message: 'Powiadomienia na tym urządzeniu są wyłączone.' };
}

export async function removeAllPushDevices(): Promise<NotificationActionResult> {
  const access = await authorize();
  if (!access) return UNAVAILABLE;
  const { error } = await access.admin
    .from('push_subscriptions')
    .delete()
    .eq('user_id', access.userId);
  if (error || !(await setPush(access, false))) return UNAVAILABLE;
  revalidatePath('/settings');
  return { ok: true, message: 'Powiadomienia są wyłączone na wszystkich urządzeniach.' };
}

/** Writes the changed fields only, so it cannot undo a newer choice made elsewhere. */
export async function saveNotificationPrefs(
  changes: NotificationChanges,
): Promise<NotificationActionResult> {
  const access = await authorize();
  if (!access) return UNAVAILABLE;
  const { admin, userId } = access;

  const flag = (value: unknown) => (typeof value === 'boolean' ? value : undefined);
  const email = flag(changes?.email);
  if (email === true) {
    const state = await emailChannelState(admin, userId);
    if (state === 'soon') return { ok: false, message: 'E-mail włączymy wkrótce.' };
    if (state === 'unconfirmed') {
      return { ok: false, message: 'Najpierw potwierdź adres e-mail.' };
    }
  }

  const now = new Date().toISOString();
  const row: Database['public']['Tables']['notification_prefs']['Insert'] = {
    user_id: userId,
    updated_at: now,
    chosen_at: now,
  };
  if (email !== undefined) row.email_enabled = email;
  for (const kind of NOTIFICATION_KINDS) {
    const value = flag(changes?.kinds?.[kind]);
    if (value !== undefined) row[`kind_${kind}`] = value;
  }
  const { error } = await admin.from('notification_prefs').upsert(row, { onConflict: 'user_id' });
  if (error) return UNAVAILABLE;
  const prefs = await readPrefs(admin, userId);
  revalidatePath('/settings');
  return { ok: true, message: 'Zapisano.', ...(prefs ? { prefs } : {}) };
}

/** To the signed-in manager's own devices. One per two minutes and five a day. */
export async function sendTestPush(): Promise<NotificationActionResult> {
  if (!PUSH_ENABLED) return UNAVAILABLE;
  const access = await authorize();
  if (!access) return UNAVAILABLE;
  const { admin, userId } = access;
  const now = new Date();

  const tests = await admin
    .from('notification_log')
    .select('sent_at')
    .eq('user_id', userId)
    .eq('kind', 'test')
    .gte('sent_at', new Date(now.getTime() - 26 * 60 * 60 * 1000).toISOString());
  if (tests.error) return UNAVAILABLE;
  const today = warsawDateKey(now);
  const usedToday = tests.data.filter((row) => warsawDateKey(new Date(row.sent_at)) === today);
  if (usedToday.length >= TESTS_PER_DAY) {
    return { ok: false, message: 'Limit prób na dziś jest wykorzystany.' };
  }
  const wait: NotificationActionResult = {
    ok: false,
    message: 'Próbę można wysłać raz na dwie minuty.',
  };
  if (tests.data.some((row) => now.getTime() - Date.parse(row.sent_at) < TEST_GAP_MS)) return wait;

  const [vapid, devices] = await Promise.all([
    loadVapidKeys(admin),
    listPushDevices(admin, [userId]),
  ]);
  const own = devices.get(userId) ?? [];
  if (!vapid) return UNAVAILABLE;
  if (own.length === 0) return { ok: false, message: 'Najpierw włącz powiadomienia.' };

  // The slot is the claim: two clicks at once cannot both pass.
  const claimed = await admin.from('notification_log').insert({
    user_id: userId,
    kind: 'test',
    ref: String(Math.floor(now.getTime() / TEST_GAP_MS)),
    channel: 'push',
  });
  if (claimed.error) return claimed.error.code === '23505' ? wait : UNAVAILABLE;

  const result = await sendPushToDevices(admin, own, TEST_PUSH_PAYLOAD, vapid, TEST_TTL_SECONDS);
  return result === 'sent'
    ? { ok: true, message: 'Wysłano próbne powiadomienie.' }
    : { ok: false, message: 'Nie udało się dostarczyć próby. Włącz powiadomienia ponownie.' };
}
