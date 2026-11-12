/**
 * Manager-to-manager auction book.
 * Bid amounts are a separate path from negotiation presets
 * (not listAllowedAgreedAmounts). The winning amount is the only
 * settlement figure; the caller wires it into completeTransferBuy.
 * Cash is checked only — the wallet is not mutated here.
 */
export const AUCTION_THIN = { STEP: 1_000 } as const;

export type AuctionBid = { readonly clubId: string; readonly amount: number };

export type AuctionBook = {
  readonly sellerClubId: string;
  readonly ask: number;
  readonly bids: readonly AuctionBid[];
  readonly status: 'open' | 'settled' | 'withdrawn';
};

/** Last accepted bid. Valid bids are strictly increasing, so it is the high bid. */
export function highBid(book: AuctionBook): AuctionBid | null {
  if (book.bids.length === 0) return null;
  return book.bids[book.bids.length - 1] ?? null;
}

function isPositiveInteger(amount: number): boolean {
  return Number.isFinite(amount) && Number.isInteger(amount) && amount > 0;
}

export function placeBid(
  book: AuctionBook,
  input: { readonly clubId: string; readonly amount: number; readonly cash: number },
):
  | { ok: true; book: AuctionBook }
  | { ok: false; reason: 'seller' | 'closed' | 'low' | 'step' | 'cash' | 'amount' } {
  if (book.status !== 'open') {
    return { ok: false, reason: 'closed' };
  }
  if (input.clubId === book.sellerClubId) {
    return { ok: false, reason: 'seller' };
  }
  if (!isPositiveInteger(input.amount)) {
    return { ok: false, reason: 'amount' };
  }
  if (input.amount < book.ask) {
    return { ok: false, reason: 'low' };
  }
  const leading = highBid(book);
  if (leading !== null && input.amount < leading.amount + AUCTION_THIN.STEP) {
    return { ok: false, reason: 'step' };
  }
  if (input.amount > input.cash) {
    return { ok: false, reason: 'cash' };
  }

  const bid: AuctionBid = { clubId: input.clubId, amount: input.amount };
  return {
    ok: true,
    book: {
      sellerClubId: book.sellerClubId,
      ask: book.ask,
      status: 'open',
      bids: [...book.bids, bid],
    },
  };
}

export function settleAuction(
  book: AuctionBook,
):
  | { ok: true; winnerClubId: string; amount: number; book: AuctionBook }
  | { ok: false; reason: 'closed' | 'empty' } {
  if (book.status !== 'open') {
    return { ok: false, reason: 'closed' };
  }
  const winner = highBid(book);
  if (winner === null) {
    return { ok: false, reason: 'empty' };
  }
  return {
    ok: true,
    winnerClubId: winner.clubId,
    amount: winner.amount,
    book: {
      sellerClubId: book.sellerClubId,
      ask: book.ask,
      bids: book.bids,
      status: 'settled',
    },
  };
}

export function withdrawAuction(
  book: AuctionBook,
): { ok: true; book: AuctionBook } | { ok: false; reason: 'closed' } {
  if (book.status !== 'open') {
    return { ok: false, reason: 'closed' };
  }
  return {
    ok: true,
    book: {
      sellerClubId: book.sellerClubId,
      ask: book.ask,
      bids: book.bids,
      status: 'withdrawn',
    },
  };
}
