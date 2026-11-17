'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';

export type SetPieceState = { readonly error?: string; readonly ok?: boolean };

export async function setClubSetPiece(
  _prev: SetPieceState,
  formData: FormData,
): Promise<SetPieceState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const playerId = String(formData.get('playerId') ?? '');
  if (!playerId) return { error: 'Nie wybrano zawodnika.' };
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
  const { data: player } = await supabase
    .from('players')
    .select('id, pos')
    .eq('id', playerId)
    .eq('club_id', clubId)
    .is('departed_at', null)
    .maybeSingle();
  const row = player as { pos: string } | null;
  if (!row) return { error: 'Nie znaleziono zawodnika.' };
  if (row.pos === 'BR') return { error: 'Bramkarz nie bierze rzutów rożnych.' };
  await supabase
    .from('players')
    .update({ set_piece: false } as never)
    .eq('club_id', clubId)
    .eq('set_piece', true);
  const { error } = await supabase
    .from('players')
    .update({ set_piece: true } as never)
    .eq('id', playerId)
    .eq('club_id', clubId);
  if (error) return { error: 'Nie udało się wyznaczyć wykonawcy.' };
  revalidatePath('/squad');
  revalidatePath(`/players/${playerId}`);
  return { ok: true };
}
