'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';
import { planShirtAssignment } from '@/lib/squad/assign-shirt';

export type AssignShirtState = {
  ok?: boolean;
  error?: string;
  swappedWith?: string;
};

export const ASSIGN_SHIRT_INITIAL: AssignShirtState = {};

export async function assignShirtNumber(
  _prev: AssignShirtState,
  formData: FormData,
): Promise<AssignShirtState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };

  const playerId = String(formData.get('playerId') ?? '').trim();
  const next = Number(formData.get('shirtNumber'));
  if (!playerId) return { error: 'Brak zawodnika.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesja wygasła.' };

  const { data: club, error: clubErr } = await supabase
    .from('clubs')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();
  if (clubErr || !club) return { error: 'Nie znaleziono klubu.' };
  const clubId = (club as { id: string }).id;

  const { data, error } = await supabase
    .from('players')
    .select('id, name, shirt_number')
    .eq('club_id', clubId);
  if (error || !data) return { error: 'Nie udało się odczytać kadry.' };

  const plan = planShirtAssignment(
    (data as { id: string; name: string; shirt_number: number }[]).map((row) => ({
      id: row.id,
      name: row.name,
      shirtNumber: row.shirt_number,
    })),
    playerId,
    next,
  );
  if (!plan.ok) {
    if (plan.reason === 'range') return { error: 'Numer musi być od 1 do 99.' };
    if (plan.reason === 'full') return { error: 'Wszystkie numery od 1 do 99 są zajęte.' };
    return { error: 'Ten zawodnik nie jest w Twojej kadrze.' };
  }

  for (const update of plan.updates) {
    const { error: writeErr } = await supabase
      .from('players')
      .update({ shirt_number: update.shirtNumber } as never)
      .eq('club_id', clubId)
      .eq('id', update.id);
    if (writeErr) return { error: 'Nie udało się zapisać numeru.' };
  }

  revalidatePath('/squad');
  revalidatePath(`/players/${playerId}`);
  return { ok: true, swappedWith: plan.swappedWith ?? undefined };
}
