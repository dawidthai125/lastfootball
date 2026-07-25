'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';
import { listClubPlayers } from '@/lib/squad/get-players';
import {
  completeTransferBuy,
  completeTransferSell,
} from '@/lib/transfers/complete-deal';
import type { TransferActionState } from '@/lib/transfers/action-types';

export async function buyTransferPlayer(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const marketId = String(formData.get('marketId') ?? '');
  if (!marketId) return { error: 'Brak oferty.' };

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
  const result = await completeTransferBuy(supabase, {
    clubId: clubRow.id,
    cashBalance: clubRow.cash_balance,
    transferWindowOpen: Boolean(clubRow.transfer_window_open),
    marketId,
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
