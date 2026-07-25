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

describe('live H2H pending offers Thin (LFE-TRANSFERS-07)', () => {
  const clubId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

  it('offer snapshots stay as mapped (immutable DTO fields)', () => {
    const askAtCreate = deriveTransferFee(60, 24);
    const amount = resolveOfferAmount(askAtCreate, 'low');
    const rows = [
      {
        id: 'off-1',
        player_id: 'p1',
        seller_club_id: 's1',
        buyer_club_id: 'b1',
        current_amount: amount,
        opening_amount: amount,
        ask_at_create: askAtCreate,
        phase: 'opening',
        last_actor: 'buyer',
        status: 'pending',
        created_at: '2026-01-01T00:00:00.000Z',
        player_name: 'P. One',
        pos: 'ŚP',
        counterpart_label: 'BUY',
      },
    ];
    const a = resolveLiveH2hOffers(rows, 'incoming');
    const b = resolveLiveH2hOffers(rows, 'incoming');
    expect(a).toEqual(b);
    expect(a[0]!.amount).toBe(amount);
    expect(a[0]!.openingAmount).toBe(amount);
    expect(a[0]!.askAtCreate).toBe(askAtCreate);
  });

  it('Accept validation: amount must stay on NEGOTIATION_THIN allow-list vs re-derived ask', () => {
    const ask = deriveTransferFee(61, 22);
    for (const preset of ['low', 'normal', 'high'] as const) {
      expect(isAllowedAgreedAmount(ask, resolveOfferAmount(ask, preset))).toBe(true);
    }
    expect(isAllowedAgreedAmount(ask, resolveCounterAmount(ask))).toBe(true);
    expect(isAllowedAgreedAmount(ask, ask + 1)).toBe(false);
  });

  it('resolveTransferMarket exposes incoming/outgoing H2H offer slots', () => {
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
    const offer = resolveLiveH2hOffers(
      [
        {
          id: 'off-x',
          player_id: 'px',
          seller_club_id: clubId,
          buyer_club_id: 'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee',
          current_amount: 100_000,
          opening_amount: 100_000,
          ask_at_create: 100_000,
          phase: 'opening',
          last_actor: 'buyer',
          status: 'pending',
          created_at: '2026-01-01T00:00:00.000Z',
          player_name: 'X',
          pos: 'N',
          counterpart_label: 'B',
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
    expect(market.incomingLiveOffers).toHaveLength(1);
    expect(market.outgoingLiveOffers).toHaveLength(0);
    expect(market.liveListings).toEqual([]);
  });
});
