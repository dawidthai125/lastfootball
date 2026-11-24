/**
 * Club messages — Information Thin (LFE-MESSAGES-01).
 * Derive only from domain facts · no DB · no workflow · no second offer process.
 */

import type { MatchEventMessage } from '@/lib/messages/match-events';

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

export type MessagesDressingInput = {
  readonly conflictId: string;
  readonly subject: string;
};

export type MessagesLoanInInput = {
  readonly count: number;
};

export type MessagesIntlInput = {
  readonly playerId: string;
  readonly subject: string;
};

export type MessagesSeasonDepartureInput = {
  readonly summary: string;
};

export type MessagesRetirementFarewellInput = {
  readonly subject: string;
};

export type ResolveClubMessagesInput = {
  readonly transferWindowOpen: boolean;
  readonly incomingOffers: readonly MessagesIncomingOfferInput[];
  readonly incomingLiveOffers: readonly MessagesH2hOfferInput[];
  readonly outgoingLiveOffers: readonly MessagesH2hOfferInput[];
  readonly dressingConflict?: MessagesDressingInput | null;
  readonly incomingLoanOffers?: MessagesLoanInInput | null;
  readonly intlCallup?: MessagesIntlInput | null;
  /** Offseason foreshadow of Confirm N+1 roster change. */
  readonly seasonDeparture?: MessagesSeasonDepartureInput | null;
  /** Post–Confirm Thin farewell (who left / promote). */
  readonly retirementFarewell?: MessagesRetirementFarewellInput | null;
  /** ClubFinanceDto.wageNote — REUSE resolveClubFinance. */
  readonly wageNote?: string | null;
  /** Completed board tasks to collect — REUSE resolveBoardTaskNote. */
  readonly boardTaskNote?: string | null;
  /** Juniors in their last academy season — REUSE juniorAgeNote. */
  readonly academyAgeNote?: string | null;
  /** Last season of a contract, and contracts that ended today (D139). */
  readonly contractNotes?: readonly string[];
  /** Matches other clubs played with ours (D143) — REUSE resolveMatchEvents. */
  readonly matchEvents?: readonly MatchEventMessage[];
};

const SEASON_DEPARTURE_SUBJECT = 'Zmiana w kadrze przy starcie sezonu';

function seasonDepartureSubject(summary: string): string {
  const trimmed = summary.trim();
  if (!trimmed) return SEASON_DEPARTURE_SUBJECT;
  if (trimmed.length <= 80) return trimmed;
  return `${trimmed.slice(0, 77).trimEnd()}…`;
}

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

  if (input.dressingConflict) {
    items.push({
      id: `msg:dress:${input.dressingConflict.conflictId}`,
      kind: 'offer_brief',
      subject: input.dressingConflict.subject,
      fromLabel: 'Szatnia',
      href: '/messages',
      priority: 'decision',
    });
  }

  if (input.incomingLoanOffers && input.incomingLoanOffers.count > 0) {
    const n = input.incomingLoanOffers.count;
    items.push({
      id: 'msg:loan-in',
      kind: 'offer_brief',
      subject: n === 1 ? 'Oferta wypożyczenia' : `Oferty wypożyczenia (${n})`,
      fromLabel: 'Transfery',
      href: '/transfers',
      priority: 'decision',
    });
  }

  if (input.intlCallup) {
    items.push({
      id: `msg:intl:${input.intlCallup.playerId}`,
      kind: 'offer_brief',
      subject: input.intlCallup.subject,
      fromLabel: 'Reprezentacja',
      href: '/messages',
      priority: 'decision',
    });
  }

  for (const event of input.matchEvents ?? []) {
    items.push({ ...event, kind: 'system', priority: 'info' });
  }

  if (input.wageNote) {
    items.push({
      id: 'msg:wages',
      kind: 'system',
      subject: input.wageNote,
      fromLabel: 'Zarząd',
      href: '/finance',
      priority: 'info',
    });
  }

  if (input.boardTaskNote) {
    items.push({
      id: 'msg:board-task',
      kind: 'system',
      subject: input.boardTaskNote,
      fromLabel: 'Zarząd',
      href: '/board',
      priority: 'info',
    });
  }

  for (const [index, note] of (input.contractNotes ?? []).entries()) {
    items.push({
      id: `msg:contract-${index}`,
      kind: 'system',
      subject: note.length <= 80 ? note : `${note.slice(0, 77).trimEnd()}…`,
      fromLabel: 'Zarząd',
      href: '/squad',
      priority: 'info',
    });
  }

  if (input.academyAgeNote) {
    items.push({
      id: 'msg:academy-age',
      kind: 'system',
      subject: input.academyAgeNote,
      fromLabel: 'Akademia',
      href: '/academy',
      priority: 'info',
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

  if (input.seasonDeparture) {
    items.push({
      id: 'msg:season-departure',
      kind: 'system',
      subject: seasonDepartureSubject(input.seasonDeparture.summary),
      fromLabel: 'Zarząd',
      href: '/hub',
      priority: 'info',
    });
  }

  if (input.retirementFarewell) {
    const subject = input.retirementFarewell.subject.trim();
    if (subject) {
      items.push({
        id: 'msg:retirement-farewell',
        kind: 'system',
        subject: subject.length <= 80 ? subject : `${subject.slice(0, 77).trimEnd()}…`,
        fromLabel: 'Zarząd',
        href: '/hub',
        priority: 'info',
      });
    }
  }

  return { items };
}
