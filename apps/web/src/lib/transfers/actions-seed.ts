'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';
import { listClubPlayers } from '@/lib/squad/get-players';
import { completeTransferBuy, completeTransferSell } from '@/lib/transfers/complete-deal';
import type { TransferActionState } from '@/lib/transfers/action-types';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
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
