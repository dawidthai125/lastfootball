import { createBrowserClient } from '@supabase/ssr';

import { env } from '@/config/env';
import type { Database } from '@/types/database';

export function createClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
}
