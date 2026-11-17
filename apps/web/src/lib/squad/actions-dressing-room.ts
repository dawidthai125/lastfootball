'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { isPersonality } from '@/lib/squad/depth';
import {
  ignoreConflictMorale,
  mediateConflictMorale,
  resolveDressingConflict,
} from '@/lib/squad/dressing-room';
import { createClient } from '@/lib/supabase/server';

export type DressingState = { readonly error?: string; readonly ok?: boolean };

export async function settleDressingConflict(
  _prev: DressingState,
  formData: FormData,
): Promise<DressingState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const intent = String(formData.get('intent') ?? '');
  if (intent !== 'mediate' && intent !== 'ignore') {
    return { error: 'Wybierz rozmowę albo odpuszczenie.' };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesja wygasła.' };
  const { data: club } = await supabase
    .from('clubs')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();
  const clubId = (club as { id: string } | null)?.id;
  if (!clubId) return { error: 'Nie znaleziono klubu.' };
  const { data: players, error: readErr } = await supabase
    .from('players')
    .select('id, name, starter, morale, personality')
    .eq('club_id', clubId)
    .is('departed_at', null);
  if (readErr) return { error: 'Konflikt szatni nie jest jeszcze w bazie.' };
  const rows = (players as
    | {
        id: string;
        name: string;
        starter: boolean;
        morale: number | null;
        personality: string | null;
      }[]
    | null) ?? [];
  const conflict = resolveDressingConflict(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      starter: row.starter,
      morale: typeof row.morale === 'number' ? row.morale : 60,
      personality: isPersonality(row.personality) ? row.personality : 'spokojny',
    })),
  );
  if (!conflict) return { error: 'Nie ma konfliktu w szatni.' };
  const next =
    intent === 'mediate'
      ? mediateConflictMorale
      : ignoreConflictMorale;
  for (const id of [conflict.aId, conflict.bId]) {
    const row = rows.find((r) => r.id === id);
    const current = typeof row?.morale === 'number' ? row.morale : 60;
    const { error } = await supabase
      .from('players')
      .update({ morale: next(current) } as never)
      .eq('id', id)
      .eq('club_id', clubId);
    if (error) return { error: 'Nie udało się zapisać nastroju.' };
  }
  revalidatePath('/messages');
  revalidatePath('/squad');
  return { ok: true };
}
