import { seedClubRoster } from '@/lib/squad/seed-roster';

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
  status: 'READY';
  nationality: 'POL';
  version: 1;
};

/**
 * Builds 18 player rows from deterministic seed (ids `s-{tag}-…`).
 * Not for runtime product reads — use listClubPlayers + resolveClubSquad.
 */
export function buildStarterPlayerInserts(clubId: string): PlayerInsertRow[] {
  return seedClubRoster(clubId).map((p) => ({
    id: p.id,
    club_id: clubId,
    name: p.name,
    shirt_number: p.number,
    pos: p.pos,
    role: p.role,
    starter: p.starter,
    captain: Boolean(p.captain),
    age: 22 + (p.number % 12),
    skill: 55 + (p.number % 20),
    status: 'READY' as const,
    nationality: 'POL' as const,
    version: 1 as const,
  }));
}
