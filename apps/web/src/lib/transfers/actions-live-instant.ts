'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';
import { listClubPlayers } from '@/lib/squad/get-players';
import { completeTransferBuy } from '@/lib/transfers/complete-deal';
import type { TransferActionState } from '@/lib/transfers/action-types';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { fetchLiveListings } from '@/lib/transfers/fetch-live-listings';

/**
 * Live H2H Instant Buy @ 100% ask (LFE-TRANSFERS-06 / LFE-TRANSFERS-09).
 * One deriveTransferFee snapshot; single settlement entry via completeTransferBuy (live).
 */
export async function buyLiveTransferPlayer(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const playerId = String(formData.get('playerId') ?? '');
  const sellerClubId = String(formData.get('sellerClubId') ?? '');
  if (!playerId || !sellerClubId) return { error: 'Brak oferty Live.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesja wygasła.' };

  const { data: club, error: clubErr } = await supabase
    .from('clubs')
    .select('id, cash_balance, transfer_window_open')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (clubErr || !club) return { error: 'Nie znaleziono klubu.' };

  const buyer = club as {
    id: string;
    cash_balance: number;
    transfer_window_open: boolean;
  };

  if (buyer.id === sellerClubId) {
    return { error: 'Nie możesz kupić własnego zawodnika.' };
  }
  if (!buyer.transfer_window_open) {
    return { error: 'Okno transferowe jest zamknięte.' };
  }

  const liveListings = await fetchLiveListings(supabase, buyer.id);
  const listing = liveListings.find(
    (l) => l.playerId === playerId && l.sellerClubId === sellerClubId,
  );
  if (!listing) {
    return { error: 'Oferta Live nieaktualna — odśwież Transfery.' };
  }
  if (!listing.sellerWindowOpen) {
    return { error: 'Okno transferowe sprzedawcy jest zamknięte.' };
  }

  // Single fee snapshot for the whole Live operation (AC).
  const askSnapshot = deriveTransferFee(listing.skill, listing.age);
  if (askSnapshot !== listing.ask) {
    return { error: 'Ask nieaktualny — odśwież Transfery.' };
  }

  // Re-verify owner still seller before settlement (AC).
  const { data: playerRow, error: playerErr } = await supabase
    .from('players')
    .select('id, club_id, transfer_listed_at, departed_at, skill, age')
    .eq('id', playerId)
    .maybeSingle();

  if (playerErr || !playerRow) {
    return { error: 'Nie znaleziono zawodnika.' };
  }

  const owned = playerRow as {
    id: string;
    club_id: string;
    transfer_listed_at: string | null;
    departed_at: string | null;
    skill: number;
    age: number;
  };

  if (owned.club_id !== sellerClubId) {
    return { error: 'Zawodnik nie należy już do sprzedawcy.' };
  }
  if (owned.departed_at != null || owned.transfer_listed_at == null) {
    return { error: 'Zawodnik niedostępny na rynku Live.' };
  }
  if (deriveTransferFee(owned.skill, owned.age) !== askSnapshot) {
    return { error: 'Ask nieaktualny — odśwież Transfery.' };
  }

  const active = await listClubPlayers(buyer.id);
  const activeMapped = active.map((p) => ({
    id: p.id,
    name: p.name,
    shirt_number: p.shirtNumber,
    pos: p.pos,
    role: p.role,
    starter: p.starter,
    age: p.age,
    skill: p.skill,
    status: p.status,
    departed_at: p.departedAt,
  }));

  const buyResult = await completeTransferBuy(supabase, {
    source: 'live',
    clubId: buyer.id,
    cashBalance: buyer.cash_balance,
    transferWindowOpen: Boolean(buyer.transfer_window_open),
    playerId,
    sellerClubId,
    currentAsk: askSnapshot,
    agreedAmount: askSnapshot,
    activePlayers: activeMapped,
  });
  if (!buyResult.ok) return { error: buyResult.error };

  revalidatePath('/', 'layout');
  return { ok: true };
}
