import { env } from '@/config/env';

export function getSupabaseStatus(): {
  configured: boolean;
  urlHost: string | null;
} {
  if (!env.isSupabaseConfigured || !env.supabaseUrl) {
    return { configured: false, urlHost: null };
  }

  try {
    return { configured: true, urlHost: new URL(env.supabaseUrl).host };
  } catch {
    return { configured: false, urlHost: null };
  }
}
