'use server';

import { recordMovement } from '@/lib/finance/record-movement';
import { restedEnergy, restedStatus } from '@/lib/squad/rest';
import type { PlayerStatus } from '@/lib/squad/types';
import { serverDb, tryAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { readClubBuild } from '@/lib/club/read-build';
import { countClubPlayedFixtures } from '@/lib/fixtures/count-played';
import { hasPlayedUnlock, unlockPlayedCount, utcDateString } from '@/lib/fixtures/played-unlock';
import { TRAINING_THIN } from '@/lib/training/types';
import {
  hireOnce,
  individualStep,
  isPressTone,
  nextMorale,
  pressDelta,
  STAFF_FEE,
} from '@/lib/squad/depth';
import type { TrainingActionState } from '@/lib/training/action-types';
import { hireCoach, isCoachGroup } from '@/lib/training/coach';
import { CASH_STALE_ERROR, writeClubCash } from '@/lib/finance/club-cash';
import { createClient } from '@/lib/supabase/server';

const GROUP_COLUMN = {
  attack: 'attr_attack',
  passing: 'attr_passing',
  defense: 'attr_defense',
  physical: 'attr_physical',
  goalkeeping: 'attr_goalkeeping',
} as const;

const SESSION_TAKEN = 'Trening indywidualny na dziś wykonany.';

async function ownClub() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: 'Sesja wygasła.' as const };
  const { data: club, error } = await supabase
    .from('clubs')
    .select('id, cash_balance')
    .eq('owner_id', user.id)
    .maybeSingle();
  if (error || !club) return { supabase, error: 'Nie znaleziono klubu.' as const };
  return { supabase, club: club as { id: string; cash_balance: number } };
}

export async function hireClubPhysio(): Promise<TrainingActionState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const owned = await ownClub();
  if (!owned.club) return { error: owned.error };
  const build = await readClubBuild(owned.supabase, owned.club.id);
  if (build.readFailed) return { error: 'Nie udało się odczytać klubu. Spróbuj ponownie.' };
  const hired = hireOnce({ cash: owned.club.cash_balance, owned: build.physio });
  if (!hired.ok) return { error: 'Za mało środków na fizjoterapeutę.' };
  if (hired.fee === 0) return { ok: true };
  const written = await writeClubCash({
    clubId: owned.club.id,
    expected: owned.club.cash_balance,
    next: hired.cashAfter,
    extra: { physio: true },
  });
  if (written === 'stale') return { error: CASH_STALE_ERROR };
  if (written === 'error') return { error: 'Fizjoterapeuta nie jest jeszcze włączony.' };
  await recordMovement({
    club_id: owned.club.id,
    category: 'physio_hire',
    label: 'Fizjoterapeuta',
    amount: -hired.fee,
  });
  revalidatePath('/training');
  revalidatePath('/finance');
  return { ok: true };
}

export async function hireClubAssistant(
  _prev: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const owned = await ownClub();
  if (!owned.club) return { error: owned.error };
  const build = await readClubBuild(owned.supabase, owned.club.id);
  if (build.readFailed) return { error: 'Nie udało się odczytać klubu. Spróbuj ponownie.' };
  const hired = hireCoach({
    cash: owned.club.cash_balance,
    current: build.assistantGroup,
    next: String(formData.get('group') ?? ''),
  });
  if (!hired.ok) {
    return {
      error:
        hired.reason === 'cash'
          ? 'Za mało środków na asystenta.'
          : 'Wybierz jedną grupę atrybutów.',
    };
  }
  if (hired.fee === 0) return { ok: true };
  const written = await writeClubCash({
    clubId: owned.club.id,
    expected: owned.club.cash_balance,
    next: hired.cashAfter,
    extra: { assistant_group: hired.group },
  });
  if (written === 'stale') return { error: CASH_STALE_ERROR };
  if (written === 'error') return { error: 'Asystent nie jest jeszcze włączony.' };
  await recordMovement({
    club_id: owned.club.id,
    category: 'assistant_hire',
    label: 'Asystent trenera',
    amount: -STAFF_FEE,
  });
  revalidatePath('/training');
  revalidatePath('/finance');
  return { ok: true };
}

export async function runIndividualSession(
  _prev: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const owned = await ownClub();
  if (!owned.club) return { error: owned.error };
  const playerId = String(formData.get('playerId') ?? '');
  const group = String(formData.get('group') ?? '');
  if (!playerId || !isCoachGroup(group)) return { error: 'Wybierz zawodnika i grupę.' };
  const { data: player, error } = await owned.supabase
    .from('players')
    .select(
      'id, status, on_loan, energy, energy_on, potential, last_individual_on, attr_attack, attr_passing, attr_defense, attr_physical, attr_goalkeeping',
    )
    .eq('id', playerId)
    .eq('club_id', owned.club.id)
    .eq('academy_track', false)
    .is('departed_at', null)
    .maybeSingle();
  if (error || !player) return { error: 'Nie znaleziono zawodnika.' };
  const row = player as {
    status: PlayerStatus;
    on_loan: boolean | null;
    energy: number;
    energy_on: string | null;
    potential: number;
    last_individual_on: string | null;
    attr_attack: number;
    attr_passing: number;
    attr_defense: number;
    attr_physical: number;
    attr_goalkeeping: number;
  };
  if (row.on_loan === true) return { error: 'Ten zawodnik jest na wypożyczeniu.' };
  if (row.status === 'INJURED') return { error: 'Kontuzjowany nie trenuje.' };
  const { data: season } = await owned.supabase
    .from('clubs')
    .select('season_number')
    .eq('id', owned.club.id)
    .maybeSingle();
  const played = unlockPlayedCount(
    await countClubPlayedFixtures(owned.supabase, owned.club.id),
    (season as { season_number: number | null } | null)?.season_number ?? 1,
  );
  if (!hasPlayedUnlock(played, TRAINING_THIN.UNLOCK_AFTER_PLAYED)) {
    return { error: 'Trening nie jest jeszcze odblokowany.' };
  }
  const column = GROUP_COLUMN[group];
  const rested = restedEnergy(row.energy, row.energy_on, utcDateString());
  const step = individualStep({
    energy: rested,
    group: row[column],
    potential: row.potential,
    lastOn: row.last_individual_on,
    today: utcDateString(),
  });
  if (!step.ok) {
    return {
      error: step.reason === 'today' ? SESSION_TAKEN : 'Za mało energii.',
    };
  }
  if (row[column] >= row.potential) return { error: 'Ta grupa jest już na suficie zawodnika.' };
  const admin = tryAdminClient();
  if (!admin) return { error: 'Trening nie jest skonfigurowany na serwerze.' };
  const claim = await admin.rpc(
    'claim_individual_training' as never,
    { p_club_id: owned.club.id, p_player_id: playerId, p_today: utcDateString() } as never,
  );
  if (claim.error) return { error: 'Nie udało się zapisać treningu.' };
  if ((claim.data as unknown) !== true) return { error: SESSION_TAKEN };
  const { error: updErr } = await serverDb(owned.supabase)
    .from('players')
    .update({
      [column]: step.group,
      energy: step.energy,
      status: restedStatus(row.status, row.energy, rested),
    } as never)
    .eq('id', playerId)
    .eq('club_id', owned.club.id);
  if (updErr) {
    // Not trained means the session of the day is free again.
    await admin
      .from('players')
      .update({ last_individual_on: row.last_individual_on } as never)
      .eq('id', playerId)
      .eq('club_id', owned.club.id);
    return { error: 'Nie udało się zapisać treningu.' };
  }
  revalidatePath('/training');
  revalidatePath('/squad');
  return { ok: true };
}

export async function savePressTone(
  _prev: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const owned = await ownClub();
  if (!owned.club) return { error: owned.error };
  const fixtureId = String(formData.get('fixtureId') ?? '');
  const tone = formData.get('tone');
  if (!fixtureId || !isPressTone(tone)) return { error: 'Wybierz ton konferencji.' };
  // Only the last match: older ones without a conference do not add up.
  const { data: fixture, error } = await owned.supabase
    .from('fixtures')
    .select('id, press_tone')
    .eq('club_id', owned.club.id)
    .eq('status', 'played')
    .order('played_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const row = fixture as { id: string; press_tone: string | null } | null;
  if (error || !row || row.id !== fixtureId) return { error: 'Nie ma meczu do omówienia.' };
  if (row.press_tone) return { ok: true };
  const { data: marked, error: markErr } = await serverDb(owned.supabase)
    .from('fixtures')
    .update({ press_tone: tone } as never)
    .eq('id', fixtureId)
    .eq('club_id', owned.club.id)
    .is('press_tone', null)
    .select('id');
  if (markErr) return { error: 'Konferencja nie jest jeszcze włączona.' };
  // A second click that came at the same time changes nothing.
  if (!marked || (marked as unknown[]).length === 0) return { ok: true };
  const delta = pressDelta(tone);
  if (delta !== 0) {
    const { data: players } = await owned.supabase
      .from('players')
      .select('id, morale')
      .eq('club_id', owned.club.id)
      .is('departed_at', null);
    for (const player of (players ?? []) as { id: string; morale: number }[]) {
      await serverDb(owned.supabase)
        .from('players')
        .update({ morale: nextMorale(player.morale ?? 60, delta) } as never)
        .eq('id', player.id)
        .eq('club_id', owned.club.id);
    }
  }
  revalidatePath('/training');
  revalidatePath('/squad');
  return { ok: true };
}
