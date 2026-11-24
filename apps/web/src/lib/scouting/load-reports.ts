import { isScoutBand, type ScoutBand } from '@/lib/scouting/reveal';
import { createClient } from '@/lib/supabase/server';

/** Bands this club has paid for, by player id. Empty when the table is missing. */
export async function loadScoutReports(clubId: string): Promise<ReadonlyMap<string, ScoutBand>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scout_reports')
    .select('player_id, band')
    .eq('club_id', clubId);
  if (error || !data) return new Map();
  return new Map(
    (data as { player_id: string; band: string }[]).flatMap((row) =>
      isScoutBand(row.band) ? [[row.player_id, row.band] as const] : [],
    ),
  );
}
