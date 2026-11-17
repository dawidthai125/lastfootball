'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import type { CompleteFirstMatchState } from '@/lib/first-match/action-types';
import { FIRST_MATCH_PATHS } from '@/lib/first-match/constants';
import { clubHomeResult } from '@/lib/first-match/result';
import { ensureClubFixtures } from '@/lib/fixtures/ensure-club-fixtures';
import { env } from '@/config/env';
import { applyMatchDevelopment } from '@/lib/squad/apply-match-development';
import { listClubPlayers } from '@/lib/squad/get-players';
import { resolveMatchBench } from '@/lib/squad/resolve-club-squad';
import { readClubBuild } from '@/lib/club/read-build';
import { isPersonality } from '@/lib/squad/depth';
import { applyMatchSquadTruth, groupsFromSkill } from '@/lib/squad/truth';
import { filterSeniorPlayers } from '@/lib/squad/types';
import { createClient } from '@/lib/supabase/server';

/**
 * Idempotent SSOT write: match development + clubs.first_match_completed_at once, then Welcome.
 */
export async function completeFirstMatch(
  _prev: CompleteFirstMatchState,
  formData: FormData,
): Promise<CompleteFirstMatchState> {
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

  const { data: club, error: loadErr } = await supabase
    .from('clubs')
    .select('id, first_match_completed_at')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (loadErr || !club) {
    return { error: 'Nie znaleziono klubu.' };
  }

  const row = club as { id: string; first_match_completed_at: string | null };

  if (!row.first_match_completed_at) {
    const homeRaw = formData.get('homeScore');
    const awayRaw = formData.get('awayScore');
    const home = typeof homeRaw === 'string' && homeRaw !== '' ? Number(homeRaw) : Number.NaN;
    const away = typeof awayRaw === 'string' && awayRaw !== '' ? Number(awayRaw) : Number.NaN;
    const result = clubHomeResult(home, away);
    if (!result) {
      return { error: 'Brak wyniku meczu.' };
    }

    const players = await listClubPlayers(row.id);
    const build = await readClubBuild(supabase, row.id);
    const seniors = filterSeniorPlayers(players);
    const benchIds = new Set(resolveMatchBench(players).map((p) => p.id));
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
      { matchKey: 'first-match', result, roleById, physio: build.physio },
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
      clubId: row.id,
      matchKey: 'first-match',
      activePlayers: players,
      truthById,
    });
    if (!dev.ok) {
      return { error: dev.error };
    }

    const { error: updErr } = await supabase
      .from('clubs')
      .update({ first_match_completed_at: new Date().toISOString() } as never)
      .eq('id', row.id)
      .is('first_match_completed_at', null);

    if (updErr) {
      return { error: 'Nie udało się zapisać ukończenia meczu.' };
    }
  }

  revalidatePath('/', 'layout');

  // LFE-LEAGUE-01: seed Thin A fixtures after Hub unlock (idempotent).
  await ensureClubFixtures(row.id);

  redirect(FIRST_MATCH_PATHS.welcome);
}
