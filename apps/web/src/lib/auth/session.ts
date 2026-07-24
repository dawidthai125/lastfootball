import type { User } from '@supabase/supabase-js';

import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';

export async function getAuthUser(): Promise<User | null> {
  if (!env.isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function userHasClub(userId: string): Promise<boolean> {
  if (!env.isSupabaseConfigured) return false;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id === userId && user.user_metadata?.has_club === true) {
    return true;
  }
  const { data, error } = await supabase
    .from('clubs')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle();
  if (error) return false;
  const clubRow = data as { id: string } | null;
  return Boolean(clubRow?.id);
}

/** Post-auth destination per PLAN: club → Hub, else Welcome. */
export async function getPostAuthPath(userId: string): Promise<'/hub' | '/welcome'> {
  return (await userHasClub(userId)) ? '/hub' : '/welcome';
}

export function sanitizeNextPath(next: string | null | undefined, fallback: string): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return next;
  }
  return fallback;
}
