import { tryAdminClient } from '@/lib/supabase/admin';

import { nextFanMood, type FanResult } from '@/lib/club/fans';

/** Moves stored fan mood. A missing column leaves the match save alone. */
export async function recordFanMood(clubId: string, result: FanResult): Promise<void> {
  const supabase = tryAdminClient();
  if (!supabase) return;
  const read = await supabase.from('clubs').select('fan_mood').eq('id', clubId).maybeSingle();
  if (read.error || !read.data) return;
  const current = (read.data as { fan_mood?: number }).fan_mood;
  const mood = nextFanMood(typeof current === 'number' ? current : 60, result);
  await supabase
    .from('clubs')
    .update({ fan_mood: mood } as never)
    .eq('id', clubId);
}
