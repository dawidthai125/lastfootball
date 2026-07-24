'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import type { CompleteFirstMatchState } from '@/lib/first-match/action-types';
import { FIRST_MATCH_PATHS } from '@/lib/first-match/constants';
import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';

/**
 * Idempotent SSOT write: set clubs.first_match_completed_at once, then Welcome.
 */
export async function completeFirstMatch(
  _prev: CompleteFirstMatchState,
  formData: FormData,
): Promise<CompleteFirstMatchState> {
  void formData;
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesja wygasła. Zaloguj się ponownie.' };
  }

  const { data: club, error: loadErr } = await supabase
    .from('clubs')
    .select('id, first_match_completed_at')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (loadErr || !club) {
    return { error: 'Nie znaleziono klubu.' };
  }

  const row = club as { id: string; first_match_completed_at: string | null };

  if (!row.first_match_completed_at) {
    const { error: updErr } = await supabase
      .from('clubs')
      .update({ first_match_completed_at: new Date().toISOString() } as never)
      .eq('id', row.id)
      .is('first_match_completed_at', null);

    if (updErr) {
      return { error: 'Nie udało się zapisać ukończenia meczu.' };
    }
  }

  revalidatePath('/', 'layout');
  redirect(FIRST_MATCH_PATHS.welcome);
}
