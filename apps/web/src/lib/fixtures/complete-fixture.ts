'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { env } from '@/config/env';
import { loadEmailGate } from '@/lib/auth/email-confirm';
import { readClubBuild } from '@/lib/club/read-build';
import { recordFanMood } from '@/lib/club/record-fan-mood';
import { isPersonality, nextMorale } from '@/lib/squad/depth';
import { resolveFixtureReward } from '@/lib/finance';
import { unpaidWageMoraleDelta, WAGES_LABEL, WAGES_SHORT_LABEL } from '@/lib/finance/unpaid-wages';
import { parseLeagueTier } from '@/lib/league/league-tier';
import { ticketIncome } from '@/lib/stadium/levels';
import type { CompleteFixtureState } from '@/lib/fixtures/action-types';
import { listClubFixtures } from '@/lib/fixtures/get-fixture';
import type { FixtureDto } from '@/lib/fixtures/types';
import { matchdayBlockReason } from '@/lib/fixtures/matchday-gate';
import { applyMatchDevelopment } from '@/lib/squad/apply-match-development';
import { listClubPlayers } from '@/lib/squad/get-players';
import { resolveMatchBench } from '@/lib/squad/resolve-club-squad';
import { applyMatchSquadTruth, groupsFromSkill, matchWageDue } from '@/lib/squad/truth';
import { filterSeniorPlayers } from '@/lib/squad/types';
import { authoritativeHumanScore } from '@/lib/league/human-league-store';
import { authoritativeManagerScore } from '@/lib/match/authoritative-score';
import { parseManagerLog } from '@/lib/match/manager-commands';
import { tryAdminClient } from '@/lib/supabase/admin';
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
  const admin = tryAdminClient();
  if (!admin) return { error: 'Zapis wyniku nie jest skonfigurowany na serwerze.' };

  const players = await listClubPlayers(clubId);
  const build = await readClubBuild(supabase, clubId);
  const seniors = filterSeniorPlayers(players);
  const wageDue = matchWageDue(seniors);

  let score: { home: number; away: number };
  if (row.status === 'played' && row.home_score != null && row.away_score != null) {
    // A repeated save: the stored result stands, only unfinished steps run again.
    score = { home: row.home_score, away: row.away_score };
  } else {
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
    if (row.status !== 'upcoming') return { error: 'Ten mecz nie jest jeszcze otwarty.' };

    const scored =
      row.competition === 'human'
        ? await authoritativeHumanScore(clubId, row.matchday)
        : await authoritativeManagerScore(row.id, players, managerLog, shape);
    if ('error' in scored) return scored;
    score = { home: scored.home, away: scored.away };
  }

  const { home, away } = score;
  const ours = row.is_home ? home : away;
  const theirs = row.is_home ? away : home;
  const result = ours > theirs ? 'win' : ours < theirs ? 'loss' : 'draw';
  const reward = resolveFixtureReward({
    competition: row.competition,
    homeScore: home,
    awayScore: away,
    isHome: row.is_home,
    leagueTier: parseLeagueTier(clubRow.league_tier),
  });
  // Challenges are always at home and repeatable, so they sell no tickets.
  const ticketTake =
    row.is_home && row.competition !== 'challenge'
      ? ticketIncome({
          standsLevel: build.levels.stands,
          attendance: home > away ? 'lively' : home < away ? 'quiet' : 'steady',
        })
      : 0;

  // Result, cash, ledger and the next fixture land together or not at all.
  const { data: settledRaw, error: settleErr } = await admin.rpc(
    'settle_fixture' as never,
    {
      p_fixture_id: row.id,
      p_club_id: clubId,
      p_home: home,
      p_away: away,
      p_reward: reward?.amount ?? 0,
      p_reward_label: reward?.label ?? '',
      p_tickets: ticketTake,
      p_wage_due: wageDue,
      p_wage_label: WAGES_LABEL,
      p_wage_short_label: WAGES_SHORT_LABEL,
    } as never,
  );
  const settled = settledRaw as { applied: boolean; paid: number } | null;
  if (settleErr || !settled) {
    console.error('completeFixture: settlement failed', { fixtureId: row.id });
    return { error: 'Nie udało się rozliczyć meczu. Spróbuj ponownie.' };
  }

  // Idempotent by match key, so a repeated save finishes a development that failed before.
  const benchIds = new Set(resolveMatchBench(players).map((p) => p.id));
  const roleById: Record<string, 'xi' | 'bench' | 'out'> = {};
  for (const p of seniors) {
    if (p.starter && p.status !== 'INJURED' && p.status !== 'SUSPENDED') roleById[p.id] = 'xi';
    else if (benchIds.has(p.id)) roleById[p.id] = 'bench';
    else roleById[p.id] = 'out';
  }
  const moraleHit = unpaidWageMoraleDelta(wageDue, settled.paid);
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
        morale:
          moraleHit < 0 && typeof p.morale === 'number'
            ? nextMorale(p.morale, moraleHit)
            : p.morale,
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
  if (settled.applied) await recordFanMood(clubId, result);

  // Also open window if already played earlier and threshold now met (idempotent).
  await ensureTransferWindow(supabase, clubId);

  // Season End Thin: after MD22 → Season Closed → OFFSEASON (D70 · D78).
  const fixtures = await listClubFixtures(clubId);
  await closeSeasonIfComplete(clubId, fixtures);

  revalidatePath('/', 'layout');
  if (formData.get('stay') === '1') {
    return { saved: true, score };
  }
  redirect('/hub');
}
