import { createClient } from '@/lib/supabase/server';
import { env } from '@/config/env';
import type { FixtureDto } from '@/lib/fixtures/types';
import { isSeasonCompleteTrigger } from '@/lib/season/types';

/**
 * Idempotent Season Closed (D70 · D75 · D78).
 * Sets clubs.season_phase = offseason only when trigger 22/22 is met
 * and club is still in_season. Safe to call repeatedly.
 */
export async function closeSeasonIfComplete(
  clubId: string,
  fixtures: readonly FixtureDto[],
): Promise<boolean> {
  if (!isSeasonCompleteTrigger(fixtures)) return false;
  if (!env.isSupabaseConfigured) return false;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clubs')
    .update({ season_phase: 'offseason' } as never)
    .eq('id', clubId)
    .eq('season_phase', 'in_season')
    .select('id')
    .maybeSingle();

  if (error) return false;
  // Already offseason counts as closed (idempotent).
  if (data) return true;

  const { data: row } = await supabase
    .from('clubs')
    .select('season_phase')
    .eq('id', clubId)
    .maybeSingle();

  return (row as { season_phase?: string } | null)?.season_phase === 'offseason';
}
