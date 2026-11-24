import type { LeagueTier } from '@/lib/league/league-tier';
import { resolveLeagueStrengthProfile } from '@/lib/league/league-strength-profile';
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
 * Null = the manager can set one. The database checks the same before it adds a player.
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

/** A junior just under the level of the league. He may grow only to its floor. */
export function emergencyJunior(tier: LeagueTier, nameSeed: string) {
  const potential = resolveLeagueStrengthProfile(tier).minSkill;
  return {
    name: opponentNames(nameSeed, 1)[0]!,
    age: 17,
    skill: potential - 5,
    potential,
    /** The base of every wage (wageFromSkill). */
    wage: 1200,
  };
}
