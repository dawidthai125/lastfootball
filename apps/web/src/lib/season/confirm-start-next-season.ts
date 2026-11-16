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
import { buildAcademyIntakeDraft } from '@/lib/academy/intake';
import { renewSponsorAndPayBase } from '@/lib/sponsors/actions';
import { sponsorFromCrowd } from '@/lib/sponsors/crowd';
import { listClubPlayers } from '@/lib/squad/get-players';
import type { PlayerRowDto } from '@/lib/squad/types';
import { createClient } from '@/lib/supabase/server';
import { listClubFixtures } from '@/lib/fixtures/get-fixture';
import { planSeasonDeparture } from '@/lib/season/departure';
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
    .select(
      'id, name, short_name, season_number, season_phase, league_tier, cash_balance, season_goal_paid_for, season_goal_note',
    )
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
    season_goal_paid_for: number | null;
    season_goal_note: string | null;
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
    return { error: sponsor.error };
  }

  const endedSeason = Math.max(1, Math.trunc(row.season_number ?? 1));
  const settlement = settleSeasonGoal({
    position: playerRow?.position ?? null,
    rowCount: table.rows.length,
    endedSeason,
    paidFor: row.season_goal_paid_for,
    note: row.season_goal_note,
  });
  const goalBonus = settlement.bonus;
  const goalNote = settlement.note;
  const nextCash = sponsor.nextCash + goalBonus;

  if (row.season_goal_paid_for !== endedSeason) {
    const { data: settledRows, error: goalErr } = await supabase
      .from('clubs')
      .update({
        cash_balance: nextCash,
        season_goal_paid_for: endedSeason,
        season_goal_note: goalNote,
      } as never)
      .eq('id', clubId)
      .eq('season_phase', 'offseason')
      .select('id');
    if (goalErr || !settledRows || settledRows.length === 0) {
      return { error: 'Nie udało się zapisać celu sezonu.' };
    }
    if (goalBonus > 0) {
      await supabase.from('finance_movements').insert({
        club_id: clubId,
        category: 'season_goal',
        label: 'Cel sezonu · górna połowa',
        amount: goalBonus,
      } as never);
    }
  }

  const { error: delErr } = await supabase.from('fixtures').delete().eq('club_id', clubId);
  if (delErr) {
    return { error: 'Nie udało się wyczyścić terminarza.' };
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

  const departure = await applySeasonDeparture(supabase, clubId, endedSeason);
  if (!departure.ok) {
    await revertSeasonTransitionHAge(clubId, hAgePort, hAge.snapshot);
    return { error: departure.error };
  }

  const { data: opened, error: updErr } = await supabase
    .from('clubs')
    .update({
      season_number: nextSeason,
      season_phase: 'in_season',
      league_tier: nextTier,
      cash_balance: nextCash,
      season_goal_paid_for: endedSeason,
      season_goal_note: goalNote,
    } as never)
    .eq('id', clubId)
    .eq('season_phase', 'offseason')
    .select('id');

  if (updErr || !opened || opened.length === 0) {
    await revertSeasonTransitionHAge(clubId, hAgePort, hAge.snapshot);
    return { error: 'Nie udało się otworzyć nowego sezonu.' };
  }

  revalidatePath('/', 'layout');
  redirect('/hub');
}

async function applySeasonDeparture(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clubId: string,
  seasonNumber: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const roster = await listClubPlayers(clubId);
  const plan = planSeasonDeparture(
    roster.map((player) => ({
      id: player.id,
      age: player.age,
      skill: player.skill,
      academyTrack: Boolean(player.academyTrack),
      departed: player.departedAt != null || player.status === 'DEPARTED',
    })),
  );
  if (!plan.retireId) return { ok: true };

  const retiree = roster.find((player) => player.id === plan.retireId);
  const now = new Date().toISOString();
  const { error: leaveErr } = await supabase
    .from('players')
    .update({ status: 'DEPARTED', departed_at: now, starter: false } as never)
    .eq('id', plan.retireId)
    .eq('club_id', clubId)
    .is('departed_at', null);
  if (leaveErr) return { ok: false, error: 'Nie udało się zakończyć kariery zawodnika.' };

  const restoreRetiree = async () => {
    if (!retiree) return;
    await supabase
      .from('players')
      .update({
        status: retiree.status,
        departed_at: null,
        starter: retiree.starter,
      } as never)
      .eq('id', retiree.id)
      .eq('club_id', clubId);
  };

  if (plan.promoteId) {
    const { error: promoteErr } = await supabase
      .from('players')
      .update({
        academy_track: false,
        promoted_at: now,
        starter: false,
        transfer_listed_at: null,
      } as never)
      .eq('id', plan.promoteId)
      .eq('club_id', clubId)
      .eq('academy_track', true)
      .is('departed_at', null);
    if (promoteErr) {
      await restoreRetiree();
      return { ok: false, error: 'Nie udało się wprowadzić zawodnika z akademii.' };
    }
    return { ok: true };
  }

  const { data: shirtRows, error: shirtErr } = await supabase
    .from('players')
    .select('shirt_number')
    .eq('club_id', clubId);
  if (shirtErr || !shirtRows) {
    await restoreRetiree();
    return { ok: false, error: 'Nie udało się uzupełnić kadry.' };
  }
  const seen = new Set(roster.map((player) => player.shirtNumber));
  const blockers: PlayerRowDto[] = (shirtRows as { shirt_number: number | null }[])
    .map((shirt) => shirt.shirt_number)
    .filter((shirt): shirt is number => typeof shirt === 'number' && !seen.has(shirt))
    .map((shirt) => ({
      id: `shirt-${shirt}`,
      clubId,
      name: 'Numer',
      shirtNumber: shirt,
      pos: 'N',
      role: 'ST',
      starter: false,
      captain: false,
      age: 20,
      skill: 40,
      potential: 40,
      status: 'READY',
      nationality: 'POL',
      version: 1,
      departedAt: null,
      transferListedAt: null,
      academyTrack: false,
      promotedAt: null,
    }));
  const draft = buildAcademyIntakeDraft(clubId, [...roster, ...blockers], seasonNumber);
  if ('error' in draft) {
    await restoreRetiree();
    return { ok: false, error: draft.error };
  }
  const { error: insertErr } = await supabase.from('players').insert({
    id: draft.id,
    club_id: clubId,
    name: draft.name,
    shirt_number: draft.shirtNumber,
    pos: draft.pos,
    role: draft.role,
    starter: false,
    captain: false,
    age: draft.age,
    skill: draft.skill,
    potential: draft.potential,
    status: 'READY',
    nationality: 'POL',
    version: 1,
    academy_track: false,
    promoted_at: now,
    transfer_listed_at: null,
  } as never);
  if (insertErr) {
    await restoreRetiree();
    return { ok: false, error: 'Nie udało się uzupełnić kadry.' };
  }
  return { ok: true };
}
