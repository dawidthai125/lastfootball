import type { PitchRole } from '@lastfootball/lfe';

/** Catalogue row for market browse — AI generator only (not players SSOT). */
export type TransferCatalogueSeed = {
  readonly marketId: string;
  readonly name: string;
  readonly pos: string;
  readonly role: PitchRole;
  readonly age: number;
  readonly skill: number;
  readonly clubLabel: string;
};

/**
 * Deterministic free-agent / AI market catalogue for a club.
 * Market ids are `m-{tag}-{i}`; a bought player is `boughtPlayerId` of it.
 */
export function seedTransferCatalogue(clubId: string): readonly TransferCatalogueSeed[] {
  const tag = clubId.replace(/-/g, '').slice(0, 8) || 'club';
  const base: Omit<TransferCatalogueSeed, 'marketId'>[] = [
    {
      name: 'L. Wolny',
      pos: 'BR',
      role: 'GK',
      age: 24,
      skill: 62,
      clubLabel: 'Wolny agent',
    },
    {
      name: 'M. Skrzydło',
      pos: 'PN',
      role: 'RW',
      age: 22,
      skill: 64,
      clubLabel: 'Orzeł Grodzisk',
    },
    {
      name: 'P. Stoper',
      pos: 'ŚO',
      role: 'CB',
      age: 28,
      skill: 66,
      clubLabel: 'Wisła Północ',
    },
    {
      name: 'A. Pomoc',
      pos: 'ŚP',
      role: 'CM',
      age: 21,
      skill: 61,
      clubLabel: 'Atletyk Centrum',
    },
    {
      name: 'K. Napast',
      pos: 'N',
      role: 'ST',
      age: 25,
      skill: 68,
      clubLabel: 'Wolny agent',
    },
    {
      name: 'B. Lewy',
      pos: 'LO',
      role: 'LB',
      age: 23,
      skill: 60,
      clubLabel: 'Wilki Północy',
    },
    {
      name: 'D. Prawy',
      pos: 'PO',
      role: 'RB',
      age: 27,
      skill: 63,
      clubLabel: 'Legia Rzeczna',
    },
    {
      name: 'S. Wolny',
      pos: 'ŚP',
      role: 'CM',
      age: 29,
      skill: 67,
      clubLabel: 'Wolny agent',
    },
    {
      name: 'E. Skrzydło',
      pos: 'LN',
      role: 'LW',
      age: 20,
      skill: 59,
      clubLabel: 'Orzeł Grodzisk',
    },
    {
      name: 'F. Stoper',
      pos: 'ŚO',
      role: 'CB',
      age: 31,
      skill: 70,
      clubLabel: 'Wisła Północ',
    },
    {
      name: 'G. Bramka',
      pos: 'BR',
      role: 'GK',
      age: 22,
      skill: 58,
      clubLabel: 'Atletyk Centrum',
    },
    {
      name: 'H. Napast',
      pos: 'N',
      role: 'ST',
      age: 26,
      skill: 71,
      clubLabel: 'Wolny agent',
    },
    {
      name: 'I. Pomoc',
      pos: 'ŚP',
      role: 'CM',
      age: 19,
      skill: 57,
      clubLabel: 'Wilki Północy',
    },
  ];
  return base.map((p, i) => ({
    ...p,
    marketId: `m-${tag}-${i}`,
  }));
}

/**
 * Id of the player behind a market row, known before he is bought, so his talents are the same on
 * the market and in the squad (D153). Each row is sold once. Older purchases are `t-{tag}-{n}`.
 */
export function boughtPlayerId(marketId: string): string {
  return marketId.replace(/^m-/, 't-').replace(/-(\d+)$/, '-m$1');
}
