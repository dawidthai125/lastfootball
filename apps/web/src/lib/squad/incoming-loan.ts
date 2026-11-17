import { loanUntilDate, loanWage } from '@/lib/squad/loan';
import type { PitchRole } from '@lastfootball/lfe';

export type IncomingLoanOffer = {
  readonly offerId: string;
  readonly name: string;
  readonly pos: string;
  readonly role: PitchRole;
  readonly age: number;
  readonly skill: number;
  readonly partnerLabel: string;
  readonly wage: number;
  readonly until: string;
};

const PARTNERS = [
  'Orzeł Grodzisk',
  'Wisła Północ',
  'Atletyk Centrum',
  'Wilki Północy',
  'Legia Rzeczna',
] as const;

const TEMPLATES: readonly {
  readonly name: string;
  readonly pos: string;
  readonly role: PitchRole;
  readonly age: number;
  readonly skill: number;
}[] = [
  { name: 'J. Gość', pos: 'ŚP', role: 'CM', age: 24, skill: 63 },
  { name: 'T. Wypożycz', pos: 'ŚO', role: 'CB', age: 26, skill: 65 },
  { name: 'R. Skrzydło', pos: 'PN', role: 'RW', age: 22, skill: 62 },
  { name: 'M. Napast', pos: 'N', role: 'ST', age: 23, skill: 64 },
];

function clubHash(clubId: string): number {
  let hash = 0;
  for (let i = 0; i < clubId.length; i++) {
    hash = (hash * 33 + clubId.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** 0–2 deterministic loan-in offers while the transfer window is open. */
export function resolveIncomingLoanOffers(input: {
  readonly clubId: string;
  readonly transferWindowOpen: boolean;
  readonly rosterCount: number;
  readonly today: string;
}): readonly IncomingLoanOffer[] {
  if (!input.transferWindowOpen) return [];
  if (input.rosterCount >= 22) return [];
  const hash = clubHash(input.clubId);
  const count = hash % 3;
  if (count === 0) return [];
  const until = loanUntilDate(input.today);
  const offers: IncomingLoanOffer[] = [];
  for (let i = 0; i < count; i++) {
    const template = TEMPLATES[(hash + i * 7) % TEMPLATES.length]!;
    const partner = PARTNERS[(hash + i * 11) % PARTNERS.length]!;
    const skill = Math.min(72, template.skill + ((hash >> (i * 3)) % 4));
    offers.push({
      offerId: `loan-in:${input.clubId.slice(0, 8)}:${i}`,
      name: template.name,
      pos: template.pos,
      role: template.role,
      age: template.age,
      skill,
      partnerLabel: partner,
      wage: loanWage(800 + skill * 20),
      until,
    });
  }
  return offers;
}

export function incomingLoanBlock(input: {
  readonly rosterCount: number;
  readonly alreadyLoanedIn: number;
}): string | null {
  if (input.rosterCount >= 22) return 'Kadra jest pełna (max 22).';
  if (input.alreadyLoanedIn >= 2) return 'Masz już dwóch wypożyczonych.';
  return null;
}
