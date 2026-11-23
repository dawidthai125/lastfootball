import { createClient } from '@supabase/supabase-js';

import { env } from '@/config/env';
import type { Database } from '@/types/database';

/**
 * Service-role client — server / cron / trusted jobs ONLY.
 * Bypasses RLS. Never import from Client Components or shared browser bundles.
 */
export function createAdminClient() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error(
      'Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  return createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/** Null without the service key (local, some previews): callers skip or report, never crash. */
export function tryAdminClient(): ReturnType<typeof createAdminClient> | null {
  return env.supabaseUrl && env.supabaseServiceRoleKey ? createAdminClient() : null;
}

/**
 * Writer for tables the player session may not change (D127, D128).
 * Callers must have authorised the owner and must filter by that club id, because the
 * service role skips RLS. Without the key the session client stays and the database decides.
 */
export function serverDb<T>(session: T): T {
  return (tryAdminClient() as unknown as T | null) ?? session;
}
