'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { env } from '@/config/env';
import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
import type { ConfirmStartNextSeasonState } from '@/lib/season/action-types';
import { onSeasonEnd } from '@/lib/squad/season-age';
import { createClient } from '@/lib/supabase/server';

/**
 * Confirm N+1 (D82 · D85) — sole path into Season N+1.
 * Clears slate → planClubFixtures reseed (D80) → season++ · in_season · same league (D73).
 * Hooks = no-op only (D83).
 */
export async function confirmStartNextSeason(
  _prev: ConfirmStartNextSeasonState,
  _formData: FormData,
): Promise<ConfirmStartNextSeasonState> {
  void _formData;
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

  const { data: club, error: clubErr } = await supabase
    .from('clubs')
    .select('id, season_number, season_phase')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (clubErr || !club) {
    return { error: 'Nie znaleziono klubu.' };
  }

  const row = club as {
    id: string;
    season_number: number;
    season_phase: string;
  };

  if (row.season_phase !== 'offseason') {
    return { error: 'Sezon nie jest zamknięty.' };
  }

  const clubId = row.id;
  const nextSeason = Math.max(1, Math.trunc(row.season_number ?? 1)) + 1;

  const { error: delErr } = await supabase.from('fixtures').delete().eq('club_id', clubId);
  if (delErr) {
    return { error: 'Nie udało się wyczyścić terminarza.' };
  }

  const plan = planClubFixtures(clubId);
  const rows = plan.map((p) => ({
    club_id: clubId,
    matchday: p.matchday,
    competition: 'league',
    opponent_club_id: p.opponentClubId,
    is_home: p.isHome,
    status: p.status,
  }));

  const { error: insErr } = await supabase.from('fixtures').insert(rows as never);
  if (insErr) {
    return { error: 'Nie udało się zaplanować nowego sezonu.' };
  }

  const { error: updErr } = await supabase
    .from('clubs')
    .update({
      season_number: nextSeason,
      season_phase: 'in_season',
    } as never)
    .eq('id', clubId)
    .eq('season_phase', 'offseason');

  if (updErr) {
    return { error: 'Nie udało się otworzyć nowego sezonu.' };
  }

  // H-AGE / Sponsors / Board — Thin no-op (D83).
  onSeasonEnd(clubId);

  revalidatePath('/', 'layout');
  redirect('/hub');
}
