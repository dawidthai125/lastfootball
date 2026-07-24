import type { User } from '@supabase/supabase-js';

import { env } from '@/config/env';
import { FIRST_MATCH_PATHS } from '@/lib/first-match/constants';
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

  const allowMetaFallback =
    process.env.NODE_ENV === 'development' && process.env.LFE_DEV_CLUB_META_FALLBACK === '1';
  if (allowMetaFallback) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id === userId && user.user_metadata?.has_club === true) {
      return true;
    }
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

export async function userFirstMatchCompleted(userId: string): Promise<boolean> {
  if (!env.isSupabaseConfigured) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clubs')
    .select('first_match_completed_at')
    .eq('owner_id', userId)
    .maybeSingle();
  if (error) return false;
  const row = data as { first_match_completed_at: string | null } | null;
  return Boolean(row?.first_match_completed_at);
}

/** Post-auth destination: welcome → first-match tunnel → hub. */
export async function getPostAuthPath(
  userId: string,
): Promise<'/hub' | '/welcome' | '/onboarding/first-match'> {
  if (!(await userHasClub(userId))) return '/welcome';
  if (!(await userFirstMatchCompleted(userId))) return FIRST_MATCH_PATHS.intro;
  return '/hub';
}

export function sanitizeNextPath(next: string | null | undefined, fallback: string): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return next;
  }
  return fallback;
}
