'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';
import { listClubPlayers } from '@/lib/squad/get-players';
import { completeTransferBuy, completeTransferSell } from '@/lib/transfers/complete-deal';
import type { TransferActionState } from '@/lib/transfers/action-types';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { resolveNegotiationStep, type OfferPreset } from '@/lib/transfers/resolve-negotiation';
import { seedTransferCatalogue } from '@/lib/transfers/seed-catalogue';

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
  const result = await completeTransferSell(supabase, {
    clubId: clubRow.id,
    cashBalance: clubRow.cash_balance,
    transferWindowOpen: Boolean(clubRow.transfer_window_open),
    playerId,
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
