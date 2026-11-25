import type { LeagueTier } from '@/lib/league/league-tier';
import { opponentNames } from '@/lib/squad/opponent-names';
import type { SquadPlayerDto } from '@/lib/squad/types';
import { isAvailable, isGoalkeeper } from '@/lib/squad/validate-starting-xi';

type Candidate = Pick<
  SquadPlayerDto,
  'position' | 'status' | 'onLoan' | 'intlAbsentUntil' | 'pitchRole'
>;

export type MissingRole = { readonly pos: string; readonly role: string };

const KEEPER: MissingRole = { pos: 'BR', role: 'GK' };
/** Lines of a 4-4-2, the one a club is shortest of is filled first. */
const LINES = [
  { need: 4, positions: ['PO', 'LO', 'ŚO', 'OB'], fill: { pos: 'ŚO', role: 'CB' } },
  { need: 4, positions: ['ŚP', 'PN'], fill: { pos: 'ŚP', role: 'CM' } },
  { need: 2, positions: ['N'], fill: { pos: 'N', role: 'ST' } },
] as const;

/**
 * Who is missing when no legal eleven exists: fewer than eleven available, or no keeper.
 * Null = the manager can set one.
 */
export function missingRole(players: readonly Candidate[], today: string): MissingRole | null {
  const free = players.filter((p) => isAvailable(p, today));
  if (!free.some(isGoalkeeper)) return KEEPER;
  if (free.length >= 11) return null;
  const short = LINES.map((line) => ({
    line,
    gap:
      line.need -
      free.filter((p) => (line.positions as readonly string[]).includes(p.position)).length,
  })).sort((a, b) => b.gap - a.gap)[0]!;
  return short.line.fill;
}

/**
 * What the manager may do about it. His own players out on loan count as available: while they
 * are enough he recalls them, and only then there is a junior. The database checks the same.
 */
export function emergencyNeed(
  players: readonly Candidate[],
  today: string,
): MissingRole | 'recall' | null {
  if (!missingRole(players, today)) return null;
  return (
    missingRole(
      players.map((p) => ({ ...p, onLoan: false })),
      today,
    ) ?? 'recall'
  );
}

/** What a free junior may grow to. Not the rivals' floor: a stronger league gives no better gift. */
const JUNIOR_POTENTIAL: Readonly<Record<LeagueTier, number>> = { iv: 47, iii: 53, ii: 59, i: 66 };

/** A junior well under the level of the league. */
export function emergencyJunior(tier: LeagueTier, nameSeed: string) {
  const potential = JUNIOR_POTENTIAL[tier];
  return {
    name: opponentNames(nameSeed, 1)[0]!,
    age: 17,
    skill: potential - 5,
    potential,
    /** The base of every wage (wageFromSkill). */
    wage: 1200,
  };
}
