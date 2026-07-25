import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import type { PlayerRowDto } from '@/lib/squad/types';

const PLAYER_SELECT =
  'id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, status, nationality, version';

/** Club roster rows from DB (SSOT). Empty array if missing / misconfigured — no seed fallback. */
export async function listClubPlayers(clubId: string): Promise<PlayerRowDto[]> {
  if (!env.isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('players')
    .select(PLAYER_SELECT)
    .eq('club_id', clubId)
    .order('shirt_number', { ascending: true });

  if (error || !data) return [];
  return (data as PlayerDbRow[]).map(mapPlayerRow);
}
