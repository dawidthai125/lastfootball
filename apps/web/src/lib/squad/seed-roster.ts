import type { PitchRole } from '@lastfootball/lfe';

export type RosterPlayerSeed = {
  readonly id: string;
  readonly name: string;
  readonly number: number;
  readonly pos: string;
  readonly role: PitchRole;
  readonly captain?: boolean;
  /** true = starting XI */
  readonly starter: boolean;
};

const XI_BASE: Omit<RosterPlayerSeed, 'id' | 'starter'>[] = [
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

const BENCH_BASE: Omit<RosterPlayerSeed, 'id' | 'starter' | 'captain'>[] = [
  { name: 'O. Bramka', number: 12, pos: 'BR', role: 'GK' },
  { name: 'S. Bok', number: 13, pos: 'PO', role: 'RB' },
  { name: 'W. Stoper', number: 14, pos: 'ŚO', role: 'CB' },
  { name: 'E. Skrzydło', number: 15, pos: 'PN', role: 'RW' },
  { name: 'U. Pomoc', number: 16, pos: 'ŚP', role: 'CM' },
  { name: 'I. Napast', number: 17, pos: 'N', role: 'ST' },
  { name: 'Y. Lewy', number: 18, pos: 'LO', role: 'LB' },
];

/**
 * Full club roster (XI + ławka) — deterministic from clubId.
 * Same XI ids as historical first-match seed (`s-{tag}-{i}`).
 */
export function seedClubRoster(clubId: string): readonly RosterPlayerSeed[] {
  const tag = clubId.replace(/-/g, '').slice(0, 8) || 'club';
  const xi = XI_BASE.map((p, i) => ({
    ...p,
    id: `s-${tag}-${i}`,
    starter: true as const,
  }));
  const bench = BENCH_BASE.map((p, i) => ({
    ...p,
    id: `s-${tag}-b${i}`,
    starter: false as const,
  }));
  return [...xi, ...bench];
}

/** Starting XI only — shared by First Match + league sessions. */
export function seedStarterSquad(clubId: string): readonly RosterPlayerSeed[] {
  return seedClubRoster(clubId).filter((p) => p.starter);
}

/** Fixed inaugural bot XI (First Match away). */
export function seedBotSquad(): readonly RosterPlayerSeed[] {
  const base: Omit<RosterPlayerSeed, 'id' | 'starter'>[] = [
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
  return base.map((p, i) => ({ ...p, id: `bot-${i}`, starter: true }));
}

/** Deterministic opponent XI from opponent_club_id. */
export function seedOpponentSquad(opponentClubId: string): readonly RosterPlayerSeed[] {
  const tag = opponentClubId.replace(/[^a-z0-9]/gi, '').slice(0, 8) || 'opp';
  const names = [
    'A. Rywal',
    'B. Rywal',
    'C. Rywal',
    'D. Rywal',
    'E. Rywal',
    'F. Rywal',
    'G. Rywal',
    'H. Rywal',
    'I. Rywal',
    'J. Rywal',
    'K. Rywal',
  ];
  const roles: { pos: string; role: PitchRole; number: number }[] = [
    { pos: 'BR', role: 'GK', number: 1 },
    { pos: 'PO', role: 'RB', number: 2 },
    { pos: 'ŚO', role: 'CB', number: 4 },
    { pos: 'ŚO', role: 'CB', number: 5 },
    { pos: 'LO', role: 'LB', number: 3 },
    { pos: 'ŚP', role: 'CM', number: 6 },
    { pos: 'ŚP', role: 'CM', number: 8 },
    { pos: 'PN', role: 'RW', number: 7 },
    { pos: 'ŚP', role: 'CM', number: 10 },
    { pos: 'N', role: 'ST', number: 9 },
    { pos: 'PN', role: 'LW', number: 11 },
  ];
  return roles.map((r, i) => ({
    id: `o-${tag}-${i}`,
    name: names[i]!,
    number: r.number,
    pos: r.pos,
    role: r.role,
    starter: true as const,
  }));
}
