import { createClient } from '@/lib/supabase/server';

/** Load shortlist player_id refs for a club (preference only). */
export async function listScoutShortlistIds(clubId: string): Promise<readonly string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scout_shortlist' as never)
    .select('player_id')
    .eq('club_id', clubId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return (data as { player_id: string }[]).map((r) => r.player_id);
}
