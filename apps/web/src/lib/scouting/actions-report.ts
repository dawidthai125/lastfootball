'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import type { ScoutingActionState } from '@/lib/scouting/types';
import { createClient } from '@/lib/supabase/server';

type ReportRpc = {
  ok?: boolean;
  already?: boolean;
  error?: string;
  label?: string;
};

/** Paid band only. The database computes the band and never returns the ceiling number. */
export async function buyScoutReport(
  _prev: ScoutingActionState,
  formData: FormData,
): Promise<ScoutingActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }
  const playerId = String(formData.get('playerId') ?? '').trim();
  if (!playerId) return { error: 'Brak zawodnika.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesja wygasła.' };

  const { data, error } = await supabase.rpc(
    'buy_scout_report' as never,
    { p_player_id: playerId } as never,
  );
  if (error) {
    return { error: 'Raport skauta nie jest jeszcze włączony.' };
  }
  const row = data as ReportRpc | null;
  if (!row?.ok || !row.label) {
    return { error: row?.error || 'Nie udało się kupić raportu.' };
  }

  revalidatePath('/scouting');
  revalidatePath('/academy');
  revalidatePath('/finance');
  return {
    ok: true,
    message: row.already ? `Raport już jest: ${row.label}` : `Pasmo: ${row.label}`,
  };
}
