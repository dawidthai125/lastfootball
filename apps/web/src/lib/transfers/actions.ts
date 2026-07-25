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
  buildIncomingOfferId,
  resolveIncomingOffers,
} from '@/lib/transfers/resolve-incoming-offers';
import {
  isAllowedAgreedAmount,
  resolveCounterAmount,
  resolveNegotiationStep,
  resolveOfferAmount,
  type OfferPreset,
} from '@/lib/transfers/resolve-negotiation';
import { resolveSellerNegotiationStep } from '@/lib/transfers/resolve-seller-negotiation';
import { seedTransferCatalogue } from '@/lib/transfers/seed-catalogue';
import { isTransferSellEligible } from '@/lib/transfers/sell-eligibility';

function parsePreset(raw: string): OfferPreset | null {
  if (raw === 'low' || raw === 'normal' || raw === 'high') return raw;
  return null;
}

export async function buyTransferPlayer(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const marketId = String(formData.get('marketId') ?? '');
  if (!marketId) return { error: 'Brak oferty.' };

  const phaseRaw = String(formData.get('phase') ?? 'opening');
  const phase = phaseRaw === 'counter' ? 'counter' : 'opening';

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

  const clubRow = club as {
    id: string;
    cash_balance: number;
    transfer_window_open: boolean;
  };

  const listing = seedTransferCatalogue(clubRow.id).find((l) => l.marketId === marketId);
  if (!listing) return { error: 'Nie znaleziono oferty rynkowej.' };

  const ask = deriveTransferFee(listing.skill, listing.age);
  const active = await listClubPlayers(clubRow.id);
  const activePlayers = active.map((p) => ({
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

  const settle = async (agreedAmount: number): Promise<TransferActionState> => {
    const result = await completeTransferBuy(supabase, {
      clubId: clubRow.id,
      cashBalance: clubRow.cash_balance,
      transferWindowOpen: Boolean(clubRow.transfer_window_open),
      marketId,
      agreedAmount,
      activePlayers,
    });
    if (!result.ok) return { error: result.error };
    revalidatePath('/', 'layout');
    return { ok: true };
  };

  if (phase === 'opening') {
    const preset = parsePreset(String(formData.get('preset') ?? ''));
    if (!preset) return { error: 'Wybierz ofertę (niska / normalna / wysoka).' };

    const step = resolveNegotiationStep({ ask, phase: 'opening', preset });
    if (step.kind === 'accepted') {
      return settle(step.agreedAmount);
    }
    if (step.kind === 'counter') {
      return {
        negotiation: {
          marketId,
          ask,
          counterAmount: step.counterAmount,
        },
      };
    }
    return { error: 'Nieoczekiwany wynik negocjacji.' };
  }

  const playerActionRaw = String(formData.get('playerAction') ?? '');
  if (playerActionRaw !== 'accept' && playerActionRaw !== 'reject') {
    return { error: 'Wybierz akceptację lub odrzucenie kontroferty.' };
  }

  const step = resolveNegotiationStep({
    ask,
    phase: 'counter',
    playerAction: playerActionRaw,
  });

  if (step.kind === 'rejected') {
    return { ok: true };
  }
  if (step.kind === 'accepted') {
    return settle(step.agreedAmount);
  }
  return { error: 'Nieoczekiwany wynik negocjacji.' };
}

export async function sellTransferPlayer(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const playerId = String(formData.get('playerId') ?? '');
  if (!playerId) return { error: 'Brak zawodnika.' };

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

  const clubRow = club as {
    id: string;
    cash_balance: number;
    transfer_window_open: boolean;
  };

  const active = await listClubPlayers(clubRow.id);
  const player = active.find((p) => p.id === playerId);
  if (!player) return { error: 'Nie znaleziono zawodnika.' };

  const ask = deriveTransferFee(player.skill, player.age);
  const result = await completeTransferSell(supabase, {
    clubId: clubRow.id,
    cashBalance: clubRow.cash_balance,
    transferWindowOpen: Boolean(clubRow.transfer_window_open),
    playerId,
    agreedAmount: ask,
    activePlayers: active.map((p) => ({
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
    })),
  });

  if (!result.ok) return { error: result.error };

  revalidatePath('/', 'layout');
  return { ok: true };
}

/**
 * Incoming offer seller negotiation (LFE-TRANSFERS-05 S2).
 * Accept / Reject / Counter (vs AI Low only); settlement via completeTransferSell(agreedAmount).
 */
export async function respondIncomingOffer(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const playerId = String(formData.get('playerId') ?? '');
  const offerId = String(formData.get('offerId') ?? '');
  const phaseRaw = String(formData.get('phase') ?? 'opening');
  const phase = phaseRaw === 'counter' ? 'counter' : 'opening';
  const decision = String(formData.get('decision') ?? '');

  if (!playerId || !offerId) return { error: 'Brak oferty.' };

  if (phase === 'opening') {
    if (decision !== 'accept' && decision !== 'reject' && decision !== 'counter') {
      return { error: 'Wybierz akceptację, odrzucenie lub kontrofertę.' };
    }
  } else if (decision !== 'accept' && decision !== 'reject') {
    return { error: 'Wybierz akceptację lub odrzucenie kontroferty.' };
  }

  if (decision === 'reject') {
    return { ok: true };
  }

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

  const clubRow = club as {
    id: string;
    cash_balance: number;
    transfer_window_open: boolean;
  };

  const windowOpen = Boolean(clubRow.transfer_window_open);
  const active = await listClubPlayers(clubRow.id);
  const player = active.find((p) => p.id === playerId);
  if (!player || player.departedAt != null || player.status === 'DEPARTED') {
    return { error: 'Zawodnik niedostępny.' };
  }
  if (player.transferListedAt == null) {
    return { error: 'Zawodnik nie jest na liście transferowej.' };
  }
  if (
    !isTransferSellEligible({
      transferWindowOpen: windowOpen,
      activePlayers: active,
      playerId,
    })
  ) {
    return { error: 'Sprzedaż niedostępna (okno / kadra / bramkarz).' };
  }

  const ask = deriveTransferFee(player.skill, player.age);
  const offers = resolveIncomingOffers({
    clubId: clubRow.id,
    transferWindowOpen: windowOpen,
    activePlayers: active,
  });
  const offer = offers.find((o) => o.offerId === offerId && o.playerId === playerId);
  if (!offer) {
    return { error: 'Oferta nieaktualna — odśwież Transfery.' };
  }
  if (offer.offerId !== buildIncomingOfferId(clubRow.id, playerId)) {
    return { error: 'Nieprawidłowy identyfikator oferty.' };
  }
  if (offer.ask !== ask) {
    return { error: 'Ask nieaktualny — odśwież Transfery.' };
  }

  const settle = async (agreedAmount: number): Promise<TransferActionState> => {
    if (!isAllowedAgreedAmount(ask, agreedAmount)) {
      return { error: 'Nieprawidłowa kwota negocjacji.' };
    }
    const result = await completeTransferSell(supabase, {
      clubId: clubRow.id,
      cashBalance: clubRow.cash_balance,
      transferWindowOpen: windowOpen,
      playerId,
      agreedAmount,
      activePlayers: active.map((p) => ({
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
      })),
    });
    if (!result.ok) return { error: result.error };
    revalidatePath('/', 'layout');
    return { ok: true };
  };

  if (phase === 'opening') {
    const step = resolveSellerNegotiationStep({
      ask,
      phase: 'opening',
      aiPreset: offer.aiPreset,
      playerAction: decision as 'accept' | 'reject' | 'counter',
    });
    if (step.kind === 'accepted') {
      return settle(step.agreedAmount);
    }
    if (step.kind === 'counter') {
      return {
        sellerNegotiation: {
          offerId,
          playerId,
          ask,
          counterAmount: step.counterAmount,
        },
      };
    }
    return { ok: true };
  }

  const step = resolveSellerNegotiationStep({
    ask,
    phase: 'counter',
    playerAction: decision as 'accept' | 'reject',
  });
  if (step.kind === 'accepted') {
    return settle(step.agreedAmount);
  }
  return { ok: true };
}

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

/**
 * Live H2H Instant Buy @ 100% ask (LFE-TRANSFERS-06).
 * One deriveTransferFee snapshot; settlement via completeTransferSell + completeTransferBuy (live).
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

  const sellResult = await completeTransferSell(supabase, {
    source: 'live',
    clubId: sellerClubId,
    transferWindowOpen: listing.sellerWindowOpen,
    playerId,
    buyerClubId: buyer.id,
    currentAsk: askSnapshot,
    agreedAmount: askSnapshot,
    playerSkill: listing.skill,
    playerAge: listing.age,
  });
  if (!sellResult.ok) return { error: sellResult.error };

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
    amount,
    ask_at_create: askAtCreate,
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
 * Accept H2H pending offer (seller). Settlement via buy/sell live only.
 * Funds fail → offer stays pending.
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
    .select('id, transfer_window_open')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (clubErr || !club) return { error: 'Nie znaleziono klubu.' };
  const seller = club as { id: string; transfer_window_open: boolean };

  const { data: offerRow, error: offerErr } = await supabase
    .from('transfer_offers' as never)
    .select('id, player_id, seller_club_id, buyer_club_id, amount, ask_at_create, status')
    .eq('id', offerId)
    .maybeSingle();

  if (offerErr || !offerRow) return { error: 'Nie znaleziono oferty.' };

  const offer = offerRow as {
    id: string;
    player_id: string;
    seller_club_id: string;
    buyer_club_id: string;
    amount: number;
    ask_at_create: number;
    status: string;
  };

  if (offer.seller_club_id !== seller.id) {
    return { error: 'Brak uprawnień sprzedawcy.' };
  }
  if (offer.status !== 'pending') {
    return { error: 'Oferta nie jest aktywna.' };
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
  if (!isAllowedAgreedAmount(currentAsk, offer.amount)) {
    return { error: 'Kwota oferty poza aktualnym pasmem — kupujący musi złożyć nową.' };
  }

  // Seller auth path: RPC validates funds/roster; TS stubs only satisfy live buy length check.
  const rosterForBuy = Array.from({ length: 18 }, (_, i) => ({
    id: `stub-${i}`,
    name: 'Stub',
    shirt_number: i + 1,
    pos: 'ŚP',
    role: 'CM',
    starter: false,
    age: 20,
    skill: 50,
    status: 'READY',
    departed_at: null as string | null,
  }));

  const sellResult = await completeTransferSell(supabase, {
    source: 'live',
    clubId: offer.seller_club_id,
    transferWindowOpen: Boolean(seller.transfer_window_open),
    playerId: offer.player_id,
    buyerClubId: offer.buyer_club_id,
    currentAsk,
    agreedAmount: offer.amount,
    playerSkill: player.skill,
    playerAge: player.age,
    acceptOfferId: offer.id,
  });
  if (!sellResult.ok) return { error: sellResult.error };

  const buyResult = await completeTransferBuy(supabase, {
    source: 'live',
    clubId: offer.buyer_club_id,
    cashBalance: offer.amount,
    transferWindowOpen: true,
    playerId: offer.player_id,
    sellerClubId: offer.seller_club_id,
    currentAsk,
    agreedAmount: offer.amount,
    activePlayers: rosterForBuy,
    acceptOfferId: offer.id,
  });
  if (!buyResult.ok) return { error: buyResult.error };

  revalidatePath('/', 'layout');
  return { ok: true };
}

/** Reject one pending offer (seller) — no cash/players mutation. */
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
