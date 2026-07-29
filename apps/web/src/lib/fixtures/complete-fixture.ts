'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { env } from '@/config/env';
import { resolveLeagueMatchReward } from '@/lib/finance';
import type { CompleteFixtureState } from '@/lib/fixtures/action-types';
import { applyMatchDevelopment } from '@/lib/squad/apply-match-development';
import { listClubPlayers } from '@/lib/squad/get-players';
import { createClient } from '@/lib/supabase/server';
import { ensureTransferWindow } from '@/lib/transfers/ensure-window';

/**
 * Idempotent: mark fixture played with score, promote next scheduled → upcoming,
 * credit match reward once (LFE-ECONOMY-01), apply match development (LFE-PLAYERS-02).
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
    .select('id, cash_balance')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (clubErr || !club) {
    return { error: 'Nie znaleziono klubu.' };
  }

  const clubRow = club as { id: string; cash_balance: number };
  const clubId = clubRow.id;

  const { data: fixture, error: loadErr } = await supabase
    .from('fixtures')
    .select('id, club_id, matchday, status, is_home')
    .eq('id', fixtureId)
    .eq('club_id', clubId)
    .maybeSingle();

  if (loadErr || !fixture) {
    return { error: 'Nie znaleziono meczu.' };
  }

  const row = fixture as {
    id: string;
    club_id: string;
    matchday: number;
    status: string;
    is_home: boolean;
  };

  if (row.status !== 'played') {
    const players = await listClubPlayers(clubId);
    const dev = await applyMatchDevelopment(supabase, {
      clubId,
      matchKey: row.id,
      activePlayers: players,
    });
    if (!dev.ok) {
      return { error: dev.error };
    }

    const playedAt = new Date().toISOString();
    const home = Math.trunc(homeScore);
    const away = Math.trunc(awayScore);

    const { data: updated, error: updErr } = await supabase
      .from('fixtures')
      .update({
        status: 'played',
        home_score: home,
        away_score: away,
        played_at: playedAt,
      } as never)
      .eq('id', row.id)
      .eq('club_id', clubId)
      .neq('status', 'played')
      .select('id, is_home')
      .maybeSingle();

    if (updErr) {
      return { error: 'Nie udało się zapisać wyniku.' };
    }

    if (updated) {
      const isHome = (updated as { is_home: boolean }).is_home;
      const reward = resolveLeagueMatchReward({
        homeScore: home,
        awayScore: away,
        isHome,
      });
      const nextBalance = clubRow.cash_balance + reward.amount;

      const { error: cashErr } = await supabase
        .from('clubs')
        .update({ cash_balance: nextBalance } as never)
        .eq('id', clubId);

      if (!cashErr) {
        await supabase.from('finance_movements').insert({
          club_id: clubId,
          category: 'match_reward',
          label: reward.label,
          amount: reward.amount,
          fixture_id: row.id,
        } as never);
        // Unique on fixture_id → silently ignore duplicate reward on race.
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

      await ensureTransferWindow(supabase, clubId);
    }
  }

  // Also open window if already played earlier and threshold now met (idempotent).
  await ensureTransferWindow(supabase, clubId);

  revalidatePath('/', 'layout');
  redirect('/hub');
}
