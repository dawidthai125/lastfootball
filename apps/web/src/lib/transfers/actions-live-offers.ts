'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';
import { listClubPlayers } from '@/lib/squad/get-players';
import { completeTransferBuy, completeTransferSell } from '@/lib/transfers/complete-deal';
import type { TransferActionState } from '@/lib/transfers/action-types';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { fetchLiveListings } from '@/lib/transfers/fetch-live-listings';
import {
  isAllowedAgreedAmount,
  resolveCounterAmount,
  resolveOfferAmount,
  type OfferPreset,
} from '@/lib/transfers/resolve-negotiation';

type OfferAmountPreset = OfferPreset | 'counter';

function parseOfferPreset(raw: string): OfferAmountPreset | null {
  if (raw === 'low' || raw === 'normal' || raw === 'high' || raw === 'counter') return raw;
  return null;
}

function amountForPreset(ask: number, preset: OfferAmountPreset): number {
  if (preset === 'counter') return resolveCounterAmount(ask);
  return resolveOfferAmount(ask, preset);
}

/**
 * Create H2H pending offer (LFE-TRANSFERS-07).
 * Mutates only transfer_offers — no players/cash/deals.
 */
export async function createLiveTransferOffer(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const playerId = String(formData.get('playerId') ?? '');
  const sellerClubId = String(formData.get('sellerClubId') ?? '');
  const preset = parseOfferPreset(String(formData.get('preset') ?? ''));
  if (!playerId || !sellerClubId) return { error: 'Brak oferty Live.' };
  if (!preset) return { error: 'Wybierz kwotę (Niska / Normalna / Wysoka / 95%).' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesja wygasła.' };

  const { data: club, error: clubErr } = await supabase
    .from('clubs')
    .select('id, name, short_name, transfer_window_open')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (clubErr || !club) return { error: 'Nie znaleziono klubu.' };

  const buyer = club as {
    id: string;
    name: string;
    short_name: string;
    transfer_window_open: boolean;
  };

  if (buyer.id === sellerClubId) {
    return { error: 'Nie możesz złożyć oferty na własnego zawodnika.' };
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

  const askAtCreate = deriveTransferFee(listing.skill, listing.age);
  if (askAtCreate !== listing.ask) {
    return { error: 'Ask nieaktualny — odśwież Transfery.' };
  }
  const amount = amountForPreset(askAtCreate, preset);
  if (!isAllowedAgreedAmount(askAtCreate, amount)) {
    return { error: 'Nieprawidłowa kwota oferty.' };
  }

  const { data: playerRow } = await supabase
    .from('players')
    .select('id, club_id, transfer_listed_at, departed_at')
    .eq('id', playerId)
    .maybeSingle();

  const owned = playerRow as {
    club_id: string;
    transfer_listed_at: string | null;
    departed_at: string | null;
  } | null;

  if (!owned || owned.club_id !== sellerClubId || owned.transfer_listed_at == null) {
    return { error: 'Zawodnik niedostępny na rynku Live.' };
  }
  if (owned.departed_at != null) {
    return { error: 'Zawodnik niedostępny.' };
  }

  const idempotencyKey = `pending:${buyer.id}:${playerId}`;
  const { error: insErr } = await supabase.from('transfer_offers' as never).insert({
    player_id: playerId,
    seller_club_id: sellerClubId,
    buyer_club_id: buyer.id,
    opening_amount: amount,
    current_amount: amount,
    ask_at_create: askAtCreate,
    phase: 'opening',
    last_actor: 'buyer',
    status: 'pending',
    idempotency_key: idempotencyKey,
    buyer_label: buyer.short_name || buyer.name,
    seller_label: listing.sellerClubLabel,
  } as never);

  if (insErr) {
    if (insErr.code === '23505') {
      return { ok: true };
    }
    return { error: 'Nie udało się złożyć oferty.' };
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}

/**
 * Accept H2H pending offer (LFE-TRANSFERS-09: single settle invoke).
 * phase=opening → seller → completeTransferSell (live).
 * phase=countered → buyer → completeTransferBuy (live).
 * Funds fail → stays pending (RPC).
 */
export async function acceptLiveTransferOffer(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const offerId = String(formData.get('offerId') ?? '');
  if (!offerId) return { error: 'Brak oferty.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesja wygasła.' };

  const { data: club, error: clubErr } = await supabase
    .from('clubs')
    .select('id, transfer_window_open, cash_balance')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (clubErr || !club) return { error: 'Nie znaleziono klubu.' };
  const actor = club as {
    id: string;
    transfer_window_open: boolean;
    cash_balance: number;
  };

  const { data: offerRow, error: offerErr } = await supabase
    .from('transfer_offers' as never)
    .select(
      'id, player_id, seller_club_id, buyer_club_id, current_amount, ask_at_create, phase, status',
    )
    .eq('id', offerId)
    .maybeSingle();

  if (offerErr || !offerRow) return { error: 'Nie znaleziono oferty.' };

  const offer = offerRow as {
    id: string;
    player_id: string;
    seller_club_id: string;
    buyer_club_id: string;
    current_amount: number;
    ask_at_create: number;
    phase: string;
    status: string;
  };

  if (offer.status !== 'pending') {
    return { error: 'Oferta nie jest aktywna.' };
  }

  if (offer.phase === 'opening') {
    if (offer.seller_club_id !== actor.id) {
      return { error: 'Brak uprawnień sprzedawcy.' };
    }
    if (!actor.transfer_window_open) {
      return { error: 'Okno transferowe jest zamknięte.' };
    }
  } else if (offer.phase === 'countered') {
    if (offer.buyer_club_id !== actor.id) {
      return { error: 'Brak uprawnień kupującego.' };
    }
    if (!actor.transfer_window_open) {
      return { error: 'Okno transferowe jest zamknięte.' };
    }
  } else {
    return { error: 'Nieprawidłowa faza oferty.' };
  }

  const { data: playerRow } = await supabase
    .from('players')
    .select('id, club_id, transfer_listed_at, departed_at, skill, age')
    .eq('id', offer.player_id)
    .maybeSingle();

  const player = playerRow as {
    id: string;
    club_id: string;
    transfer_listed_at: string | null;
    departed_at: string | null;
    skill: number;
    age: number;
  } | null;

  if (!player || player.departed_at != null) {
    return { error: 'Zawodnik niedostępny.' };
  }
  if (player.club_id !== offer.seller_club_id) {
    return { error: 'Zawodnik nie należy już do sprzedawcy.' };
  }
  if (player.transfer_listed_at == null) {
    return { error: 'Zawodnik nie jest na liście transferowej.' };
  }

  const currentAsk = deriveTransferFee(player.skill, player.age);
  if (!isAllowedAgreedAmount(currentAsk, offer.current_amount)) {
    return { error: 'Kwota oferty poza aktualnym pasmem — złóż nową ofertę.' };
  }

  const agreedAmount = offer.current_amount;

  if (offer.phase === 'opening') {
    const sellResult = await completeTransferSell(supabase, {
      source: 'live',
      clubId: offer.seller_club_id,
      transferWindowOpen: Boolean(actor.transfer_window_open),
      playerId: offer.player_id,
      buyerClubId: offer.buyer_club_id,
      currentAsk,
      agreedAmount,
      playerSkill: player.skill,
      playerAge: player.age,
      acceptOfferId: offer.id,
    });
    if (!sellResult.ok) return { error: sellResult.error };
  } else {
    const active = await listClubPlayers(offer.buyer_club_id);
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
      clubId: offer.buyer_club_id,
      cashBalance: actor.cash_balance,
      transferWindowOpen: Boolean(actor.transfer_window_open),
      playerId: offer.player_id,
      sellerClubId: offer.seller_club_id,
      currentAsk,
      agreedAmount,
      activePlayers: activeMapped,
      acceptOfferId: offer.id,
    });
    if (!buyResult.ok) return { error: buyResult.error };
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}

/**
 * Seller counter on pending H2H offer (1×). Mutates only current_amount/phase/last_actor via RPC.
 */
export async function counterLiveTransferOffer(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const offerId = String(formData.get('offerId') ?? '');
  const preset = parseOfferPreset(String(formData.get('preset') ?? ''));
  if (!offerId) return { error: 'Brak oferty.' };
  if (!preset) return { error: 'Wybierz kwotę kontrpropozycji (90/95/100/110%).' };

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
  const seller = club as { id: string; transfer_window_open: boolean };

  if (!seller.transfer_window_open) {
    return { error: 'Okno transferowe jest zamknięte.' };
  }

  const { data: offerRow, error: offerErr } = await supabase
    .from('transfer_offers' as never)
    .select('id, player_id, seller_club_id, phase, status')
    .eq('id', offerId)
    .maybeSingle();

  if (offerErr || !offerRow) return { error: 'Nie znaleziono oferty.' };

  const offer = offerRow as {
    id: string;
    player_id: string;
    seller_club_id: string;
    phase: string;
    status: string;
  };

  if (offer.seller_club_id !== seller.id) {
    return { error: 'Brak uprawnień sprzedawcy.' };
  }
  if (offer.status !== 'pending') {
    return { error: 'Oferta nie jest aktywna.' };
  }
  if (offer.phase !== 'opening') {
    return { error: 'Kontrpropozycja już złożona.' };
  }

  const { data: playerRow } = await supabase
    .from('players')
    .select('id, club_id, transfer_listed_at, departed_at, skill, age')
    .eq('id', offer.player_id)
    .maybeSingle();

  const player = playerRow as {
    skill: number;
    age: number;
    club_id: string;
    transfer_listed_at: string | null;
    departed_at: string | null;
  } | null;

  if (!player || player.departed_at != null) {
    return { error: 'Zawodnik niedostępny.' };
  }
  if (player.club_id !== offer.seller_club_id || player.transfer_listed_at == null) {
    return { error: 'Zawodnik niedostępny na rynku Live.' };
  }

  const currentAsk = deriveTransferFee(player.skill, player.age);
  const currentAmount = amountForPreset(currentAsk, preset);
  if (!isAllowedAgreedAmount(currentAsk, currentAmount)) {
    return { error: 'Nieprawidłowa kwota kontrpropozycji.' };
  }

  const { data, error } = await supabase.rpc(
    'counter_live_transfer_offer' as never,
    {
      p_offer_id: offerId,
      p_current_amount: currentAmount,
    } as never,
  );

  if (error) return { error: error.message || 'Nie udało się złożyć kontrpropozycji.' };
  const row = data as { ok?: boolean; error?: string } | null;
  if (!row || row.ok !== true) {
    return { error: row?.error || 'Nie udało się złożyć kontrpropozycji.' };
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}

/** Reject one pending offer — opening: seller; countered: buyer. No cash/players. */
export async function rejectLiveTransferOffer(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }
  const offerId = String(formData.get('offerId') ?? '');
  if (!offerId) return { error: 'Brak oferty.' };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    'reject_transfer_offer' as never,
    {
      p_offer_id: offerId,
    } as never,
  );

  if (error) return { error: error.message || 'Nie udało się odrzucić.' };
  const row = data as { ok?: boolean; error?: string } | null;
  if (!row || row.ok !== true) {
    return { error: row?.error || 'Nie udało się odrzucić.' };
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}

/** Withdraw one pending offer (buyer) — no cash/players mutation. */
export async function withdrawLiveTransferOffer(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }
  const offerId = String(formData.get('offerId') ?? '');
  if (!offerId) return { error: 'Brak oferty.' };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    'withdraw_transfer_offer' as never,
    {
      p_offer_id: offerId,
    } as never,
  );

  if (error) return { error: error.message || 'Nie udało się wycofać.' };
  const row = data as { ok?: boolean; error?: string } | null;
  if (!row || row.ok !== true) {
    return { error: row?.error || 'Nie udało się wycofać.' };
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}
