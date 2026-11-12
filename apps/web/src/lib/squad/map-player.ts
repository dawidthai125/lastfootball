import { resolvePlayerPotential } from '@/lib/squad/potential';
import type { AttrGroups, PlayerRowDto, PlayerStatus } from '@/lib/squad/types';

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
  /** Optional for older fixtures/tests — defaults to false (senior). */
  academy_track?: boolean | null;
  /** Optional for older fixtures/tests — defaults to null. */
  promoted_at?: string | null;
  attr_attack?: number | null;
  attr_passing?: number | null;
  attr_defense?: number | null;
  attr_physical?: number | null;
  attr_goalkeeping?: number | null;
  energy?: number | null;
  form?: number | null;
  wage?: number | null;
  suspension_matches?: number | null;
  recent_ratings?: number[] | null;
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
    academyTrack: Boolean(row.academy_track),
    promotedAt: row.promoted_at ?? null,
    groups: groupsFromRow(row),
    energy: typeof row.energy === 'number' ? row.energy : undefined,
    form: typeof row.form === 'number' ? row.form : undefined,
    wage: typeof row.wage === 'number' ? row.wage : undefined,
    suspensionMatches:
      typeof row.suspension_matches === 'number' ? row.suspension_matches : undefined,
    recentRatings: Array.isArray(row.recent_ratings) ? row.recent_ratings : undefined,
  };
}

function groupsFromRow(row: PlayerDbRow): AttrGroups | undefined {
  const attack = row.attr_attack;
  const passing = row.attr_passing;
  const defense = row.attr_defense;
  const physical = row.attr_physical;
  const goalkeeping = row.attr_goalkeeping;
  if (
    typeof attack !== 'number' ||
    typeof passing !== 'number' ||
    typeof defense !== 'number' ||
    typeof physical !== 'number' ||
    typeof goalkeeping !== 'number'
  ) {
    return undefined;
  }
  return { attack, passing, defense, physical, goalkeeping };
}
