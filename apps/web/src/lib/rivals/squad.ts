import { createClient } from '@/lib/supabase/server';
import { resolveMatchBench, resolveStartingXi, type RosterPlayerSeed } from '@/lib/squad';
import type { PlayerRowDto, PlayerStatus } from '@/lib/squad/types';

const STATUSES: readonly PlayerStatus[] = ['READY', 'INJURED', 'SUSPENDED', 'TIRED', 'DEPARTED'];

function asStatus(raw: string): PlayerStatus {
  return (STATUSES as readonly string[]).includes(raw) ? (raw as PlayerStatus) : 'READY';
}

/** Starting XI and bench of a rival, only while our challenge against them is open. */
export async function loadRivalSquad(rivalClubId: string): Promise<{
  xi: readonly RosterPlayerSeed[];
  bench: readonly RosterPlayerSeed[];
} | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    'rival_match_squad',
    { p_club_id: rivalClubId } as never,
  );
  const squad = data as
    | {
        id: string;
        name: string;
        shirt_number: number;
        pos: string;
        role: string;
        starter: boolean;
        captain: boolean;
        age: number;
        skill: number;
        status: string;
      }[]
    | null;
  if (error || !squad || squad.length === 0) return null;

  const rows: PlayerRowDto[] = squad.map((row) => ({
    id: row.id,
    clubId: rivalClubId,
    name: row.name,
    shirtNumber: row.shirt_number,
    pos: row.pos,
    role: row.role,
    starter: row.starter,
    captain: row.captain,
    age: row.age,
    skill: row.skill,
    potential: Math.max(row.skill, 1),
    status: asStatus(row.status),
    nationality: 'POL',
    version: 1,
    departedAt: null,
    transferListedAt: null,
    academyTrack: false,
    promotedAt: null,
  }));

  return {
    xi: resolveStartingXi(rows),
    bench: resolveMatchBench(rows),
  };
}
