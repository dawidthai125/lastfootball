'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { env } from '@/config/env';
import { loadEmailGate } from '@/lib/auth/email-confirm';
import { readClubBuild } from '@/lib/club/read-build';
import { resolveLeagueMatchReward } from '@/lib/finance';
import { ticketIncome } from '@/lib/stadium/levels';
import type { CompleteFixtureState } from '@/lib/fixtures/action-types';
import { listClubFixtures } from '@/lib/fixtures/get-fixture';
import { matchdayBlockReason } from '@/lib/fixtures/matchday-gate';
import { applyMatchDevelopment } from '@/lib/squad/apply-match-development';
import { listClubPlayers } from '@/lib/squad/get-players';
import { resolveMatchBench } from '@/lib/squad/resolve-club-squad';
import {
  applyMatchSquadTruth,
  groupsFromSkill,
  payWages,
  wageFromSkill,
  weeklyMatchWage,
} from '@/lib/squad/truth';
import { filterSeniorPlayers } from '@/lib/squad/types';
import { authoritativeHumanScore } from '@/lib/league/human-league-store';
import { closeSeasonIfComplete } from '@/lib/season/close-season';
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
    .select('id, club_id, matchday, status, is_home, competition')
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
    competition: string;
  };

  if (row.status !== 'played') {
    const emailGate = await loadEmailGate(user.id);
    if (!emailGate.confirmed && row.competition === 'challenge') {
      return { error: 'Potwierdź email, żeby grać w rywalizacji.' };
    }
    if (emailGate.matchesBlocked) {
      return { error: 'Potwierdź email, żeby rozgrywać kolejne mecze.' };
    }

    const { data: lastPlayed } = await supabase
      .from('fixtures')
      .select('played_at')
      .eq('club_id', clubId)
      .eq('status', 'played')
      .order('played_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const lastAt = (lastPlayed as { played_at: string | null } | null)?.played_at ?? null;
    if (row.competition !== 'human') {
      const blocked = matchdayBlockReason(lastAt, new Date());
      if (blocked) return { error: blocked };
    }

    const players = await listClubPlayers(clubId);
    const seniors = filterSeniorPlayers(players);
    const benchIds = new Set(resolveMatchBench(players).map((p) => p.id));
    let home = Math.trunc(homeScore);
    let away = Math.trunc(awayScore);
    if (row.competition === 'human') {
      const official = await authoritativeHumanScore(clubId, row.matchday);
      if ('error' in official) return official;
      home = official.home;
      away = official.away;
    }
    const ours = row.is_home ? home : away;
    const theirs = row.is_home ? away : home;
    const result = ours > theirs ? 'win' : ours < theirs ? 'loss' : 'draw';
    const roleById: Record<string, 'xi' | 'bench' | 'out'> = {};
    for (const p of seniors) {
      if (p.starter && p.status !== 'INJURED' && p.status !== 'SUSPENDED') roleById[p.id] = 'xi';
      else if (benchIds.has(p.id)) roleById[p.id] = 'bench';
      else roleById[p.id] = 'out';
    }
    const afterTruth = applyMatchSquadTruth(
      seniors.map((p) => ({
        id: p.id,
        pos: p.pos,
        status: p.status,
        skill: p.skill,
        potential: p.potential,
        groups: p.groups ?? groupsFromSkill(p.skill),
        energy: p.energy ?? 80,
        form: p.form ?? 60,
        recentRatings: p.recentRatings ?? [],
        suspensionMatches: p.suspensionMatches ?? 0,
      })),
      { matchKey: row.id, result, roleById },
    );
    const truthById = Object.fromEntries(
      afterTruth.map((p) => [
        p.id,
        {
          status: p.status,
          groups: p.groups,
          energy: p.energy,
          form: p.form,
          suspensionMatches: p.suspensionMatches,
          recentRatings: p.recentRatings,
        },
      ]),
    );
    const dev = await applyMatchDevelopment(supabase, {
      clubId,
      matchKey: row.id,
      activePlayers: players,
      truthById,
    });
    if (!dev.ok) {
      return { error: dev.error };
    }

    const playedAt = new Date().toISOString();

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
      let nextBalance = clubRow.cash_balance;
      const playedHome = (updated as { is_home: boolean }).is_home;
      const reward =
        row.competition === 'league' || row.competition === 'human'
          ? resolveLeagueMatchReward({
              homeScore: home,
              awayScore: away,
              isHome: playedHome,
            })
          : null;
      if (reward) nextBalance += reward.amount;
      const build = await readClubBuild(supabase, clubId);
      const ticketTake = playedHome
        ? ticketIncome({
            standsLevel: build.levels.stands,
            attendance: home > away ? 'lively' : home < away ? 'quiet' : 'steady',
          })
        : 0;
      nextBalance += ticketTake;
      const wagesKnown = seniors.some((player) => typeof player.wage === 'number');
      const bill = wagesKnown
        ? seniors.reduce(
            (sum, player) =>
              sum +
              (typeof player.wage === 'number'
                ? player.wage
                : wageFromSkill(player.skill, player.age)),
            0,
          )
        : 0;
      const paid = payWages(nextBalance, weeklyMatchWage(bill));
      nextBalance = paid.nextCash;

      const { error: cashErr } = await supabase
        .from('clubs')
        .update({ cash_balance: nextBalance } as never)
        .eq('id', clubId);

      if (!cashErr) {
        if (reward) {
          await supabase.from('finance_movements').insert({
            club_id: clubId,
            category: 'match_reward',
            label: reward.label,
            amount: reward.amount,
            fixture_id: row.id,
          } as never);
        }
        if (paid.paid > 0) {
          await supabase.from('finance_movements').insert({
            club_id: clubId,
            category: 'wages',
            label: 'Pensje kolejki',
            amount: -paid.paid,
            fixture_id: row.id,
          } as never);
        }
        if (ticketTake > 0) {
          await supabase.from('finance_movements').insert({
            club_id: clubId,
            category: 'ticket_income',
            label: 'Bilety',
            amount: ticketTake,
            fixture_id: row.id,
          } as never);
        }
      }

      if (row.competition === 'league') {
        const { data: next } = await supabase
          .from('fixtures')
          .select('id')
          .eq('club_id', clubId)
          .eq('competition', 'league')
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
  }

  if (row.competition === 'challenge') {
    const playedAt = new Date().toISOString();
    const { error: challengeErr } = await supabase
      .from('rival_challenges')
      .update({
        status: 'played',
        home_score: Math.trunc(homeScore),
        away_score: Math.trunc(awayScore),
        played_at: playedAt,
      } as never)
      .eq('fixture_id', row.id)
      .eq('challenger_club_id', clubId);
    if (challengeErr) {
      return { error: 'Wynik jest zapisany, ale nie doszedł do rywala.' };
    }
  }

  // Also open window if already played earlier and threshold now met (idempotent).
  await ensureTransferWindow(supabase, clubId);

  // Season End Thin: after MD22 → Season Closed → OFFSEASON (D70 · D78).
  const fixtures = await listClubFixtures(clubId);
  await closeSeasonIfComplete(clubId, fixtures);

  revalidatePath('/', 'layout');
  redirect('/hub');
}
