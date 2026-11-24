/** One-click unsubscribe. The link works without login; the database stores only its hash. */

import { createHash, createHmac } from 'node:crypto';

import { loadUnsubscribeKey } from '@/lib/notifications/server-secrets';
import { tryAdminClient } from '@/lib/supabase/admin';

type Admin = NonNullable<ReturnType<typeof tryAdminClient>>;

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function isUnsubscribeToken(value: unknown): value is string {
  return typeof value === 'string' && TOKEN_PATTERN.test(value);
}

/** Same user and key give the same link, so links in old letters keep working. */
export function makeUnsubscribeToken(key: string, userId: string): string {
  return createHmac('sha256', key).update(`lf-unsubscribe:${userId}`).digest('base64url');
}

export function hashUnsubscribeToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Token for a letter. Null when the hash could not be stored, and then no letter goes out. */
export async function ensureUnsubscribeToken(admin: Admin, userId: string): Promise<string | null> {
  const key = await loadUnsubscribeKey(admin);
  if (!key) return null;
  const token = makeUnsubscribeToken(key, userId);
  const { data, error } = await admin
    .from('notification_prefs')
    .update({ unsubscribe_token_hash: hashUnsubscribeToken(token) })
    .eq('user_id', userId)
    .select('user_id')
    .maybeSingle();
  return error || !data ? null : token;
}

export type UnsubscribeResult = 'ok' | 'bad' | 'unavailable';

/** Turns e-mail off only. Push and the kinds stay as the manager left them. */
export async function unsubscribeByToken(
  token: unknown,
  admin: Admin | null = tryAdminClient(),
): Promise<UnsubscribeResult> {
  if (!isUnsubscribeToken(token)) return 'bad';
  if (!admin) return 'unavailable';
  const { data, error } = await admin
    .from('notification_prefs')
    .update({ email_enabled: false, updated_at: new Date().toISOString() })
    .eq('unsubscribe_token_hash', hashUnsubscribeToken(token))
    .select('user_id');
  if (error) return 'unavailable';
  return data.length > 0 ? 'ok' : 'bad';
}
