import { env } from '@/config/env';
import type { RetirementFarewellPlayer } from '@/lib/season/departure';
import { createClient } from '@/lib/supabase/server';

/**
 * Thin I/O for post–Confirm farewell derive.
 * listClubPlayers excludes DEPARTED — this loads today's transition flash only.
 */
export async function listClubRetirementFlash(
  clubId: string,
  todayUtc: string,
): Promise<readonly RetirementFarewellPlayer[]> {
  if (!env.isSupabaseConfigured) return [];
  const supabase = await createClient();
  const dayStart = `${todayUtc}T00:00:00.000Z`;
  const [departed, promoted] = await Promise.all([
    supabase
      .from('players')
      .select('id, name, status, departed_at, promoted_at')
      .eq('club_id', clubId)
      .not('departed_at', 'is', null)
      .gte('departed_at', dayStart),
    supabase
      .from('players')
      .select('id, name, status, departed_at, promoted_at')
      .eq('club_id', clubId)
      .is('departed_at', null)
      .not('promoted_at', 'is', null)
      .gte('promoted_at', dayStart),
  ]);

  const byId = new Map<string, RetirementFarewellPlayer>();
  for (const result of [departed, promoted]) {
    if (result.error || !result.data) continue;
    for (const row of result.data as {
      id: string;
      name: string;
      status: string;
      departed_at: string | null;
      promoted_at: string | null;
    }[]) {
      byId.set(row.id, {
        id: row.id,
        name: row.name,
        status: row.status,
        departedAt: row.departed_at,
        promotedAt: row.promoted_at,
      });
    }
  }
  return [...byId.values()];
}
