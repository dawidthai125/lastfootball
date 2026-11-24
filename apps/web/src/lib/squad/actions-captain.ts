'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';

export type CaptainState = { readonly error?: string; readonly ok?: boolean };

export async function setClubCaptain(
  _prev: CaptainState,
  formData: FormData,
): Promise<CaptainState> {
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
    .select('id')
    .eq('id', playerId)
    .eq('club_id', clubId)
    .is('departed_at', null)
    .maybeSingle();
  if (!player) return { error: 'Nie znaleziono zawodnika.' };
  const { error } = await supabase.rpc(
    'set_club_captain' as never,
    { p_club_id: clubId, p_player_id: playerId } as never,
  );
  if (error) return { error: 'Nie udało się wyznaczyć kapitana.' };
  revalidatePath('/squad');
  revalidatePath(`/players/${playerId}`);
  return { ok: true };
}
