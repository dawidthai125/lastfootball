import { retryDeadlock } from '@/lib/supabase/retry-deadlock';
import { aiSaleAsk } from '@/lib/transfers/fair-sale';
import { serverDb, tryAdminClient } from '@/lib/supabase/admin';
import { creditClubCash } from '@/lib/finance/club-cash';
import { OPEN_MATCH_PLAYER_ERROR, playsInOpenMatch } from '@/lib/match/kickoff-store';
import { freeShirt } from '@/lib/squad/free-shirt';
import { resolvePlayerPotential } from '@/lib/squad/potential';
import type { createClient } from '@/lib/supabase/server';
import { resolveTransferEnvelope } from '@/lib/finance/resolve-transfer-envelope';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { marketFee } from '@/lib/transfers/market-fee';
import { AUCTION_OPEN } from '@/lib/transfers/auction';
import { hasOpenAuction } from '@/lib/transfers/load-auctions';
import { isAllowedAgreedAmount } from '@/lib/transfers/resolve-negotiation';
import { boughtPlayerId, seedTransferCatalogue } from '@/lib/transfers/seed-catalogue';
import { TRANSFERS_THIN } from '@/lib/transfers/types';

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

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
  origin?: string | null;
  seniorMatches?: number;
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
  /** Current deriveTransferFee — only for Thin allow-list validation. */
  currentAsk: number;
  /** Settlement amount (Instant 100% or pending offer.amount). */
  agreedAmount: number;
  activePlayers: readonly ActivePlayer[];
  /** When set: Accept path (seller auth); marks offer accepted in same TX. */
  acceptOfferId?: string;
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
  currentAsk: number;
  agreedAmount: number;
  playerSkill: number;
  playerAge: number;
  acceptOfferId?: string;
};

type LiveRpcResult = {
  ok?: boolean;
  error?: string;
  player_id?: string;
  amount?: number;
};

/**
 * Invokes atomic DB Live H2H settlement (security definer RPC).
 * Not exported — buy/sell remain the only settlement entry points (Single Settlement Path).
 * Live Instant/Accept: one call into buy or sell → one RPC invoke (LFE-TRANSFERS-09 TD-02).
 */
async function invokeLiveH2hRpc(
  supabase: AppSupabase,
  input: {
    buyerClubId: string;
    sellerClubId: string;
    playerId: string;
    agreedAmount: number;
    acceptOfferId?: string;
  },
): Promise<CompleteBuyResult> {
  const { data, error } = await retryDeadlock(() =>
    supabase.rpc(
      'complete_live_h2h_transfer' as never,
      {
        p_buyer_club_id: input.buyerClubId,
        p_seller_club_id: input.sellerClubId,
        p_player_id: input.playerId,
        p_agreed_amount: input.agreedAmount,
        p_accept_offer_id: input.acceptOfferId ?? null,
      } as never,
    ),
  );

  if (error) {
    console.error('complete_live_h2h_transfer failed', { code: error.code });
    return {
      ok: false,
      error: 'Transfer nie doszedł do skutku. Odśwież stronę i spróbuj ponownie.',
    };
  }

  const row = data as LiveRpcResult | null;
  if (!row || row.ok !== true || !row.player_id || typeof row.amount !== 'number') {
    return { ok: false, error: row?.error || 'Transfer nie doszedł do skutku.' };
  }

  return { ok: true, playerId: row.player_id, amount: row.amount };
}

const SELL_NOT_SAVED = 'Nie udało się rozliczyć sprzedaży. Spróbuj ponownie.';

const SELL_ERRORS: Readonly<Record<string, string>> = {
  window: 'Okno transferowe jest zamknięte.',
  player: 'Nie znaleziono zawodnika w kadrze.',
  auction: AUCTION_OPEN,
  roster: 'Kadra nie może zejść poniżej 18 zawodników, licząc trwające licytacje.',
  keeper: 'Nie możesz sprzedać ostatniego bramkarza.',
};

const BUY_NOT_SAVED = 'Nie udało się zapisać transferu. Spróbuj ponownie.';

const BUY_ERRORS: Readonly<Record<string, string>> = {
  window: 'Okno transferowe jest zamknięte.',
  cash: 'Za mało środków w budżecie transferowym / kasie.',
  roster: 'Kadra jest pełna (max 22).',
};

/**
 * Atomic buy settlement.
 * - seed: insert t-{tag}- player from catalogue.
 * - live: H2H Instant or Accept via shared RPC (players.id unchanged; supersedes pending).
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
    if (!isAllowedAgreedAmount(input.currentAsk, input.agreedAmount)) {
      return { ok: false, error: 'Nieprawidłowa kwota negocjacji.' };
    }
    const envelope = resolveTransferEnvelope(input.cashBalance);
    if (input.cashBalance < input.agreedAmount || envelope.envelopeBalance < input.agreedAmount) {
      return { ok: false, error: 'Za mało środków w budżecie transferowym / kasie.' };
    }

    if (await hasOpenAuction(input.playerId)) return { ok: false, error: AUCTION_OPEN };
    return invokeLiveH2hRpc(supabase, {
      buyerClubId: input.clubId,
      sellerClubId: input.sellerClubId,
      playerId: input.playerId,
      agreedAmount: input.agreedAmount,
      acceptOfferId: input.acceptOfferId,
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

  const ask = marketFee(listing.skill, listing.age, listing.clubLabel);
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

  const { data: departedRows, error: rowsErr } = await supabase
    .from('players')
    .select('id, shirt_number, departed_at')
    .eq('club_id', input.clubId);
  if (rowsErr || !departedRows) return { ok: false, error: 'Nie udało się odczytać kadry.' };

  const everyRow = departedRows as {
    id: string;
    shirt_number: number;
    departed_at: string | null;
  }[];
  const playerId = boughtPlayerId(input.marketId);
  const shirt = freeShirt(everyRow);
  if (shirt == null) return { ok: false, error: 'Brak wolnego numeru koszulki.' };

  // One transaction under the club lock: a second request finds the deal and pays nothing.
  const admin = tryAdminClient();
  if (!admin) return { ok: false, error: BUY_NOT_SAVED };
  const { data, error } = await admin.rpc(
    'buy_market_player' as never,
    {
      p_club_id: input.clubId,
      p_market_id: input.marketId,
      p_amount: agreedAmount,
      p_max_roster: TRANSFERS_THIN.MAX_ROSTER,
      p_player: {
        id: playerId,
        name: listing.name,
        shirt_number: shirt,
        pos: listing.pos,
        role: listing.role,
        age: listing.age,
        skill: listing.skill,
        potential: resolvePlayerPotential(listing.skill, playerId, listing.age),
      },
    } as never,
  );
  const row = data as {
    ok?: boolean;
    reason?: string;
    player_id?: string;
    amount?: number;
  } | null;
  if (error || !row) {
    console.error('completeTransferBuy failed', { code: error?.code });
    return { ok: false, error: BUY_NOT_SAVED };
  }
  if (row.ok !== true || !row.player_id || typeof row.amount !== 'number') {
    return { ok: false, error: BUY_ERRORS[row.reason ?? ''] ?? BUY_NOT_SAVED };
  }
  return { ok: true, playerId: row.player_id, amount: row.amount };
}

/**
 * Atomic sell settlement.
 * - instant: DEPARTED + credit (legacy Instant Sell / Incoming).
 * - live: H2H Instant or Accept via shared RPC (no DEPARTED; id unchanged).
 */
export async function completeTransferSell(
  supabase: AppSupabase,
  input: InstantSellInput | LiveSellInput,
): Promise<CompleteSellResult> {
  if (await playsInOpenMatch(input.clubId, input.playerId)) {
    return { ok: false, error: OPEN_MATCH_PLAYER_ERROR };
  }
  if (input.source === 'live') {
    if (!input.transferWindowOpen) {
      return { ok: false, error: 'Okno transferowe jest zamknięte.' };
    }
    const fee = deriveTransferFee(input.playerSkill, input.playerAge);
    if (fee !== input.currentAsk) {
      return { ok: false, error: 'Ask nieaktualny — odśwież Transfery.' };
    }
    if (!isAllowedAgreedAmount(input.currentAsk, input.agreedAmount)) {
      return { ok: false, error: 'Nieprawidłowa kwota sprzedaży.' };
    }
    if (input.clubId === input.buyerClubId) {
      return { ok: false, error: 'Nie możesz kupić własnego zawodnika.' };
    }

    if (await hasOpenAuction(input.playerId)) return { ok: false, error: AUCTION_OPEN };
    return invokeLiveH2hRpc(supabase, {
      buyerClubId: input.buyerClubId,
      sellerClubId: input.clubId,
      playerId: input.playerId,
      agreedAmount: input.agreedAmount,
      acceptOfferId: input.acceptOfferId,
    });
  }

  if (!input.transferWindowOpen) {
    return { ok: false, error: 'Okno transferowe jest zamknięte.' };
  }
  const player = input.activePlayers.find((p) => p.id === input.playerId);
  if (!player || player.departed_at) {
    return { ok: false, error: 'Nie znaleziono zawodnika w kadrze.' };
  }

  const ask = aiSaleAsk(player);
  if (!isAllowedAgreedAmount(ask, input.agreedAmount)) {
    return { ok: false, error: 'Nieprawidłowa kwota sprzedaży.' };
  }

  const admin = tryAdminClient();
  if (!admin) return { ok: false, error: SELL_NOT_SAVED };
  const { data, error } = await retryDeadlock(() =>
    admin.rpc(
      'sell_market_player' as never,
      {
        p_club_id: input.clubId,
        p_player_id: input.playerId,
        p_amount: input.agreedAmount,
        p_min_roster: TRANSFERS_THIN.MIN_ROSTER,
      } as never,
    ),
  );
  const row = data as { ok?: boolean; reason?: string; amount?: number } | null;
  if (error || !row) {
    console.error('completeTransferSell failed', { code: error?.code });
    return { ok: false, error: SELL_NOT_SAVED };
  }
  if (row.ok !== true || typeof row.amount !== 'number') {
    return { ok: false, error: SELL_ERRORS[row.reason ?? ''] ?? SELL_NOT_SAVED };
  }
  return { ok: true, playerId: input.playerId, amount: row.amount };
}
