import type { PitchRole } from '@lastfootball/lfe';

export type StarterPlayerSeed = {
  readonly id: string;
  readonly name: string;
  readonly number: number;
  readonly pos: string;
  readonly role: PitchRole;
  readonly captain?: boolean;
};

/**
 * Deterministic starter XI from clubId (no DB). Stable across Prematch + Live.
 */
export function seedStarterSquad(clubId: string): readonly StarterPlayerSeed[] {
  const tag = clubId.replace(/-/g, '').slice(0, 8) || 'club';
  const base: Omit<StarterPlayerSeed, 'id'>[] = [
    { name: 'M. Nowak', number: 1, pos: 'BR', role: 'GK' },
    { name: 'K. Baran', number: 2, pos: 'PO', role: 'RB' },
    { name: 'P. Lis', number: 4, pos: 'ŚO', role: 'CB' },
    { name: 'A. Sowa', number: 5, pos: 'ŚO', role: 'CB' },
    { name: 'M. Kowalik', number: 3, pos: 'LO', role: 'LB' },
    { name: 'A. Wróbel', number: 6, pos: 'ŚP', role: 'CM' },
    { name: 'D. Kapitan', number: 8, pos: 'ŚP', role: 'CM', captain: true },
    { name: 'T. Marek', number: 7, pos: 'PN', role: 'RW' },
    { name: 'R. Lew', number: 10, pos: 'ŚP', role: 'CM' },
    { name: 'K. Biały', number: 11, pos: 'PN', role: 'LW' },
    { name: 'J. Czarny', number: 9, pos: 'N', role: 'ST' },
  ];

  return base.map((p, i) => ({
    ...p,
    id: `s-${tag}-${i}`,
  }));
}

/** Fixed bot XI for inaugural match (away). */
export function seedBotSquad(): readonly StarterPlayerSeed[] {
  const base: Omit<StarterPlayerSeed, 'id'>[] = [
    { name: 'R. Zieliński', number: 1, pos: 'BR', role: 'GK' },
    { name: 'S. Kruk', number: 2, pos: 'PO', role: 'RB' },
    { name: 'B. Palej', number: 4, pos: 'ŚO', role: 'CB' },
    { name: 'L. Most', number: 5, pos: 'ŚO', role: 'CB' },
    { name: 'W. Dąb', number: 3, pos: 'LO', role: 'LB' },
    { name: 'I. Domagała', number: 6, pos: 'ŚP', role: 'CM' },
    { name: 'N. Czech', number: 8, pos: 'ŚP', role: 'CM' },
    { name: 'F. Orzeł', number: 7, pos: 'PN', role: 'RW' },
    { name: 'H. Gaj', number: 10, pos: 'ŚP', role: 'CM' },
    { name: 'P. Sokół', number: 9, pos: 'N', role: 'ST' },
    { name: 'T. Lis', number: 11, pos: 'PN', role: 'LW' },
  ];
  return base.map((p, i) => ({ ...p, id: `bot-${i}` }));
}
