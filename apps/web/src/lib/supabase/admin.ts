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
