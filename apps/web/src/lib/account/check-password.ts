import { createClient as createPlainClient } from '@supabase/supabase-js';

import { env } from '@/config/env';

/** Server only. A separate client, so the check never touches the session cookies. */
export async function isOwnPassword(
  user: { readonly id: string; readonly email?: string | null },
  password: string,
): Promise<boolean> {
  if (!env.supabaseUrl || !env.supabaseAnonKey || !user.email || !password) return false;
  const check = createPlainClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const proven = await check.auth.signInWithPassword({ email: user.email, password });
  const ok = !proven.error && proven.data.user?.id === user.id;
  if (proven.data.session) await check.auth.signOut({ scope: 'local' }).catch(() => undefined);
  return ok;
}
