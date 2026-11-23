'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { env } from '@/config/env';
import { loadEmailGate } from '@/lib/auth/email-confirm';
import { readClubBuild } from '@/lib/club/read-build';
import { recordFanMood } from '@/lib/club/record-fan-mood';
import { isPersonality, nextMorale } from '@/lib/squad/depth';
import { resolveFixtureReward } from '@/lib/finance';
import { unpaidWageMoraleDelta, wagesMovementLabel } from '@/lib/finance/unpaid-wages';
import { parseLeagueTier } from '@/lib/league/league-tier';
import { ticketIncome } from '@/lib/stadium/levels';
import type { CompleteFixtureState } from '@/lib/fixtures/action-types';
import { listClubFixtures } from '@/lib/fixtures/get-fixture';
import type { FixtureDto } from '@/lib/fixtures/types';
import { matchdayBlockReason } from '@/lib/fixtures/matchday-gate';
import { applyMatchDevelopment } from '@/lib/squad/apply-match-development';
import { listClubPlayers } from '@/lib/squad/get-players';
import { resolveMatchBench } from '@/lib/squad/resolve-club-squad';
import { applyMatchSquadTruth, groupsFromSkill, matchWageDue, payWages } from '@/lib/squad/truth';
import { filterSeniorPlayers } from '@/lib/squad/types';
import { authoritativeHumanScore } from '@/lib/league/human-league-store';
import { settleClubCash } from '@/lib/finance/club-cash';
import { authoritativeManagerScore } from '@/lib/match/authoritative-score';
import { parseManagerLog } from '@/lib/match/manager-commands';
import { createAdminClient } from '@/lib/supabase/admin';
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
  // D127: no score from the browser. Decisions are replayed below.
  const managerLog = parseManagerLog(formData.get('managerLog'));
  const shape = formData.get('shape');

  if (!fixtureId) {
    return { error: 'Brak meczu.' };
  }
  if (!managerLog) {
    return { error: 'Nie da się odtworzyć decyzji z meczu. Wejdź w mecz jeszcze raz.' };
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
    .select('id, league_tier')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (clubErr || !club) {
    return { error: 'Nie znaleziono klubu.' };
  }

  const clubRow = club as { id: string; league_tier: string | null };
  const clubId = clubRow.id;

  const { data: fixture, error: loadErr } = await supabase
    .from('fixtures')
    .select('id, club_id, matchday, status, is_home, competition, home_score, away_score')
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
    competition: FixtureDto['competition'];
    home_score: number | null;
    away_score: number | null;
  };
  const admin = createAdminClient();
  let official =
    row.home_score != null && row.away_score != null
      ? { home: row.home_score, away: row.away_score }
      : null;

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
    const build = await readClubBuild(supabase, clubId);
    const seniors = filterSeniorPlayers(players);
    const benchIds = new Set(resolveMatchBench(players).map((p) => p.id));
    if (row.status !== 'upcoming') return { error: 'Ten mecz nie jest jeszcze otwarty.' };
    const scored =
      row.competition === 'human'
        ? await authoritativeHumanScore(clubId, row.matchday)
        : await authoritativeManagerScore(row.id, players, managerLog, shape);
    if ('error' in scored) return scored;
    const { home, away } = scored;
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
        injuryMatches: p.injuryMatches ?? 0,
        morale: p.morale ?? 60,
        personality: isPersonality(p.personality) ? p.personality : 'spokojny',
      })),
      { matchKey: row.id, result, roleById, physio: build.physio },
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
          injuryMatches: p.injuryMatches,
          recentRatings: p.recentRatings,
          morale: p.morale,
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

    const { data: updated, error: updErr } = await admin
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
      official = { home, away };
      const playedHome = (updated as { is_home: boolean }).is_home;
      const reward = resolveFixtureReward({
        competition: row.competition,
        homeScore: home,
        awayScore: away,
        isHome: playedHome,
        leagueTier: parseLeagueTier(clubRow.league_tier),
      });
      const build = await readClubBuild(supabase, clubId);
      // Challenges are always at home and repeatable, so they sell no tickets.
      const ticketTake =
        playedHome && row.competition !== 'challenge'
          ? ticketIncome({
              standsLevel: build.levels.stands,
              attendance: home > away ? 'lively' : home < away ? 'quiet' : 'steady',
            })
          : 0;
      const wageDue = matchWageDue(seniors);
      const income = (reward?.amount ?? 0) + ticketTake;
      const settled = await settleClubCash(clubId, (cash) => payWages(cash + income, wageDue));
      if (!settled) {
        // Not paid means not played: reopen, so the next save settles it once.
        await admin
          .from('fixtures')
          .update({ status: 'upcoming', home_score: null, away_score: null, played_at: null })
          .eq('id', row.id)
          .eq('club_id', clubId);
        console.error('completeFixture: settlement not saved', { fixtureId: row.id });
        return { error: 'Nie udało się rozliczyć meczu. Wejdź w mecz jeszcze raz.' };
      }
      const moraleHit = unpaidWageMoraleDelta(wageDue, settled.paid);

      if (reward) {
        await supabase.from('finance_movements').insert({
          club_id: clubId,
          category: 'match_reward',
          label: reward.label,
          amount: reward.amount,
          fixture_id: row.id,
        } as never);
      }
      if (wageDue > 0) {
        await supabase.from('finance_movements').insert({
          club_id: clubId,
          category: 'wages',
          label: wagesMovementLabel(wageDue - settled.paid),
          amount: settled.paid > 0 ? -settled.paid : 0,
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
      if (moraleHit < 0) {
        // Read back: the development step above already stored this match's morale.
        const { data: moods } = await supabase
          .from('players')
          .select('id, morale')
          .eq('club_id', clubId)
          .in(
            'id',
            seniors.map((player) => player.id),
          );
        const hits = await Promise.all(
          ((moods ?? []) as { id: string; morale: number | null }[]).map((mood) =>
            supabase
              .from('players')
              .update({ morale: nextMorale(mood.morale ?? 60, moraleHit) } as never)
              .eq('id', mood.id)
              .eq('club_id', clubId),
          ),
        );
        if (hits.length < seniors.length || hits.some((hit) => hit.error)) {
          console.error('completeFixture: unpaid-wage morale incomplete', { fixtureId: row.id });
        }
      }

      const ours = playedHome ? home : away;
      const theirs = playedHome ? away : home;
      await recordFanMood(clubId, ours > theirs ? 'win' : ours < theirs ? 'loss' : 'draw');

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
          await admin
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

  if (row.competition === 'challenge' && official) {
    const playedAt = new Date().toISOString();
    const { error: challengeErr } = await admin
      .from('rival_challenges')
      .update({
        status: 'played',
        home_score: official.home,
        away_score: official.away,
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
  if (formData.get('stay') === '1') {
    return official ? { saved: true, score: official } : { saved: true };
  }
  redirect('/hub');
}
