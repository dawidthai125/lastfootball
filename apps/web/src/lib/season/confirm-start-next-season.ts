'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { env } from '@/config/env';
import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
import {
  applyLeagueTierOutcome,
  parseLeagueTier,
  resolvePromotionOutcome,
} from '@/lib/league/league-tier';
import { resolveLeagueTable } from '@/lib/league/resolve-league-table';
import type { ConfirmStartNextSeasonState } from '@/lib/season/action-types';
import { onSeasonEnd } from '@/lib/squad/season-age';
import { createClient } from '@/lib/supabase/server';
import { listClubFixtures } from '@/lib/fixtures/get-fixture';

/**
 * Confirm N+1 (D82 · D85) — sole path into Season N+1.
 * Sole league_tier mutation (D90): derive outcome → applyLeagueTierOutcome → persist.
 * Clears slate → planClubFixtures reseed (D80) → season++ · in_season.
 * Hooks = no-op only (D83). AI catalog unchanged (D92).
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
    .select('id, name, short_name, season_number, season_phase, league_tier')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (clubErr || !club) {
    return { error: 'Nie znaleziono klubu.' };
  }

  const row = club as {
    id: string;
    name: string;
    short_name: string;
    season_number: number;
    season_phase: string;
    league_tier: string | null;
  };

  if (row.season_phase !== 'offseason') {
    return { error: 'Sezon nie jest zamknięty.' };
  }

  const clubId = row.id;
  const nextSeason = Math.max(1, Math.trunc(row.season_number ?? 1)) + 1;
  const currentTier = parseLeagueTier(row.league_tier);

  const fixtures = await listClubFixtures(clubId);
  const table = resolveLeagueTable(
    {
      id: clubId,
      name: row.name,
      shortName: row.short_name,
      leagueTier: currentTier,
      seasonNumber: row.season_number,
    },
    fixtures,
  );
  const playerRow = table.rows.find((r) => r.isPlayer);
  const outcome = playerRow
    ? resolvePromotionOutcome(playerRow.position, table.rows.length, currentTier)
    : { kind: 'stay' as const, label: '' };
  const nextTier = applyLeagueTierOutcome(currentTier, outcome.kind);

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
      league_tier: nextTier,
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
