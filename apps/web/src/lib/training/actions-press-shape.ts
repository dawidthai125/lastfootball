'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { isPressShape } from '@/lib/training/press-line';
import { createClient } from '@/lib/supabase/server';

export type PressShapeState = { readonly error?: string; readonly ok?: boolean };

export async function savePressShape(
  _prev: PressShapeState,
  formData: FormData,
): Promise<PressShapeState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const shape = String(formData.get('shape') ?? '');
  if (!isPressShape(shape)) return { error: 'Wybierz kształt pressingu.' };
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
    .update({ press_shape: shape } as never)
    .eq('id', clubId);
  if (error) return { error: 'Kształt pressingu nie jest jeszcze w bazie.' };
  revalidatePath('/training');
  return { ok: true };
}
