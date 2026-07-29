import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import type { PlayerRowDto } from '@/lib/squad/types';

const PLAYER_SELECT =
  'id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential, status, nationality, version, departed_at, transfer_listed_at';

/**
 * Active club roster from DB (SSOT). Excludes DEPARTED / departed_at.
 * Empty array if missing — no seed fallback.
 */
export async function listClubPlayers(clubId: string): Promise<PlayerRowDto[]> {
  if (!env.isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('players')
    .select(PLAYER_SELECT)
    .eq('club_id', clubId)
    .is('departed_at', null)
    .order('shirt_number', { ascending: true });

  if (error || !data) return [];
  return (data as PlayerDbRow[]).map(mapPlayerRow).filter((p) => p.status !== 'DEPARTED');
}
