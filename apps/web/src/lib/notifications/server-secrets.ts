/** Server only. Keys kept in `server_secrets`; never log, return or bundle a value. */

import { randomBytes } from 'node:crypto';

import { generateVAPIDKeys } from 'web-push';

import { tryAdminClient } from '@/lib/supabase/admin';

type Admin = NonNullable<ReturnType<typeof tryAdminClient>>;

export type VapidKeys = { readonly publicKey: string; readonly privateKey: string };

async function readSecret(admin: Admin, name: string): Promise<string | null | 'error'> {
  const { data, error } = await admin
    .from('server_secrets')
    .select('value')
    .eq('name', name)
    .maybeSingle();
  if (error) return 'error';
  return data?.value ?? null;
}

/** Insert if absent, then read again: two servers starting together end with one value. */
export async function ensureSecret(
  admin: Admin,
  name: string,
  make: () => string,
): Promise<string | null> {
  const found = await readSecret(admin, name);
  if (found === 'error') return null;
  if (found) return found;
  const { error } = await admin
    .from('server_secrets')
    .upsert({ name, value: make() }, { onConflict: 'name', ignoreDuplicates: true });
  if (error) return null;
  const stored = await readSecret(admin, name);
  return stored === 'error' ? null : stored;
}

export function parseVapid(value: string | null): VapidKeys | null {
  if (!value) return null;
  try {
    const row = JSON.parse(value) as Partial<VapidKeys>;
    if (typeof row.publicKey !== 'string' || typeof row.privateKey !== 'string') return null;
    if (Buffer.from(row.publicKey, 'base64url').length !== 65) return null;
    if (Buffer.from(row.privateKey, 'base64url').length !== 32) return null;
    return { publicKey: row.publicKey, privateKey: row.privateKey };
  } catch {
    return null;
  }
}

export async function loadVapidKeys(admin: Admin | null): Promise<VapidKeys | null> {
  if (!admin) return null;
  try {
    const value = await ensureSecret(admin, 'vapid', () => JSON.stringify(generateVAPIDKeys()));
    return parseVapid(value);
  } catch {
    return null;
  }
}

export async function loadUnsubscribeKey(admin: Admin | null): Promise<string | null> {
  if (!admin) return null;
  try {
    return await ensureSecret(admin, 'unsubscribe_key', () => randomBytes(32).toString('hex'));
  } catch {
    return null;
  }
}

/** Written by the migration. The app only reads it. */
export async function readNotifyToken(admin: Admin | null): Promise<string | null> {
  if (!admin) return null;
  try {
    const value = await readSecret(admin, 'notify_token');
    return value === 'error' ? null : value;
  } catch {
    return null;
  }
}
