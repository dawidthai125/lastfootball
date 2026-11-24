'use server';

import { filterSeniorPlayers } from '@/lib/squad/types';
import { aiSaleAsk, saleBlock, saleShownPriceError } from '@/lib/transfers/fair-sale';
import { revalidatePath } from 'next/cache';

import { serverDb } from '@/lib/supabase/admin';
import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';
import { listClubPlayers } from '@/lib/squad/get-players';
import { completeTransferBuy, completeTransferSell } from '@/lib/transfers/complete-deal';
import type { TransferActionState } from '@/lib/transfers/action-types';
import { marketFee } from '@/lib/transfers/market-fee';
import {
  buildIncomingOfferId,
  resolveIncomingOffers,
} from '@/lib/transfers/resolve-incoming-offers';
import {
  isAllowedAgreedAmount,
  resolveNegotiationStep,
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
  const phase = phaseRaw === 'counter' ? 'counter' : phaseRaw === 'final' ? 'final' : 'opening';

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

  const ask = marketFee(listing.skill, listing.age, listing.clubLabel);
  const active = await listClubPlayers(clubRow.id);
  const activePlayers = filterSeniorPlayers(active).map((p) => ({
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
    origin: p.origin,
    seniorMatches: p.seniorMatches,
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
          step: 'counter',
        },
      };
    }
    return { error: 'Nieoczekiwany wynik negocjacji.' };
  }

  if (phase === 'final') {
    const playerActionRaw = String(formData.get('playerAction') ?? '');
    if (playerActionRaw !== 'accept' && playerActionRaw !== 'reject') {
      return { error: 'Wybierz akceptację lub odrzucenie ostatecznej oferty.' };
    }
    const step = resolveNegotiationStep({
      ask,
      phase: 'final',
      playerAction: playerActionRaw,
    });
    if (step.kind === 'rejected') return { ok: true };
    if (step.kind === 'accepted') return settle(step.agreedAmount);
    return { error: 'Nieoczekiwany wynik negocjacji.' };
  }

  const playerActionRaw = String(formData.get('playerAction') ?? '');
  if (playerActionRaw !== 'accept' && playerActionRaw !== 'reject' && playerActionRaw !== 'final') {
    return { error: 'Wybierz akceptację, ostateczną ofertę albo odrzucenie.' };
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
  if (step.kind === 'final') {
    return {
      negotiation: {
        marketId,
        ask,
        finalAmount: step.finalAmount,
        step: 'final',
      },
    };
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

  const blocked = saleBlock(player);
  if (blocked) return { error: blocked };
  if (
    !isTransferSellEligible({
      transferWindowOpen: Boolean(clubRow.transfer_window_open),
      activePlayers: active,
      playerId,
    })
  ) {
    return { error: 'Sprzedaż niedostępna (okno / kadra / bramkarz).' };
  }

  const ask = aiSaleAsk(player);
  const moved = saleShownPriceError(formData.get('ask'), ask);
  if (moved) return { error: moved };
  const result = await completeTransferSell(supabase, {
    clubId: clubRow.id,
    cashBalance: clubRow.cash_balance,
    transferWindowOpen: Boolean(clubRow.transfer_window_open),
    playerId,
    agreedAmount: ask,
    activePlayers: filterSeniorPlayers(active).map((p) => ({
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
      origin: p.origin,
      seniorMatches: p.seniorMatches,
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

  if (decision === 'reject') {
    // The offer stays away until the player is listed again (reset by the database).
    const { error } = await serverDb(supabase)
      .from('players')
      .update({ ai_offer_declined: true } as never)
      .eq('id', playerId)
      .eq('club_id', clubRow.id);
    if (error) return { error: 'Nie udało się odrzucić oferty. Spróbuj ponownie.' };
    revalidatePath('/', 'layout');
    return { ok: true };
  }

  const windowOpen = Boolean(clubRow.transfer_window_open);
  const active = await listClubPlayers(clubRow.id);
  const player = active.find((p) => p.id === playerId);
  if (!player || player.departedAt != null || player.status === 'DEPARTED') {
    return { error: 'Zawodnik niedostępny.' };
  }
  if (player.transferListedAt == null) {
    return { error: 'Zawodnik nie jest na liście transferowej.' };
  }
  const blocked = saleBlock(player);
  if (blocked) return { error: blocked };
  if (
    !isTransferSellEligible({
      transferWindowOpen: windowOpen,
      activePlayers: active,
      playerId,
    })
  ) {
    return { error: 'Sprzedaż niedostępna (okno / kadra / bramkarz).' };
  }

  const ask = aiSaleAsk(player);
  const moved = saleShownPriceError(formData.get('ask'), ask);
  if (moved) return { error: moved };
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
      activePlayers: filterSeniorPlayers(active).map((p) => ({
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
        origin: p.origin,
        seniorMatches: p.seniorMatches,
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
