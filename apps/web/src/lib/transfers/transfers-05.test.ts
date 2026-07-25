import { describe, expect, it } from 'vitest';

import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import {
  resolveIncomingAiPreset,
  resolveIncomingOffers,
} from '@/lib/transfers/resolve-incoming-offers';
import {
  isAllowedAgreedAmount,
  NEGOTIATION_THIN,
  resolveCounterAmount,
  resolveOfferAmount,
} from '@/lib/transfers/resolve-negotiation';
import { resolveSellerNegotiationStep } from '@/lib/transfers/resolve-seller-negotiation';
import { buildStarterPlayerInserts } from '@/lib/squad/build-player-inserts';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';

describe('seller negotiation Thin (LFE-TRANSFERS-05)', () => {
  const ask = 1_000_000;

  it('NEGOTIATION_THIN percentages match Thin contract', () => {
    expect(NEGOTIATION_THIN.PRESET_LOW_PCT).toBe(90);
    expect(NEGOTIATION_THIN.PRESET_NORMAL_PCT).toBe(100);
    expect(NEGOTIATION_THIN.PRESET_HIGH_PCT).toBe(110);
    expect(NEGOTIATION_THIN.COUNTER_PCT).toBe(95);
  });

  it('opening Accept → AI offer amount; Reject → rejected', () => {
    for (const aiPreset of ['low', 'normal', 'high'] as const) {
      const offer = resolveOfferAmount(ask, aiPreset);
      expect(
        resolveSellerNegotiationStep({
          ask,
          phase: 'opening',
          aiPreset,
          playerAction: 'accept',
        }),
      ).toEqual({ kind: 'accepted', agreedAmount: offer });
      expect(
        resolveSellerNegotiationStep({
          ask,
          phase: 'opening',
          aiPreset,
          playerAction: 'reject',
        }),
      ).toEqual({ kind: 'rejected' });
    }
  });

  it('Counter only vs AI Low → 95% ask; otherwise rejected', () => {
    expect(
      resolveSellerNegotiationStep({
        ask,
        phase: 'opening',
        aiPreset: 'low',
        playerAction: 'counter',
      }),
    ).toEqual({ kind: 'counter', counterAmount: resolveCounterAmount(ask) });

    for (const aiPreset of ['normal', 'high'] as const) {
      expect(
        resolveSellerNegotiationStep({
          ask,
          phase: 'opening',
          aiPreset,
          playerAction: 'counter',
        }),
      ).toEqual({ kind: 'rejected' });
    }
  });

  it('counter phase Accept → 95% ask; Reject → rejected', () => {
    expect(
      resolveSellerNegotiationStep({
        ask,
        phase: 'counter',
        playerAction: 'accept',
      }),
    ).toEqual({ kind: 'accepted', agreedAmount: resolveCounterAmount(ask) });
    expect(
      resolveSellerNegotiationStep({
        ask,
        phase: 'counter',
        playerAction: 'reject',
      }),
    ).toEqual({ kind: 'rejected' });
  });

  it('identical input → identical output (pure, no RNG/time)', () => {
    const input = {
      ask,
      phase: 'opening' as const,
      aiPreset: 'low' as const,
      playerAction: 'counter' as const,
    };
    expect(resolveSellerNegotiationStep(input)).toEqual(resolveSellerNegotiationStep({ ...input }));
  });

  it('accepted amounts are always on allow-list vs ask', () => {
    const cases = [
      resolveSellerNegotiationStep({
        ask,
        phase: 'opening',
        aiPreset: 'low',
        playerAction: 'accept',
      }),
      resolveSellerNegotiationStep({
        ask,
        phase: 'opening',
        aiPreset: 'normal',
        playerAction: 'accept',
      }),
      resolveSellerNegotiationStep({
        ask,
        phase: 'opening',
        aiPreset: 'high',
        playerAction: 'accept',
      }),
      resolveSellerNegotiationStep({
        ask,
        phase: 'counter',
        playerAction: 'accept',
      }),
    ];
    for (const step of cases) {
      expect(step.kind).toBe('accepted');
      if (step.kind === 'accepted') {
        expect(isAllowedAgreedAmount(ask, step.agreedAmount)).toBe(true);
      }
    }
  });

  it('Instant Sell path uses 100% ask (normal) — allow-listed', () => {
    const fee = deriveTransferFee(60, 22);
    expect(isAllowedAgreedAmount(fee, fee)).toBe(true);
    expect(fee).toBe(resolveOfferAmount(fee, 'normal'));
  });

  it('incoming opening amount = resolveOfferAmount(ask, aiPreset); ask = deriveTransferFee', () => {
    const clubId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const rows = [
      ...buildStarterPlayerInserts(clubId).map((r) =>
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
      ),
      mapPlayerRow({
        id: 't-s2-listed',
        club_id: clubId,
        name: 'S. Two',
        shirt_number: 21,
        pos: 'ŚP',
        role: 'CM',
        starter: false,
        captain: false,
        age: 24,
        skill: 61,
        status: 'READY',
        nationality: 'POL',
        version: 1,
        departed_at: null,
        transfer_listed_at: '2026-01-01T00:00:00.000Z',
      }),
    ];
    const offers = resolveIncomingOffers({
      clubId,
      transferWindowOpen: true,
      activePlayers: rows,
    });
    expect(offers.length).toBeGreaterThan(0);
    for (const o of offers) {
      expect(o.ask).toBe(deriveTransferFee(61, 24));
      expect(o.aiPreset).toBe(resolveIncomingAiPreset(clubId, o.playerId));
      expect(o.amount).toBe(resolveOfferAmount(o.ask, o.aiPreset));
      expect(o.canCounter).toBe(o.aiPreset === 'low');
    }
  });
});
