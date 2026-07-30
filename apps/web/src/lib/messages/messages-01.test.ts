import { describe, expect, it } from 'vitest';

import { resolveClubMessages } from '@/lib/messages/resolve-club-messages';

describe('resolveClubMessages (LFE-MESSAGES-01)', () => {
  it('returns empty when no domain facts', () => {
    const dto = resolveClubMessages({
      transferWindowOpen: false,
      incomingOffers: [],
      incomingLiveOffers: [],
      outgoingLiveOffers: [],
    });
    expect(dto.items).toEqual([]);
  });

  it('E1: transfer window open → system info → /transfers', () => {
    const dto = resolveClubMessages({
      transferWindowOpen: true,
      incomingOffers: [],
      incomingLiveOffers: [],
      outgoingLiveOffers: [],
    });
    expect(dto.items).toHaveLength(1);
    expect(dto.items[0]).toMatchObject({
      id: 'msg:transfer-window',
      kind: 'system',
      priority: 'info',
      href: '/transfers',
      fromLabel: 'System',
    });
  });

  it('E2: incoming AI offers → one offer_brief decision', () => {
    const dto = resolveClubMessages({
      transferWindowOpen: false,
      incomingOffers: [
        { offerId: 'in-1', playerName: 'A. One' },
        { offerId: 'in-2', playerName: 'B. Two' },
      ],
      incomingLiveOffers: [],
      outgoingLiveOffers: [],
    });
    expect(dto.items).toHaveLength(1);
    expect(dto.items[0]).toMatchObject({
      id: 'msg:incoming-offers',
      kind: 'offer_brief',
      priority: 'decision',
      href: '/transfers',
      fromLabel: 'Transfery',
    });
    expect(dto.items[0]!.subject).toContain('2');
  });

  it('E3: seller opening + buyer countered only; stable ids; sorted by offerId', () => {
    const dto = resolveClubMessages({
      transferWindowOpen: false,
      incomingOffers: [],
      incomingLiveOffers: [
        {
          offerId: 'b-offer',
          playerName: 'Seller Case',
          phase: 'opening',
          status: 'pending',
          side: 'incoming',
        },
        {
          offerId: 'skip-countered-seller',
          playerName: 'Skip',
          phase: 'countered',
          status: 'pending',
          side: 'incoming',
        },
      ],
      outgoingLiveOffers: [
        {
          offerId: 'a-offer',
          playerName: 'Buyer Case',
          phase: 'countered',
          status: 'pending',
          side: 'outgoing',
        },
        {
          offerId: 'skip-opening-buyer',
          playerName: 'Skip2',
          phase: 'opening',
          status: 'pending',
          side: 'outgoing',
        },
      ],
    });
    expect(dto.items.map((i) => i.id)).toEqual(['msg:h2h:a-offer:buyer', 'msg:h2h:b-offer:seller']);
    expect(dto.items.every((i) => i.priority === 'decision' && i.href === '/transfers')).toBe(true);
  });

  it('order: E3 decision → E2 decision → E1 info (resolver owns order)', () => {
    const dto = resolveClubMessages({
      transferWindowOpen: true,
      incomingOffers: [{ offerId: 'in-1', playerName: 'X' }],
      incomingLiveOffers: [
        {
          offerId: 'h1',
          playerName: 'Y',
          phase: 'opening',
          status: 'pending',
          side: 'incoming',
        },
      ],
      outgoingLiveOffers: [],
    });
    expect(dto.items.map((i) => i.id)).toEqual([
      'msg:h2h:h1:seller',
      'msg:incoming-offers',
      'msg:transfer-window',
    ]);
  });

  it('ignores non-pending H2H', () => {
    const dto = resolveClubMessages({
      transferWindowOpen: false,
      incomingOffers: [],
      incomingLiveOffers: [
        {
          offerId: 'done',
          playerName: 'Z',
          phase: 'opening',
          status: 'accepted',
          side: 'incoming',
        },
      ],
      outgoingLiveOffers: [],
    });
    expect(dto.items).toEqual([]);
  });

  it('identical input → identical output (pure)', () => {
    const input = {
      transferWindowOpen: true,
      incomingOffers: [{ offerId: 'in-1', playerName: 'A' }],
      incomingLiveOffers: [] as const,
      outgoingLiveOffers: [] as const,
    };
    expect(resolveClubMessages(input)).toEqual(resolveClubMessages(input));
  });
});
