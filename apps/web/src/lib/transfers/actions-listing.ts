'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';
import { listClubPlayers } from '@/lib/squad/get-players';
import type { TransferActionState } from '@/lib/transfers/action-types';
import { isTransferSellEligible } from '@/lib/transfers/sell-eligibility';

/**
 * List / Unlist player on transfer list (LFE-TRANSFERS-04).
 * Idempotent. List requires sell eligibility; Unlist clears listed flag (no window required).
 */
export async function setTransferListing(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const playerId = String(formData.get('playerId') ?? '');
  const intent = String(formData.get('intent') ?? '');
  if (!playerId) return { error: 'Brak zawodnika.' };
  if (intent !== 'list' && intent !== 'unlist') {
    return { error: 'Wybierz wystawienie lub zdjęcie z listy.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesja wygasła.' };

  const { data: club, error: clubErr } = await supabase
    .from('clubs')
    .select('id, transfer_window_open')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (clubErr || !club) return { error: 'Nie znaleziono klubu.' };

  const clubRow = club as { id: string; transfer_window_open: boolean };
  const active = await listClubPlayers(clubRow.id);
  const player = active.find((p) => p.id === playerId);

  if (!player || player.departedAt != null || player.status === 'DEPARTED') {
    return { error: 'Zawodnik niedostępny.' };
  }

  if (intent === 'list') {
    if (player.transferListedAt != null) {
      return { ok: true };
    }
    if (
      !isTransferSellEligible({
        transferWindowOpen: Boolean(clubRow.transfer_window_open),
        activePlayers: active,
        playerId,
      })
    ) {
      return { error: 'Nie można wystawić tego zawodnika (okno / kadra / bramkarz).' };
    }

    const { error } = await supabase
      .from('players')
      .update({ transfer_listed_at: new Date().toISOString() } as never)
      .eq('id', playerId)
      .eq('club_id', clubRow.id)
      .is('departed_at', null);

    if (error) return { error: 'Nie udało się wystawić zawodnika.' };
    revalidatePath('/', 'layout');
    return { ok: true };
  }

  if (player.transferListedAt == null) {
    return { ok: true };
  }

  const { data: unlistData, error: unlistErr } = await supabase.rpc(
    'unlist_transfer_player' as never,
    {
      p_club_id: clubRow.id,
      p_player_id: playerId,
    } as never,
  );

  if (unlistErr) return { error: 'Nie udało się zdjąć zawodnika z listy.' };
  const unlistRow = unlistData as { ok?: boolean; error?: string } | null;
  if (unlistRow && unlistRow.ok === false) {
    return { error: unlistRow.error || 'Nie udało się zdjąć zawodnika z listy.' };
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}
