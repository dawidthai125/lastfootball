'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';
import { countClubPlayedFixtures } from '@/lib/fixtures/count-played';
import { listClubPlayers } from '@/lib/squad/get-players';
import { completeTrainingSession } from '@/lib/training/complete-session';
import type { TrainingActionState } from '@/lib/training/action-types';
import type { TrainingFocusId, TrainingIntensityId } from '@/lib/training/types';

const FOCUS_IDS = new Set<TrainingFocusId>(['tactics', 'technique', 'physical', 'regeneration']);
const INTENSITY_IDS = new Set<TrainingIntensityId>(['light', 'normal', 'high']);

function asFocus(raw: string): TrainingFocusId | null {
  return FOCUS_IDS.has(raw as TrainingFocusId) ? (raw as TrainingFocusId) : null;
}

function asIntensity(raw: string): TrainingIntensityId | null {
  return INTENSITY_IDS.has(raw as TrainingIntensityId) ? (raw as TrainingIntensityId) : null;
}

export async function runTrainingSession(
  _prev: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const focusId = asFocus(String(formData.get('focusId') ?? ''));
  const intensityId = asIntensity(String(formData.get('intensityId') ?? ''));
  if (!focusId || !intensityId) {
    return { error: 'Nieprawidłowy fokus lub intensywność.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesja wygasła.' };

  const { data: club, error: clubErr } = await supabase
    .from('clubs')
    .select('id, last_training_on')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (clubErr || !club) return { error: 'Nie znaleziono klubu.' };

  const clubRow = club as { id: string; last_training_on: string | null };
  const playedCount = await countClubPlayedFixtures(supabase, clubRow.id);
  const activePlayers = await listClubPlayers(clubRow.id);

  const result = await completeTrainingSession(supabase, {
    clubId: clubRow.id,
    lastTrainingOn: clubRow.last_training_on,
    playedCount,
    activePlayers,
    focusId,
    intensityId,
  });

  if (!result.ok) return { error: result.error };

  revalidatePath('/training');
  revalidatePath('/squad');
  revalidatePath('/hub');

  return { ok: true, skipped: result.skipped };
}
