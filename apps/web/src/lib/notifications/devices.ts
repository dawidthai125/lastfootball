/** Server only. Callers pass the signed-in user. */

import { tryAdminClient } from '@/lib/supabase/admin';

type Admin = NonNullable<ReturnType<typeof tryAdminClient>>;

/** Removes one own device and turns push off with the last one. Quiet: signing out must not fail. */
export async function forgetPushDevice(
  userId: string,
  endpoint: string,
  admin: Admin | null = tryAdminClient(),
): Promise<boolean> {
  if (!admin) return false;
  try {
    const removed = await admin
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .select('id');
    if (removed.error) return false;
    if (removed.data.length === 0) return true;
    const left = await admin
      .from('push_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (!left.error && left.count === 0) {
      await admin
        .from('notification_prefs')
        .update({ push_enabled: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    }
    return true;
  } catch {
    return false;
  }
}
