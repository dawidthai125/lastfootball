'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import type { TransferActionState } from '@/lib/transfers/action-types';
import { createClient } from '@/lib/supabase/server';

type RpcRow = { ok?: boolean; error?: string };

async function callAuction(
  fn: 'place_auction_bid' | 'complete_auction_transfer' | 'withdraw_auction',
  args: Record<string, string | number>,
): Promise<TransferActionState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesja wygasła.' };

  const { data, error } = await supabase.rpc(fn as never, args as never);
  if (error) return { error: 'Licytacja nie jest jeszcze włączona.' };
  const row = data as RpcRow | null;
  if (!row?.ok) return { error: row?.error || 'Licytacja nieudana.' };

  revalidatePath('/transfers');
  revalidatePath('/finance');
  revalidatePath('/squad');
  return { ok: true };
}

export async function placeAuctionBid(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  const playerId = String(formData.get('playerId') ?? '').trim();
  const amount = Number(formData.get('amount'));
  if (!playerId || !Number.isInteger(amount)) return { error: 'Podaj kwotę w pełnych euro.' };
  return callAuction('place_auction_bid', { p_player_id: playerId, p_amount: amount });
}

export async function settleAuctionBid(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  const playerId = String(formData.get('playerId') ?? '').trim();
  if (!playerId) return { error: 'Brak zawodnika.' };
  return callAuction('complete_auction_transfer', { p_player_id: playerId });
}

export async function withdrawAuctionBid(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  const playerId = String(formData.get('playerId') ?? '').trim();
  if (!playerId) return { error: 'Brak zawodnika.' };
  return callAuction('withdraw_auction', { p_player_id: playerId });
}
