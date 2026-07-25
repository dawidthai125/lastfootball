import { describe, expect, it } from 'vitest';

import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import {
  isAllowedAgreedAmount,
  resolveCounterAmount,
  resolveOfferAmount,
} from '@/lib/transfers/resolve-negotiation';
import { resolveLiveH2hOffers } from '@/lib/transfers/resolve-live-h2h-offers';
import { resolveTransferMarket } from '@/lib/transfers/resolve-transfer-market';
import { buildStarterPlayerInserts } from '@/lib/squad/build-player-inserts';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';

describe('live H2H counter offers Thin (LFE-TRANSFERS-08)', () => {
  const clubId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

  it('DTO maps current_amount as settle amount; opening_amount stays separate', () => {
    const ask = deriveTransferFee(60, 24);
    const opening = resolveOfferAmount(ask, 'low');
    const countered = resolveCounterAmount(ask);
    const dto = resolveLiveH2hOffers(
      [
        {
          id: 'off-1',
          player_id: 'p1',
          seller_club_id: 's1',
          buyer_club_id: 'b1',
          current_amount: countered,
          opening_amount: opening,
          ask_at_create: ask,
          phase: 'countered',
          last_actor: 'seller',
          status: 'pending',
          created_at: '2026-01-01T00:00:00.000Z',
          player_name: 'P. One',
          pos: 'ŚP',
          counterpart_label: 'BUY',
        },
      ],
      'incoming',
    )[0]!;
    expect(dto.openingAmount).toBe(opening);
    expect(dto.amount).toBe(countered);
    expect(dto.phase).toBe('countered');
    expect(dto.lastActor).toBe('seller');
  });

  it('after counter mapping opening_amount ≠ current_amount when seller counters up', () => {
    const ask = deriveTransferFee(55, 21);
    const opening = resolveOfferAmount(ask, 'low');
    const counterAmt = resolveOfferAmount(ask, 'high');
    expect(opening).not.toBe(counterAmt);
    const dto = resolveLiveH2hOffers(
      [
        {
          id: 'off-2',
          player_id: 'p2',
          seller_club_id: 's1',
          buyer_club_id: 'b1',
          current_amount: counterAmt,
          opening_amount: opening,
          ask_at_create: ask,
          phase: 'countered',
          last_actor: 'seller',
          status: 'pending',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
      'outgoing',
    )[0]!;
    expect(dto.openingAmount).toBe(opening);
    expect(dto.amount).toBe(counterAmt);
  });

  it('Counter/Accept amounts must be on full NEGOTIATION_THIN allow-list vs ask', () => {
    const ask = deriveTransferFee(61, 22);
    for (const preset of ['low', 'normal', 'high'] as const) {
      expect(isAllowedAgreedAmount(ask, resolveOfferAmount(ask, preset))).toBe(true);
    }
    expect(isAllowedAgreedAmount(ask, resolveCounterAmount(ask))).toBe(true);
    expect(isAllowedAgreedAmount(ask, ask + 1)).toBe(false);
  });

  it('resolveTransferMarket exposes phase on H2H offers', () => {
    const rows = buildStarterPlayerInserts(clubId).map((r) =>
      mapPlayerRow({
        id: r.id,
        club_id: r.club_id,
        name: r.name,
        shirt_number: r.shirt_number,
        pos: r.pos,
        role: r.role,
        starter: r.starter,
        captain: r.captain,
        age: r.age,
        skill: r.skill,
        status: r.status,
        nationality: r.nationality,
        version: r.version,
        departed_at: null,
      } satisfies PlayerDbRow),
    );
    const ask = deriveTransferFee(50, 25);
    const amount = resolveOfferAmount(ask, 'normal');
    const offer = resolveLiveH2hOffers(
      [
        {
          id: 'off-x',
          player_id: 'px',
          seller_club_id: clubId,
          buyer_club_id: 'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee',
          current_amount: amount,
          opening_amount: amount,
          ask_at_create: ask,
          phase: 'opening',
          last_actor: 'buyer',
          status: 'pending',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
      'incoming',
    );
    const market = resolveTransferMarket({
      clubId,
      cashBalance: 500_000,
      transferWindowOpen: true,
      activePlayers: rows,
      incomingLiveOffers: offer,
      outgoingLiveOffers: [],
    });
    expect(market.incomingLiveOffers[0]!.phase).toBe('opening');
  });
});
