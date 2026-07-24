'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { env } from '@/config/env';
import type { CompleteFixtureState } from '@/lib/fixtures/action-types';
import { createClient } from '@/lib/supabase/server';

/**
 * Idempotent: mark fixture played with score, promote next scheduled → upcoming.
 */
export async function completeFixture(
  _prev: CompleteFixtureState,
  formData: FormData,
): Promise<CompleteFixtureState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const fixtureId = String(formData.get('fixtureId') ?? '');
  const homeScore = Number(formData.get('homeScore'));
  const awayScore = Number(formData.get('awayScore'));

  if (!fixtureId || !Number.isFinite(homeScore) || !Number.isFinite(awayScore)) {
    return { error: 'Brak wyniku meczu.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesja wygasła. Zaloguj się ponownie.' };
  }

  const { data: club, error: clubErr } = await supabase
    .from('clubs')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (clubErr || !club) {
    return { error: 'Nie znaleziono klubu.' };
  }

  const clubId = (club as { id: string }).id;

  const { data: fixture, error: loadErr } = await supabase
    .from('fixtures')
    .select('id, club_id, matchday, status')
    .eq('id', fixtureId)
    .eq('club_id', clubId)
    .maybeSingle();

  if (loadErr || !fixture) {
    return { error: 'Nie znaleziono meczu.' };
  }

  const row = fixture as { id: string; club_id: string; matchday: number; status: string };

  if (row.status !== 'played') {
    const playedAt = new Date().toISOString();
    const { error: updErr } = await supabase
      .from('fixtures')
      .update({
        status: 'played',
        home_score: Math.trunc(homeScore),
        away_score: Math.trunc(awayScore),
        played_at: playedAt,
      } as never)
      .eq('id', row.id)
      .eq('club_id', clubId)
      .neq('status', 'played');

    if (updErr) {
      return { error: 'Nie udało się zapisać wyniku.' };
    }

    const { data: next } = await supabase
      .from('fixtures')
      .select('id')
      .eq('club_id', clubId)
      .eq('status', 'scheduled')
      .order('matchday', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (next) {
      const nextId = (next as { id: string }).id;
      await supabase
        .from('fixtures')
        .update({ status: 'upcoming' } as never)
        .eq('id', nextId)
        .eq('club_id', clubId)
        .eq('status', 'scheduled');
    }
  }

  revalidatePath('/', 'layout');
  redirect('/hub');
}
