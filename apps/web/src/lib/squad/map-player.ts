import { resolvePlayerPotential } from '@/lib/squad/potential';
import type { PlayerRowDto, PlayerStatus } from '@/lib/squad/types';

export type PlayerDbRow = {
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
  /** Optional for older fixtures/tests — filled via resolvePlayerPotential when absent. */
  potential?: number | null;
  status: string;
  nationality: string;
  version: number;
  departed_at: string | null;
  /** Optional for older fixtures/tests — defaults to null. */
  transfer_listed_at?: string | null;
};

const STATUSES: readonly PlayerStatus[] = ['READY', 'INJURED', 'SUSPENDED', 'TIRED', 'DEPARTED'];

function mapStatus(raw: string): PlayerStatus {
  if ((STATUSES as readonly string[]).includes(raw)) return raw as PlayerStatus;
  return 'READY';
}

export function mapPlayerRow(row: PlayerDbRow): PlayerRowDto {
  return {
    id: row.id,
    clubId: row.club_id,
    name: row.name,
    shirtNumber: row.shirt_number,
    pos: row.pos,
    role: row.role,
    starter: row.starter,
    captain: row.captain,
    age: row.age,
    skill: row.skill,
    potential:
      typeof row.potential === 'number' && row.potential >= 1
        ? Math.min(99, Math.max(row.skill, row.potential))
        : resolvePlayerPotential(row.skill, row.id, row.age),
    status: mapStatus(row.status),
    nationality: row.nationality,
    version: row.version,
    departedAt: row.departed_at,
    transferListedAt: row.transfer_listed_at ?? null,
  };
}
