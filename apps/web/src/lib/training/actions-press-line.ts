'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { isPressLine } from '@/lib/training/press-line';
import { createClient } from '@/lib/supabase/server';

export type PressLineState = { readonly error?: string; readonly ok?: boolean };

export async function savePressLine(
  _prev: PressLineState,
  formData: FormData,
): Promise<PressLineState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const line = String(formData.get('line') ?? '');
  if (!isPressLine(line)) return { error: 'Wybierz linię pressingu.' };
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
  const { error } = await supabase
    .from('clubs')
    .update({ press_line: line } as never)
    .eq('id', clubId);
  if (error) return { error: 'Nie udało się zapisać linii pressingu.' };
  revalidatePath('/training');
  return { ok: true };
}
