'use server';

import { retryDeadlock } from '@/lib/supabase/retry-deadlock';
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
  const { error } = await retryDeadlock(() =>
    supabase.rpc(
      'set_club_set_piece' as never,
      { p_club_id: clubId, p_player_id: playerId } as never,
    ),
  );
  if (error) return { error: 'Nie udało się wyznaczyć wykonawcy.' };
  revalidatePath('/squad');
  revalidatePath(`/players/${playerId}`);
  return { ok: true };
}
