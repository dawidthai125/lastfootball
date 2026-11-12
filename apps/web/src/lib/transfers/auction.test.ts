import { describe, expect, it } from 'vitest';

import {
  AUCTION_THIN,
  highBid,
  placeBid,
  settleAuction,
  withdrawAuction,
  type AuctionBook,
} from '@/lib/transfers/auction';

const ASK = 50_000;

function openBook(overrides: Partial<AuctionBook> = {}): AuctionBook {
  return {
    sellerClubId: 'seller',
    ask: ASK,
    bids: [],
    status: 'open',
    ...overrides,
  };
}

describe('manager auction book', () => {
  it('rejects a bid below the ask', () => {
    const result = placeBid(openBook(), { clubId: 'a', amount: ASK - 1, cash: 1_000_000 });
    expect(result).toEqual({ ok: false, reason: 'low' });
  });

  it('rejects a raise smaller than STEP and accepts exactly STEP', () => {
    const first = placeBid(openBook(), { clubId: 'a', amount: ASK, cash: 1_000_000 });
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const short = placeBid(first.book, {
      clubId: 'a',
      amount: ASK + AUCTION_THIN.STEP - 1,
      cash: 1_000_000,
    });
    expect(short).toEqual({ ok: false, reason: 'step' });

    const exact = placeBid(first.book, {
      clubId: 'a',
      amount: ASK + AUCTION_THIN.STEP,
      cash: 1_000_000,
    });
    expect(exact.ok).toBe(true);
    if (!exact.ok) return;
    expect(exact.book.bids).toEqual([
      { clubId: 'a', amount: ASK },
      { clubId: 'a', amount: ASK + AUCTION_THIN.STEP },
    ]);
    expect(exact.book.ask).toBe(ASK);
    expect(exact.book.sellerClubId).toBe('seller');
    expect(highBid(exact.book)).toEqual({ clubId: 'a', amount: ASK + AUCTION_THIN.STEP });
    expect(first.book.bids).toHaveLength(1);
  });

  it('rejects a bid from the seller', () => {
    const result = placeBid(openBook(), { clubId: 'seller', amount: ASK, cash: 1_000_000 });
    expect(result).toEqual({ ok: false, reason: 'seller' });
  });

  it('rejects when cash is short and when cash is zero', () => {
    const short = placeBid(openBook(), { clubId: 'a', amount: ASK, cash: ASK - 1 });
    expect(short).toEqual({ ok: false, reason: 'cash' });

    const zero = placeBid(openBook(), { clubId: 'a', amount: ASK, cash: 0 });
    expect(zero).toEqual({ ok: false, reason: 'cash' });

    const exactCash = placeBid(openBook(), { clubId: 'a', amount: ASK, cash: ASK });
    expect(exactCash.ok).toBe(true);
  });

  it('lets a second club outbid and settle takes the highest amount', () => {
    const first = placeBid(openBook(), { clubId: 'a', amount: ASK, cash: 1_000_000 });
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = placeBid(first.book, {
      clubId: 'b',
      amount: ASK + AUCTION_THIN.STEP,
      cash: 1_000_000,
    });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(highBid(second.book)?.clubId).toBe('b');

    const settled = settleAuction(second.book);
    expect(settled).toEqual({
      ok: true,
      winnerClubId: 'b',
      amount: ASK + AUCTION_THIN.STEP,
      book: {
        sellerClubId: 'seller',
        ask: ASK,
        status: 'settled',
        bids: [
          { clubId: 'a', amount: ASK },
          { clubId: 'b', amount: ASK + AUCTION_THIN.STEP },
        ],
      },
    });
  });

  it('refuses to settle an empty book', () => {
    expect(settleAuction(openBook())).toEqual({ ok: false, reason: 'empty' });
    expect(highBid(openBook())).toBeNull();
  });

  it('rejects a bid after withdraw', () => {
    const opened = placeBid(openBook(), { clubId: 'a', amount: ASK, cash: ASK });
    expect(opened.ok).toBe(true);
    if (!opened.ok) return;

    const withdrawn = withdrawAuction(opened.book);
    expect(withdrawn.ok).toBe(true);
    if (!withdrawn.ok) return;
    expect(withdrawn.book.status).toBe('withdrawn');
    expect(withdrawn.book.bids).toEqual(opened.book.bids);

    const after = placeBid(withdrawn.book, {
      clubId: 'b',
      amount: ASK + AUCTION_THIN.STEP,
      cash: 1_000_000,
    });
    expect(after).toEqual({ ok: false, reason: 'closed' });
    expect(settleAuction(withdrawn.book)).toEqual({ ok: false, reason: 'closed' });
    expect(withdrawAuction(withdrawn.book)).toEqual({ ok: false, reason: 'closed' });
  });

  it('rejects a fractional amount', () => {
    const fraction = placeBid(openBook(), { clubId: 'a', amount: ASK + 0.5, cash: 1_000_000 });
    expect(fraction).toEqual({ ok: false, reason: 'amount' });

    const nan = placeBid(openBook(), { clubId: 'a', amount: Number.NaN, cash: 1_000_000 });
    expect(nan).toEqual({ ok: false, reason: 'amount' });

    const nonPositive = placeBid(openBook(), { clubId: 'a', amount: 0, cash: 1_000_000 });
    expect(nonPositive).toEqual({ ok: false, reason: 'amount' });
  });
});
