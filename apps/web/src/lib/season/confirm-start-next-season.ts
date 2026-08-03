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
import {
  createHAgeSupabasePort,
  revertSeasonTransitionHAge,
  runSeasonTransitionHAge,
} from '@/lib/season/transition';
import { renewSponsorAndPayBase } from '@/lib/sponsors/actions';
import { createClient } from '@/lib/supabase/server';
import { listClubFixtures } from '@/lib/fixtures/get-fixture';

/**
 * Confirm N+1 (D82 · D85) — sole path into Season N+1.
 * Sole league_tier mutation (D90): derive outcome → applyLeagueTierOutcome → persist.
 * H-SPONSORS (D98 · D101): flat renew (manual Accept or auto) → base payout once.
 * Clears slate → planClubFixtures reseed (D80) → H-AGE (LFE-AGE-01) → season++ · in_season.
 * H-AGE = first Season Transition Pipeline step · sole age++ product path.
 * AI catalog unchanged (D92).
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
    .select('id, name, short_name, season_number, season_phase, league_tier, cash_balance')
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
    cash_balance: number;
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

  // H-SPONSORS: renew (Accept or auto — same flat Thin) → base payout once (Owner LOCK 2 · 8).
  const sponsor = await renewSponsorAndPayBase({
    clubId,
    nextSeason,
    currentCash: row.cash_balance ?? 0,
  });
  if (!sponsor.ok) {
    return { error: sponsor.error };
  }

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

  // H-AGE — Season Transition Pipeline step 1 (before in_season persist).
  const hAgePort = createHAgeSupabasePort(supabase);
  const hAge = await runSeasonTransitionHAge(clubId, hAgePort);
  if (!hAge.ok) {
    return { error: hAge.error };
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
    await revertSeasonTransitionHAge(clubId, hAgePort, hAge.snapshot);
    return { error: 'Nie udało się otworzyć nowego sezonu.' };
  }

  revalidatePath('/', 'layout');
  redirect('/hub');
}
