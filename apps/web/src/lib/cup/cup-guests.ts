import type { LeagueTier } from '@/lib/league/league-tier';

export type CupGuest = {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
};

/** Four higher-tier guests. Liga I uses narrative wildcards (GDD §11.3). */
const GUESTS_FROM_III: readonly CupGuest[] = [
  { id: 'cup-iii-orly-metropolii', name: 'Orły Metropolii', shortName: 'ORL' },
  { id: 'cup-iii-stal-centrum', name: 'Stal Centrum', shortName: 'STC' },
  { id: 'cup-iii-port-poludnie', name: 'Port Południe', shortName: 'PPO' },
  { id: 'cup-iii-gornik-wies', name: 'Górnik Wieś', shortName: 'GRW' },
];

const GUESTS_FROM_II: readonly CupGuest[] = [
  { id: 'cup-ii-korona-traktu', name: 'Korona Traktu', shortName: 'KTR' },
  { id: 'cup-ii-unia-brzegu', name: 'Unia Brzegu', shortName: 'UNB' },
  { id: 'cup-ii-sokol-wzgorz', name: 'Sokół Wzgórz', shortName: 'SWZ' },
  { id: 'cup-ii-chemik-rzeki', name: 'Chemik Rzeki', shortName: 'CHR' },
];

const GUESTS_FROM_I: readonly CupGuest[] = [
  { id: 'cup-i-legia-stolicy', name: 'Legia Stolicy', shortName: 'LGS' },
  { id: 'cup-i-wisla-korony', name: 'Wisła Korony', shortName: 'WSK' },
  { id: 'cup-i-lech-zachodu', name: 'Lech Zachodu', shortName: 'LCZ' },
  { id: 'cup-i-pogon-portu', name: 'Pogoń Portu', shortName: 'PGP' },
];

const WILDCARDS: readonly CupGuest[] = [
  { id: 'cup-wild-orly-nocy', name: 'Orły Nocy', shortName: 'ORN' },
  { id: 'cup-wild-stal-imperium', name: 'Stal Imperium', shortName: 'STI' },
  { id: 'cup-wild-motor-korony', name: 'Motor Korony', shortName: 'MTK' },
  { id: 'cup-wild-bialy-grom', name: 'Biały Grom', shortName: 'BGR' },
];

const GUEST_ORIGIN: Record<LeagueTier, string> = {
  iv: 'III liga',
  iii: 'II liga',
  ii: 'I liga',
  i: 'dzikie karty',
};

export function cupGuestsForTier(tier: LeagueTier): readonly CupGuest[] {
  switch (tier) {
    case 'iv':
      return GUESTS_FROM_III;
    case 'iii':
      return GUESTS_FROM_II;
    case 'ii':
      return GUESTS_FROM_I;
    case 'i':
      return WILDCARDS;
  }
}

export function cupGuestOriginLabel(tier: LeagueTier): string {
  return GUEST_ORIGIN[tier];
}

const ALL_GUESTS: readonly CupGuest[] = [
  ...GUESTS_FROM_III,
  ...GUESTS_FROM_II,
  ...GUESTS_FROM_I,
  ...WILDCARDS,
];

export function findCupGuest(id: string): CupGuest | null {
  return ALL_GUESTS.find((g) => g.id === id) ?? null;
}

/** Guest clubs play at the tier they come from. League opponents stay on the club tier. */
export function cupOpponentTier(opponentId: string, clubTier: LeagueTier): LeagueTier {
  if (opponentId.startsWith('cup-iii-')) return 'iii';
  if (opponentId.startsWith('cup-ii-')) return 'ii';
  if (opponentId.startsWith('cup-i-') || opponentId.startsWith('cup-wild-')) return 'i';
  return clubTier;
}
