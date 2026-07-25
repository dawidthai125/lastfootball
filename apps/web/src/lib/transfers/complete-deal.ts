import type { createClient } from '@/lib/supabase/server';
import { resolveTransferEnvelope } from '@/lib/finance/resolve-transfer-envelope';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { isAllowedAgreedAmount } from '@/lib/transfers/resolve-negotiation';
import { seedTransferCatalogue } from '@/lib/transfers/seed-catalogue';
import { TRANSFERS_THIN } from '@/lib/transfers/types';

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

function clubTag(clubId: string): string {
  return clubId.replace(/-/g, '').slice(0, 8) || 'club';
}

function nextBoughtId(clubId: string, existingIds: readonly string[]): string {
  const tag = clubTag(clubId);
  const prefix = `t-${tag}-`;
  let max = -1;
  for (const id of existingIds) {
    if (!id.startsWith(prefix)) continue;
    const n = Number(id.slice(prefix.length));
    if (Number.isFinite(n)) max = Math.max(max, n);
  }
  return `${prefix}${max + 1}`;
}

function nextShirt(used: readonly number[]): number {
  for (let n = 1; n <= 99; n++) {
    if (!used.includes(n)) return n;
  }
  return 99;
}

export type CompleteBuyResult =
  { ok: true; playerId: string; amount: number } | { ok: false; error: string };

export type CompleteSellResult =
  { ok: true; playerId: string; amount: number } | { ok: false; error: string };

type ActivePlayer = {
  id: string;
  name: string;
  shirt_number: number;
  pos: string;
  role: string;
  starter: boolean;
  age: number;
  skill: number;
  status: string;
  departed_at: string | null;
};

type SeedBuyInput = {
  readonly source?: 'seed';
  clubId: string;
  cashBalance: number;
  transferWindowOpen: boolean;
  marketId: string;
  agreedAmount: number;
  activePlayers: readonly ActivePlayer[];
};

type LiveBuyInput = {
  readonly source: 'live';
  /** Buyer club. */
  clubId: string;
  cashBalance: number;
  transferWindowOpen: boolean;
  playerId: string;
  sellerClubId: string;
  /** Single deriveTransferFee() snapshot for this Live op. */
  askSnapshot: number;
  /** Instant Live = 100% ask → must equal askSnapshot. */
  agreedAmount: number;
  activePlayers: readonly ActivePlayer[];
};

type InstantSellInput = {
  readonly source?: 'instant';
  clubId: string;
  cashBalance: number;
  transferWindowOpen: boolean;
  playerId: string;
  agreedAmount: number;
  activePlayers: readonly ActivePlayer[];
};

type LiveSellInput = {
  readonly source: 'live';
  /** Seller club. */
  clubId: string;
  transferWindowOpen: boolean;
  playerId: string;
  buyerClubId: string;
  askSnapshot: number;
  agreedAmount: number;
  /** Skill/age from listing — askSnapshot must match deriveTransferFee. */
  playerSkill: number;
  playerAge: number;
};

type LiveRpcResult = {
  ok?: boolean;
  error?: string;
  player_id?: string;
  amount?: number;
};

/**
 * Invokes atomic DB Live H2H settlement (security definer RPC).
 * Not exported — buy/sell remain the only settlement entry points.
 */
async function invokeLiveH2hRpc(
  supabase: AppSupabase,
  input: {
    buyerClubId: string;
    sellerClubId: string;
    playerId: string;
    askSnapshot: number;
  },
): Promise<CompleteBuyResult> {
  const { data, error } = await supabase.rpc(
    'complete_live_h2h_transfer' as never,
    {
      p_buyer_club_id: input.buyerClubId,
      p_seller_club_id: input.sellerClubId,
      p_player_id: input.playerId,
      p_ask_snapshot: input.askSnapshot,
    } as never,
  );

  if (error) {
    return { ok: false, error: error.message || 'Transfer Live nieudany.' };
  }

  const row = data as LiveRpcResult | null;
  if (!row || row.ok !== true || !row.player_id || typeof row.amount !== 'number') {
    return { ok: false, error: row?.error || 'Transfer Live nieudany.' };
  }

  return { ok: true, playerId: row.player_id, amount: row.amount };
}

/**
 * Atomic buy settlement.
 * - seed: insert t-{tag}- player from catalogue.
 * - live: Instant @ askSnapshot via shared RPC (players.id unchanged).
 */
export async function completeTransferBuy(
  supabase: AppSupabase,
  input: SeedBuyInput | LiveBuyInput,
): Promise<CompleteBuyResult> {
  if (input.source === 'live') {
    if (!input.transferWindowOpen) {
      return { ok: false, error: 'Okno transferowe jest zamknięte.' };
    }
    if (input.activePlayers.length >= TRANSFERS_THIN.MAX_ROSTER) {
      return { ok: false, error: 'Kadra jest pełna (max 22).' };
    }
    if (input.clubId === input.sellerClubId) {
      return { ok: false, error: 'Nie możesz kupić własnego zawodnika.' };
    }
    if (input.agreedAmount !== input.askSnapshot) {
      return { ok: false, error: 'Live Buy wymaga 100% ask.' };
    }
    if (!isAllowedAgreedAmount(input.askSnapshot, input.agreedAmount)) {
      return { ok: false, error: 'Nieprawidłowa kwota negocjacji.' };
    }
    const envelope = resolveTransferEnvelope(input.cashBalance);
    if (input.cashBalance < input.askSnapshot || envelope.envelopeBalance < input.askSnapshot) {
      return { ok: false, error: 'Za mało środków w budżecie transferowym / kasie.' };
    }

    return invokeLiveH2hRpc(supabase, {
      buyerClubId: input.clubId,
      sellerClubId: input.sellerClubId,
      playerId: input.playerId,
      askSnapshot: input.askSnapshot,
    });
  }

  if (!input.transferWindowOpen) {
    return { ok: false, error: 'Okno transferowe jest zamknięte.' };
  }
  if (input.activePlayers.length >= TRANSFERS_THIN.MAX_ROSTER) {
    return { ok: false, error: 'Kadra jest pełna (max 22).' };
  }

  const listing = seedTransferCatalogue(input.clubId).find((l) => l.marketId === input.marketId);
  if (!listing) {
    return { ok: false, error: 'Nie znaleziono oferty rynkowej.' };
  }

  const ask = deriveTransferFee(listing.skill, listing.age);
  if (!isAllowedAgreedAmount(ask, input.agreedAmount)) {
    return { ok: false, error: 'Nieprawidłowa kwota negocjacji.' };
  }

  const agreedAmount = input.agreedAmount;
  const envelope = resolveTransferEnvelope(input.cashBalance);
  if (input.cashBalance < agreedAmount || envelope.envelopeBalance < agreedAmount) {
    return { ok: false, error: 'Za mało środków w budżecie transferowym / kasie.' };
  }

  const idempotencyKey = `buy:${input.marketId}`;
  const { data: existing } = await supabase
    .from('transfer_deals')
    .select('id, player_id, amount')
    .eq('club_id', input.clubId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existing) {
    const row = existing as { player_id: string; amount: number };
    return { ok: true, playerId: row.player_id, amount: row.amount };
  }

  const allIds = input.activePlayers.map((p) => p.id);
  const { data: departedRows } = await supabase
    .from('players')
    .select('id')
    .eq('club_id', input.clubId);

  const departedIds = ((departedRows as { id: string }[] | null) ?? []).map((r) => r.id);
  const playerId = nextBoughtId(input.clubId, [...allIds, ...departedIds]);
  const shirt = nextShirt(input.activePlayers.map((p) => p.shirt_number));
  const nextCash = input.cashBalance - agreedAmount;

  const { error: playerErr } = await supabase.from('players').insert({
    id: playerId,
    club_id: input.clubId,
    name: listing.name,
    shirt_number: shirt,
    pos: listing.pos,
    role: listing.role,
    starter: false,
    captain: false,
    age: listing.age,
    skill: listing.skill,
    status: 'READY',
    nationality: 'POL',
    version: 1,
    departed_at: null,
  } as never);

  if (playerErr) {
    return { ok: false, error: 'Nie udało się dodać zawodnika.' };
  }

  const { error: cashErr } = await supabase
    .from('clubs')
    .update({ cash_balance: nextCash } as never)
    .eq('id', input.clubId);

  if (cashErr) {
    await supabase
      .from('players')
      .update({
        status: 'DEPARTED',
        departed_at: new Date().toISOString(),
        starter: false,
      } as never)
      .eq('id', playerId)
      .eq('club_id', input.clubId);
    return { ok: false, error: 'Nie udało się zaktualizować kasy.' };
  }

  const { error: movErr } = await supabase.from('finance_movements').insert({
    club_id: input.clubId,
    category: 'transfer_buy',
    label: `Transfer: ${listing.name}`,
    amount: -agreedAmount,
    fixture_id: null,
  } as never);

  if (movErr) {
    return { ok: false, error: 'Zawodnik dodany, ale wpis finansowy nieudany — odśwież Finanse.' };
  }

  const { error: dealErr } = await supabase.from('transfer_deals').insert({
    club_id: input.clubId,
    kind: 'buy',
    player_id: playerId,
    market_id: input.marketId,
    amount: agreedAmount,
    idempotency_key: idempotencyKey,
    completed_at: new Date().toISOString(),
  } as never);

  if (dealErr && dealErr.code !== '23505') {
    return { ok: false, error: 'Transfer zapisany częściowo — sprawdź kadrę i finanse.' };
  }

  return { ok: true, playerId, amount: agreedAmount };
}

/**
 * Atomic sell settlement.
 * - instant: DEPARTED + credit (legacy Instant Sell / Incoming).
 * - live: credit + clear listed via shared RPC (no DEPARTED; id unchanged).
 */
export async function completeTransferSell(
  supabase: AppSupabase,
  input: InstantSellInput | LiveSellInput,
): Promise<CompleteSellResult> {
  if (input.source === 'live') {
    if (!input.transferWindowOpen) {
      return { ok: false, error: 'Okno transferowe jest zamknięte.' };
    }
    const fee = deriveTransferFee(input.playerSkill, input.playerAge);
    if (fee !== input.askSnapshot) {
      return { ok: false, error: 'Ask nieaktualny — odśwież Transfery.' };
    }
    if (input.agreedAmount !== input.askSnapshot) {
      return { ok: false, error: 'Live Sell wymaga 100% ask.' };
    }
    if (!isAllowedAgreedAmount(input.askSnapshot, input.agreedAmount)) {
      return { ok: false, error: 'Nieprawidłowa kwota sprzedaży.' };
    }
    if (input.clubId === input.buyerClubId) {
      return { ok: false, error: 'Nie możesz kupić własnego zawodnika.' };
    }

    return invokeLiveH2hRpc(supabase, {
      buyerClubId: input.buyerClubId,
      sellerClubId: input.clubId,
      playerId: input.playerId,
      askSnapshot: input.askSnapshot,
    });
  }

  if (!input.transferWindowOpen) {
    return { ok: false, error: 'Okno transferowe jest zamknięte.' };
  }
  if (input.activePlayers.length <= TRANSFERS_THIN.MIN_ROSTER) {
    return { ok: false, error: 'Nie można zejść poniżej 18 zawodników.' };
  }

  const player = input.activePlayers.find((p) => p.id === input.playerId);
  if (!player || player.departed_at) {
    return { ok: false, error: 'Nie znaleziono zawodnika w kadrze.' };
  }

  const isGk = player.pos === 'BR' || player.role === 'GK';
  const gkCount = input.activePlayers.filter((p) => p.pos === 'BR' || p.role === 'GK').length;
  if (isGk && gkCount <= 1) {
    return { ok: false, error: 'Nie możesz sprzedać ostatniego bramkarza.' };
  }

  const ask = deriveTransferFee(player.skill, player.age);
  if (!isAllowedAgreedAmount(ask, input.agreedAmount)) {
    return { ok: false, error: 'Nieprawidłowa kwota sprzedaży.' };
  }

  const agreedAmount = input.agreedAmount;
  const idempotencyKey = `sell:${input.playerId}`;

  const { data: existing } = await supabase
    .from('transfer_deals')
    .select('id, player_id, amount')
    .eq('club_id', input.clubId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existing) {
    const row = existing as { player_id: string; amount: number };
    return { ok: true, playerId: row.player_id, amount: row.amount };
  }

  const departedAt = new Date().toISOString();
  const { error: updErr } = await supabase
    .from('players')
    .update({
      status: 'DEPARTED',
      departed_at: departedAt,
      starter: false,
      captain: false,
      transfer_listed_at: null,
    } as never)
    .eq('id', input.playerId)
    .eq('club_id', input.clubId)
    .is('departed_at', null);

  if (updErr) {
    return { ok: false, error: 'Nie udało się oznaczyć odejścia zawodnika.' };
  }

  const nextCash = input.cashBalance + agreedAmount;
  const { error: cashErr } = await supabase
    .from('clubs')
    .update({ cash_balance: nextCash } as never)
    .eq('id', input.clubId);

  if (cashErr) {
    return { ok: false, error: 'Odejście zapisane, ale kasa nie zaktualizowana — odśwież.' };
  }

  await supabase.from('finance_movements').insert({
    club_id: input.clubId,
    category: 'transfer_sell',
    label: `Sprzedaż: ${player.name}`,
    amount: agreedAmount,
    fixture_id: null,
  } as never);

  const { error: dealErr } = await supabase.from('transfer_deals').insert({
    club_id: input.clubId,
    kind: 'sell',
    player_id: input.playerId,
    market_id: null,
    amount: agreedAmount,
    idempotency_key: idempotencyKey,
    completed_at: departedAt,
  } as never);

  if (dealErr && dealErr.code !== '23505') {
    return { ok: false, error: 'Sprzedaż częściowa — sprawdź kadrę i finanse.' };
  }

  return { ok: true, playerId: input.playerId, amount: agreedAmount };
}
