import { createClient } from '@/lib/supabase/server';

/** Player ids whose band this club has already paid for. Empty when the table is missing. */
export async function loadRevealedPlayerIds(clubId: string): Promise<ReadonlySet<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scout_reports')
    .select('player_id')
    .eq('club_id', clubId);
  if (error || !data) return new Set();
  return new Set((data as { player_id: string }[]).map((row) => row.player_id));
}
