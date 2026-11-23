'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
import {
  applyLeagueTierOutcome,
  parseLeagueTier,
  resolvePromotionOutcome,
} from '@/lib/league/league-tier';
import { resolveLeagueTable } from '@/lib/league/resolve-league-table';
import type { ConfirmStartNextSeasonState } from '@/lib/season/action-types';
import { createHAgeSupabasePort, runSeasonTransitionHAge } from '@/lib/season/transition';
import { renewSponsorAndPayBase } from '@/lib/sponsors/renew';
import { sponsorFromCrowd } from '@/lib/sponsors/crowd';
import { listClubPlayers } from '@/lib/squad/get-players';
import { creditClubCash } from '@/lib/finance/club-cash';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { listClubFixtures } from '@/lib/fixtures/get-fixture';
import { openNextSeasonAfterDeparture } from '@/lib/season/open-next-season';
import { settleSeasonGoal } from '@/lib/season/season-goal';

/**
 * Confirm N+1 (D82 · D85) — sole path into Season N+1.
 * Sole league_tier mutation (D90): derive outcome → applyLeagueTierOutcome → persist.
 * H-SPONSORS (D98 · D101): flat renew (manual Accept or auto) → base payout once.
 * Clears slate → planClubFixtures reseed (D80) → H-AGE (LFE-AGE-01) → season++ · in_season.
 * League world strength = club.leagueTier at MatchSession (LFE-LEAGUE-WORLD-02).
 * AI catalog names unchanged (Thin B); Match Engine / PUBLIC untouched.
 */
export async function confirmStartNextSeason(
  _prev: ConfirmStartNextSeasonState,
  _formData: FormData,
): Promise<ConfirmStartNextSeasonState> {
  void _formData;
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.', farewell: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesja wygasła. Zaloguj się ponownie.', farewell: null };
  }

  const { data: club, error: clubErr } = await supabase
    .from('clubs')
    .select(
      'id, name, short_name, season_number, season_phase, league_tier, cash_balance, season_goal_paid_for, season_goal_note',
    )
    .eq('owner_id', user.id)
    .maybeSingle();

  if (clubErr || !club) {
    return { error: 'Nie znaleziono klubu.', farewell: null };
  }

  const row = club as {
    id: string;
    name: string;
    short_name: string;
    season_number: number;
    season_phase: string;
    league_tier: string | null;
    cash_balance: number;
    season_goal_paid_for: number | null;
    season_goal_note: string | null;
  };

  if (row.season_phase !== 'offseason') {
    return { error: 'Sezon nie jest zamknięty.', farewell: null };
  }

  const clubId = row.id;
  const endedSeason = Math.max(1, Math.trunc(row.season_number ?? 1));
  const nextSeason = endedSeason + 1;
  const currentTier = parseLeagueTier(row.league_tier);

  const fixtures = await listClubFixtures(clubId);
  const table = resolveLeagueTable(
    {
      id: clubId,
      name: row.name,
      shortName: row.short_name,
      leagueTier: currentTier,
      seasonNumber: endedSeason,
    },
    fixtures,
  );
  const playerRow = table.rows.find((r) => r.isPlayer);
  const outcome = playerRow
    ? resolvePromotionOutcome(playerRow.position, table.rows.length, currentTier)
    : { kind: 'stay' as const, label: '' };
  const nextTier = applyLeagueTierOutcome(currentTier, outcome.kind);

  // H-SPONSORS: renew (Accept or auto — same flat Thin) → base payout once (Owner LOCK 2 · 8).
  const lastHome = fixtures
    .filter(
      (fixture) =>
        fixture.competition === 'league' &&
        fixture.isHome &&
        fixture.status === 'played' &&
        fixture.homeScore != null &&
        fixture.awayScore != null,
    )
    .sort((a, b) => (b.playedAt ?? '').localeCompare(a.playedAt ?? ''))[0];
  const attendance =
    lastHome == null || lastHome.homeScore == null || lastHome.awayScore == null
      ? 'unknown'
      : lastHome.homeScore > lastHome.awayScore
        ? 'lively'
        : lastHome.homeScore < lastHome.awayScore
          ? 'quiet'
          : 'steady';
  const quote = sponsorFromCrowd({ attendance, leagueTier: currentTier });
  const sponsor = await renewSponsorAndPayBase({
    clubId,
    nextSeason,
    currentCash: row.cash_balance ?? 0,
    quote,
  });
  if (!sponsor.ok) {
    return { error: sponsor.error, farewell: null };
  }

  const settlement = settleSeasonGoal({
    position: playerRow?.position ?? null,
    rowCount: table.rows.length,
    endedSeason,
    paidFor: row.season_goal_paid_for,
    note: row.season_goal_note,
  });
  // Same schema; the two factories only differ in generic defaults.
  const admin = createAdminClient() as unknown as typeof supabase;
  const goalBonus = settlement.bonus;
  const goalNote = settlement.note;

  if (row.season_goal_paid_for !== endedSeason) {
    // Mark first, then pay: a parallel confirm cannot pay the goal twice.
    const { data: settledRows, error: goalErr } = await admin
      .from('clubs')
      .update({ season_goal_paid_for: endedSeason, season_goal_note: goalNote } as never)
      .eq('id', clubId)
      .eq('season_phase', 'offseason')
      .or(`season_goal_paid_for.is.null,season_goal_paid_for.neq.${endedSeason}`)
      .select('id');
    if (goalErr || !settledRows) {
      return { error: 'Nie udało się zapisać celu sezonu.', farewell: null };
    }
    if (goalBonus > 0 && settledRows.length > 0) {
      if ((await creditClubCash(clubId, goalBonus)) == null) {
        await admin
          .from('clubs')
          .update({ season_goal_paid_for: row.season_goal_paid_for } as never)
          .eq('id', clubId)
          .eq('season_phase', 'offseason');
        return { error: 'Nie udało się wypłacić celu sezonu.', farewell: null };
      }
      await supabase.from('finance_movements').insert({
        club_id: clubId,
        category: 'season_goal',
        label: 'Cel sezonu · górna połowa',
        amount: goalBonus,
      } as never);
    }
  }

  const { error: delErr } = await admin.from('fixtures').delete().eq('club_id', clubId);
  if (delErr) {
    return { error: 'Nie udało się wyczyścić terminarza.', farewell: null };
  }

  const plan = planClubFixtures(clubId, nextTier);
  const rows = plan.map((p) => ({
    club_id: clubId,
    matchday: p.matchday,
    competition: 'league',
    opponent_club_id: p.opponentClubId,
    is_home: p.isHome,
    status: p.status,
  }));

  const { error: insErr } = await admin.from('fixtures').insert(rows as never);
  if (insErr) {
    return { error: 'Nie udało się zaplanować nowego sezonu.', farewell: null };
  }

  // H-AGE — Season Transition Pipeline step 1 (before in_season persist).
  const hAgePort = createHAgeSupabasePort(admin);
  const hAge = await runSeasonTransitionHAge(clubId, hAgePort);
  if (!hAge.ok) {
    return { error: hAge.error, farewell: null };
  }

  const openedSeason = await openNextSeasonAfterDeparture({
    supabase: admin,
    clubId,
    endedSeason,
    loadRoster: listClubPlayers,
    nextSeason,
    nextTier,
    goalNote,
    hAgePort,
    hAgeSnapshot: hAge.snapshot,
  });
  if (!openedSeason.ok) {
    return { error: openedSeason.error, farewell: null };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/hub');
  revalidatePath('/messages');
  // Return farewell DTO for useActionState banner — no redirect (keeps client state).
  return { error: null, farewell: openedSeason.farewell };
}
