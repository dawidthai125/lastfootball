/** Server only. What the settings page shows; null hides the whole section. */

import { emailProvider } from '@/lib/notifications/email';
import { loadVapidKeys } from '@/lib/notifications/server-secrets';
import {
  PREFS_OFF,
  type EmailChannelState,
  type NotificationPrefs,
  type NotificationSettings,
} from '@/lib/notifications/types';
import { tryAdminClient } from '@/lib/supabase/admin';

type Admin = NonNullable<ReturnType<typeof tryAdminClient>>;

export async function readPrefs(admin: Admin, userId: string): Promise<NotificationPrefs | null> {
  const { data, error } = await admin
    .from('notification_prefs')
    .select(
      'push_enabled, email_enabled, kind_matchday, kind_human_round, kind_offer, kind_challenge',
    )
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return null;
  if (!data) return PREFS_OFF;
  return {
    push: data.push_enabled,
    email: data.email_enabled,
    kinds: {
      matchday: data.kind_matchday,
      human_round: data.kind_human_round,
      offer: data.kind_offer,
      challenge: data.kind_challenge,
    },
  };
}

export async function emailChannelState(admin: Admin, userId: string): Promise<EmailChannelState> {
  if (!emailProvider()) return 'soon';
  const { data, error } = await admin
    .from('manager_email_status')
    .select('confirmed_at')
    .eq('user_id', userId)
    .maybeSingle();
  return !error && data?.confirmed_at ? 'ready' : 'unconfirmed';
}

/** Callers pass the signed-in user. */
export async function loadNotificationSettings(
  userId: string,
  admin: Admin | null = tryAdminClient(),
): Promise<NotificationSettings | null> {
  if (!admin) return null;
  try {
    const [prefs, vapid, emailState, devices] = await Promise.all([
      readPrefs(admin, userId),
      loadVapidKeys(admin),
      emailChannelState(admin, userId),
      admin
        .from('push_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
    ]);
    if (!prefs || devices.error) return null;
    return {
      prefs,
      vapidPublicKey: vapid?.publicKey ?? null,
      emailState,
      deviceCount: devices.count ?? 0,
    };
  } catch {
    return null;
  }
}
