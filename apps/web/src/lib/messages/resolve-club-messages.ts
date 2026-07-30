/**
 * Club messages — Information Thin (LFE-MESSAGES-01).
 * Derive only from domain facts · no DB · no workflow · no second offer process.
 */

export type ClubMessageKind = 'system' | 'offer_brief';

export type ClubMessagePriority = 'decision' | 'info';

export type ClubMessageDto = {
  readonly id: string;
  readonly kind: ClubMessageKind;
  readonly subject: string;
  readonly fromLabel: string;
  readonly href: string;
  readonly priority: ClubMessagePriority;
};

export type ClubMessagesDto = {
  readonly items: readonly ClubMessageDto[];
};

/** Minimal H2H shape for E3 — REUSE LiveH2hOfferDto fields. */
export type MessagesH2hOfferInput = {
  readonly offerId: string;
  readonly playerName: string;
  readonly phase: 'opening' | 'countered';
  readonly status: string;
  readonly side: 'incoming' | 'outgoing';
};

export type MessagesIncomingOfferInput = {
  readonly offerId: string;
  readonly playerName: string;
};

export type ResolveClubMessagesInput = {
  readonly transferWindowOpen: boolean;
  readonly incomingOffers: readonly MessagesIncomingOfferInput[];
  readonly incomingLiveOffers: readonly MessagesH2hOfferInput[];
  readonly outgoingLiveOffers: readonly MessagesH2hOfferInput[];
};

function isPendingActionableSeller(o: MessagesH2hOfferInput): boolean {
  return o.status === 'pending' && o.side === 'incoming' && o.phase === 'opening';
}

function isPendingActionableBuyer(o: MessagesH2hOfferInput): boolean {
  return o.status === 'pending' && o.side === 'outgoing' && o.phase === 'countered';
}

/**
 * Sole messages SSOT for product UI (LFE-MESSAGES-01).
 * Pure — never reads DB. Owns sort order (UI must not re-sort/filter).
 *
 * E3 decision (H2H action) → E2 decision (incoming AI brief) → E1 info (window).
 */
export function resolveClubMessages(input: ResolveClubMessagesInput): ClubMessagesDto {
  const items: ClubMessageDto[] = [];

  const h2hActionable = [
    ...input.incomingLiveOffers.filter(isPendingActionableSeller),
    ...input.outgoingLiveOffers.filter(isPendingActionableBuyer),
  ]
    .slice()
    .sort((a, b) => a.offerId.localeCompare(b.offerId));

  for (const o of h2hActionable) {
    const role = o.side === 'incoming' ? 'seller' : 'buyer';
    items.push({
      id: `msg:h2h:${o.offerId}:${role}`,
      kind: 'offer_brief',
      subject:
        role === 'seller' ? `Oferta H2H: ${o.playerName}` : `Kontrpropozycja H2H: ${o.playerName}`,
      fromLabel: 'Transfery',
      href: '/transfers',
      priority: 'decision',
    });
  }

  if (input.incomingOffers.length > 0) {
    const n = input.incomingOffers.length;
    items.push({
      id: 'msg:incoming-offers',
      kind: 'offer_brief',
      subject: n === 1 ? 'Masz ofertę przychodzącą' : `Masz oferty przychodzące (${n})`,
      fromLabel: 'Transfery',
      href: '/transfers',
      priority: 'decision',
    });
  }

  if (input.transferWindowOpen) {
    items.push({
      id: 'msg:transfer-window',
      kind: 'system',
      subject: 'Okno transferowe jest otwarte',
      fromLabel: 'System',
      href: '/transfers',
      priority: 'info',
    });
  }

  return { items };
}
