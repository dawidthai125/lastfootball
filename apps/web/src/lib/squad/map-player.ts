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
  status: string;
  nationality: string;
  version: number;
  departed_at: string | null;
};

const STATUSES: readonly PlayerStatus[] = [
  'READY',
  'INJURED',
  'SUSPENDED',
  'TIRED',
  'DEPARTED',
];

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
    status: mapStatus(row.status),
    nationality: row.nationality,
    version: row.version,
    departedAt: row.departed_at,
  };
}
