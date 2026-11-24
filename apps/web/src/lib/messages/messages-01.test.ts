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

  it('board task note → board info → /board', () => {
    const dto = resolveClubMessages({
      transferWindowOpen: false,
      incomingOffers: [],
      incomingLiveOffers: [],
      outgoingLiveOffers: [],
      boardTaskNote: 'Zadanie zarządu wykonane.',
    });
    expect(dto.items).toMatchObject([
      { id: 'msg:board-task', priority: 'info', href: '/board', fromLabel: 'Zarząd' },
    ]);
  });

  it('wage note → board info → /finance', () => {
    const dto = resolveClubMessages({
      transferWindowOpen: false,
      incomingOffers: [],
      incomingLiveOffers: [],
      outgoingLiveOffers: [],
      wageNote: 'Kasa nie pokryła pensji.',
    });
    expect(dto.items).toMatchObject([
      { id: 'msg:wages', priority: 'info', href: '/finance', fromLabel: 'Zarząd' },
    ]);
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
      transferWindowOpen: true,
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
    const decisions = dto.items.filter((i) => i.priority === 'decision');
    expect(decisions.map((i) => i.id)).toEqual(['msg:h2h:a-offer:buyer', 'msg:h2h:b-offer:seller']);
    expect(decisions.every((i) => i.href === '/transfers')).toBe(true);
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

  it('seasonDeparture → system info toward /hub', () => {
    const summary =
      'Przy potwierdzeniu startu N+1 Słaby Weteran (lat 40) kończy karierę. Z akademii wchodzi A Youth.';
    const dto = resolveClubMessages({
      transferWindowOpen: false,
      incomingOffers: [],
      incomingLiveOffers: [],
      outgoingLiveOffers: [],
      seasonDeparture: { summary },
    });
    expect(dto.items).toHaveLength(1);
    expect(dto.items[0]).toMatchObject({
      id: 'msg:season-departure',
      kind: 'system',
      priority: 'info',
      href: '/hub',
      fromLabel: 'Zarząd',
    });
    expect(dto.items[0]!.subject.length).toBeLessThanOrEqual(80);
    expect(dto.items[0]!.subject).toContain('Słaby Weteran');
  });

  it('retirementFarewell → system info toward /hub', () => {
    const dto = resolveClubMessages({
      transferWindowOpen: false,
      incomingOffers: [],
      incomingLiveOffers: [],
      outgoingLiveOffers: [],
      retirementFarewell: {
        subject: 'Słaby Weteran zakończył karierę · wchodzi A Youth',
      },
    });
    expect(dto.items).toHaveLength(1);
    expect(dto.items[0]).toMatchObject({
      id: 'msg:retirement-farewell',
      kind: 'system',
      priority: 'info',
      href: '/hub',
      fromLabel: 'Zarząd',
      subject: 'Słaby Weteran zakończył karierę · wchodzi A Youth',
    });
  });
});
