import { resolvePlayerPotential } from '@/lib/squad/potential';
import { seedClubRoster, type RosterPlayerSeed } from '@/lib/squad/seed-roster';

/** DB insert payload for starter package — generator only (create / backfill / tests). */
export type PlayerInsertRow = {
  id: string;
  club_id: string;
  name: string;
  shirt_number: number;
  pos: string;
  role: string;
  starter: boolean;
  captain: boolean;
  age: number;
  skill: number;
  potential: number;
  status: 'READY';
  nationality: 'POL';
  version: 1;
};

function shirtSkill(p: RosterPlayerSeed): number {
  return 55 + (p.number % 20);
}

/**
 * The same skills as the shirt numbers give, but the best of each position start.
 * Only permuted within a position, so total skill and the (linear) wage bill stay put.
 */
function starterFirstSkills(roster: readonly RosterPlayerSeed[]): ReadonlyMap<string, number> {
  const out = new Map<string, number>();
  for (const pos of new Set(roster.map((p) => p.pos))) {
    const players = roster
      .filter((p) => p.pos === pos)
      .sort((a, b) => Number(b.starter) - Number(a.starter) || shirtSkill(b) - shirtSkill(a));
    const skills = players.map(shirtSkill).sort((a, b) => b - a);
    players.forEach((p, i) => out.set(p.id, skills[i]!));
  }
  return out;
}

/**
 * Builds 18 player rows from deterministic seed (ids `s-{tag}-…`).
 * Not for runtime product reads — use listClubPlayers + resolveClubSquad.
 */
export function buildStarterPlayerInserts(clubId: string): PlayerInsertRow[] {
  const roster = seedClubRoster(clubId);
  const skills = starterFirstSkills(roster);
  return roster.map((p) => {
    const age = 22 + (p.number % 12);
    const skill = skills.get(p.id)!;
    return {
      id: p.id,
      club_id: clubId,
      name: p.name,
      shirt_number: p.number,
      pos: p.pos,
      role: p.role,
      starter: p.starter,
      captain: Boolean(p.captain),
      age,
      skill,
      potential: resolvePlayerPotential(skill, p.id, age),
      status: 'READY' as const,
      nationality: 'POL' as const,
      version: 1 as const,
    };
  });
}
