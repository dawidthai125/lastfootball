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
import { archivedLastPlayed, laterOf } from '@/lib/fixtures/last-played';
import type { FixtureDto } from '@/lib/fixtures/types';
import { settleFixture } from '@/lib/fixtures/settle-fixture';
import {
  challengeBlockReason,
  humanDayBlockReason,
  matchdayBlockReason,
  warsawDateKey,
} from '@/lib/fixtures/matchday-gate';
import { applyMatchDevelopment } from '@/lib/squad/apply-match-development';
import { listClubPlayers } from '@/lib/squad/get-players';
import { resolveMatchBench } from '@/lib/squad/resolve-club-squad';
import { applyMatchSquadTruth, groupsFromSkill, matchWageDue } from '@/lib/squad/truth';
import { filterSeniorPlayers } from '@/lib/squad/types';
import {
  authoritativeHumanScore,
  humanDayBlock,
  humanMatchLineup,
} from '@/lib/league/human-league-store';
import { authoritativeManagerScore } from '@/lib/match/authoritative-score';
import { leftDuringMatch } from '@/lib/match/kickoff-snapshot';
import { clearKickoffs, loadKickoff } from '@/lib/match/kickoff-store';
import { kickoffDay } from '@/lib/match/kickoff-day';
import { incidentsById, toStoredPlayers, type MatchPlayerLine } from '@/lib/match/match-players';
import { continuesLog, parseManagerLog } from '@/lib/match/manager-commands';
import { tryAdminClient } from '@/lib/supabase/admin';
import { isCupFinal } from '@/lib/cup/matchdays';
import { closeSeasonIfComplete } from '@/lib/season/close-season';
import { createClient } from '@/lib/supabase/server';
import { payFirstSponsorBase } from '@/lib/sponsors/pay-due';
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
    .select('id, league_tier, season_number')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (clubErr || !club) {
    return { error: 'Nie znaleziono klubu.' };
  }

  const clubRow = club as {
    id: string;
    league_tier: string | null;
    season_number: number | null;
  };
  const clubId = clubRow.id;

  const { data: fixture, error: loadErr } = await supabase
    .from('fixtures')
    .select(
      'id, club_id, matchday, status, is_home, competition, home_score, away_score, played_at',
    )
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
    played_at: string | null;
  };
  const admin = tryAdminClient();
  if (!admin) return { error: 'Zapis wyniku nie jest skonfigurowany na serwerze.' };

  const today = kickoffDay(formData.get('startedOn'));
  // A repeated save of a stored match counts the pauses as on the day it was played.
  const matchDay = warsawDateKey(
    row.status === 'played' && row.played_at ? new Date(row.played_at) : new Date(),
  );
  const players = await listClubPlayers(clubId, today, matchDay).catch(() => null);
  if (!players) return { error: 'Nie udało się odczytać kadry. Spróbuj ponownie.' };
  const build = await readClubBuild(supabase, clubId);
  if (build.readFailed) return { error: 'Nie udało się odczytać klubu. Spróbuj ponownie.' };
  const seniors = filterSeniorPlayers(players);
  // A challenge is a friendly: no wages and no academy upkeep (D141).
  const friendly = row.competition === 'challenge';
  const wageDue = friendly ? 0 : matchWageDue(seniors);

  const lookup = await loadKickoff(row.id, clubId);
  const kickoff = lookup.kind === 'found' ? lookup.snapshot : null;

  let score: { home: number; away: number };
  let lines: readonly MatchPlayerLine[] = [];
  let facts: readonly MatchPlayerLine[] = [];
  if (row.status === 'played' && row.home_score != null && row.away_score != null) {
    // A repeated save: the stored result stands, only unfinished steps run again.
    score = { home: row.home_score, away: row.away_score };
    // Cards and injuries of the stored match, for a development step that failed before.
    const again =
      row.competition === 'human'
        ? await authoritativeHumanScore(clubId, row.matchday)
        : kickoff
          ? await authoritativeManagerScore(row.id, players, managerLog, shape, today, kickoff)
          : null;
    if (again && !('error' in again)) facts = again.players;
  } else {
    const emailGate = await loadEmailGate(user.id);
    if (!emailGate.confirmed && row.competition === 'challenge') {
      return { error: 'Potwierdź email, żeby grać w rywalizacji.' };
    }
    if (emailGate.matchesBlocked) {
      return { error: 'Potwierdź email, żeby rozgrywać kolejne mecze.' };
    }

    if (row.competition === 'human') {
      const blocked = await humanDayBlock(clubId, new Date());
      if (blocked) return { error: blocked };
    } else {
      // League and cup share one Warsaw day. A challenge has its own (D141).
      const clock = row.competition === 'challenge' ? ['challenge'] : ['league', 'cup'];
      const { data: lastPlayed, error: lastErr } = await supabase
        .from('fixtures')
        .select('played_at')
        .eq('club_id', clubId)
        .eq('status', 'played')
        .in('competition', clock)
        .order('played_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const archive = await archivedLastPlayed(supabase, clubId);
      if (lastErr || !archive) {
        return { error: 'Nie udało się sprawdzić dnia meczu. Spróbuj ponownie.' };
      }
      const lastAt = laterOf(
        (lastPlayed as { played_at: string | null } | null)?.played_at ?? null,
        row.competition === 'challenge' ? archive.challenge : archive.match,
      );
      const blocked =
        row.competition === 'challenge'
          ? challengeBlockReason(lastAt, new Date())
          : matchdayBlockReason(lastAt, new Date());
      if (blocked) return { error: blocked };
    }
    if (row.status !== 'upcoming') return { error: 'Ten mecz nie jest jeszcze otwarty.' };

    if (row.competition !== 'human') {
      if (lookup.kind === 'error') {
        return { error: 'Nie udało się odczytać początku meczu. Spróbuj ponownie.' };
      }
      if (lookup.kind === 'expired') {
        return { error: 'Mecz trwał zbyt długo. Wejdź w mecz jeszcze raz.' };
      }
      if (lookup.kind === 'other') {
        return { error: 'Masz niedokończony inny mecz. Dokończ go najpierw.' };
      }
      if (lookup.kind === 'found' && !continuesLog(lookup.tick, lookup.log, managerLog)) {
        return { error: 'Ten mecz poszedł dalej w innym oknie. Wejdź w mecz jeszcze raz.' };
      }
      const gone = kickoff ? leftDuringMatch(kickoff, seniors) : null;
      if (gone) {
        return { error: `${gone} odszedł w trakcie meczu. Wejdź w mecz jeszcze raz.` };
      }
    }

    const scored =
      row.competition === 'human'
        ? await authoritativeHumanScore(clubId, row.matchday)
        : await authoritativeManagerScore(row.id, players, managerLog, shape, today, kickoff);
    if ('error' in scored) return scored;
    score = { home: scored.home, away: scored.away };
    lines = scored.players;
    facts = lines;
  }

  // A human match is played by the line-up frozen at its lock, not by the one set now.
  const frozen = row.competition === 'human' ? await humanMatchLineup(clubId, row.matchday) : null;
  if (frozen === 'error') return { error: 'Nie udało się odczytać składu. Spróbuj ponownie.' };

  const { home, away } = score;
  const ours = row.is_home ? home : away;
  const theirs = row.is_home ? away : home;
  const result = ours > theirs ? 'win' : ours < theirs ? 'loss' : 'draw';
  const reward = resolveFixtureReward({
    competition: row.competition,
    matchday: row.matchday,
    homeScore: home,
    awayScore: away,
    isHome: row.is_home,
    leagueTier: parseLeagueTier(clubRow.league_tier),
  });
  // Challenges are always at home and repeatable, and the cup final is neutral: no tickets.
  const ticketTake =
    row.is_home && row.competition !== 'challenge' && !isCupFinal(row)
      ? ticketIncome({
          standsLevel: build.levels.stands,
          attendance: home > away ? 'lively' : home < away ? 'quiet' : 'steady',
        })
      : 0;

  // Result, cash, ledger and the next fixture land together or not at all.
  const settlement = {
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
    ...(friendly ? { p_upkeep_by_level: [] } : {}),
  };
  const settled = await settleFixture(
    admin,
    settlement,
    toStoredPlayers(lines, row.is_home ? 'home' : 'away'),
  );
  if (settled === 'day_taken') {
    const reason = friendly
      ? challengeBlockReason
      : row.competition === 'human'
        ? humanDayBlockReason
        : matchdayBlockReason;
    const now = new Date();
    return { error: reason(now.toISOString(), now) ?? undefined };
  }
  if (!settled) {
    console.error('completeFixture: settlement failed', { fixtureId: row.id });
    return { error: 'Nie udało się rozliczyć meczu. Spróbuj ponownie.' };
  }

  // Idempotent by match key, so a repeated save finishes a development that failed before.
  // The players who started this match, even if the lineup changed while it was on.
  const played = kickoff && row.competition !== 'human' ? kickoff : null;
  const xiIds = played
    ? new Set(played.ourXi.map((p) => p.id))
    : frozen
      ? new Set(frozen.xi)
      : null;
  const benchIds = new Set(
    frozen?.bench ?? (played?.ourBench ?? resolveMatchBench(players)).map((p) => p.id),
  );
  const roleById: Record<string, 'xi' | 'bench' | 'out'> = {};
  for (const p of seniors) {
    const started = xiIds
      ? xiIds.has(p.id)
      : p.starter && p.status !== 'INJURED' && p.status !== 'SUSPENDED';
    if (started) roleById[p.id] = 'xi';
    else if (benchIds.has(p.id)) roleById[p.id] = 'bench';
    else roleById[p.id] = 'out';
  }
  const moraleHit = unpaidWageMoraleDelta(wageDue, settled.paid);
  const starterIds = xiIds ?? new Set(players.filter((p) => p.starter).map((p) => p.id));
  const develop = async (squad: typeof players) => {
    const afterTruth = applyMatchSquadTruth(
      filterSeniorPlayers(squad).map((p) => ({
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
      { matchKey: row.id, result, roleById, physio: build.physio, incidents: incidentsById(facts) },
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
    return applyMatchDevelopment(supabase, {
      clubId,
      matchKey: row.id,
      // Growth goes to the players who played, not to a lineup changed meanwhile.
      activePlayers: squad.map((p) => ({ ...p, starter: starterIds.has(p.id) })),
      truthById,
      startedIds: new Set(Object.keys(roleById).filter((id) => roleById[id] === 'xi')),
    });
  };
  let dev = await develop(players);
  // Training or a transfer landed during the replay: once more on the squad as it is now.
  if (!dev.ok && dev.moved) {
    const again = await listClubPlayers(clubId, today, matchDay).catch(() => null);
    if (again) dev = await develop(again);
  }
  if (!dev.ok) {
    return { error: dev.error };
  }
  // Once per match, also when an earlier save stopped before the squad was written.
  if (!dev.skipped) await recordFanMood(clubId, result);
  await clearKickoffs(clubId, row.id);
  if (row.competition === 'league') {
    await payFirstSponsorBase(clubId, clubRow.season_number ?? 1);
  }

  // Season End Thin: after MD22 → Season Closed → OFFSEASON (D70 · D78).
  const fixtures = await listClubFixtures(clubId);
  await closeSeasonIfComplete(clubId, fixtures);
  // After the phase, which decides the window too (D152). Idempotent.
  await ensureTransferWindow(supabase, clubId);

  revalidatePath('/', 'layout');
  if (formData.get('stay') === '1') {
    return { saved: true, score };
  }
  redirect('/hub');
}
