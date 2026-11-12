import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import type { PlayerRowDto } from '@/lib/squad/types';

const PLAYER_SELECT =
  'id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential, status, nationality, version, departed_at, transfer_listed_at, academy_track, promoted_at, attr_attack, attr_passing, attr_defense, attr_physical, attr_goalkeeping, energy, form, wage, suspension_matches, recent_ratings';

const PLAYER_SELECT_LEGACY =
  'id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential, status, nationality, version, departed_at, transfer_listed_at, academy_track, promoted_at';

/**
 * Club players from DB (SSOT) including academy prospects.
 * Excludes DEPARTED / departed_at. Empty array if missing — no seed fallback.
 * Senior consumers must filter via resolveClubSquad / filterSeniorPlayers.
 */
export async function listClubPlayers(clubId: string): Promise<PlayerRowDto[]> {
  if (!env.isSupabaseConfigured) return [];
  const supabase = await createClient();
  const full = await supabase
    .from('players')
    .select(PLAYER_SELECT)
    .eq('club_id', clubId)
    .is('departed_at', null)
    .order('shirt_number', { ascending: true });

  const result = full.error
    ? await supabase
        .from('players')
        .select(PLAYER_SELECT_LEGACY)
        .eq('club_id', clubId)
        .is('departed_at', null)
        .order('shirt_number', { ascending: true })
    : full;

  if (result.error || !result.data) return [];
  return (result.data as PlayerDbRow[]).map(mapPlayerRow).filter((p) => p.status !== 'DEPARTED');
}
