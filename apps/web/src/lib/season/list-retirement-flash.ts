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
      .select('id, name, status, departed_at, promoted_at, departed_reason')
      .eq('club_id', clubId)
      // A sale or a loan that ended is not the end of a career.
      .in('departed_reason', ['retired', 'contract'])
      // A junior who leaves the academy did not end a career.
      .eq('academy_track', false)
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
      departed_reason?: string | null;
    }[]) {
      byId.set(row.id, {
        id: row.id,
        name: row.name,
        status: row.status,
        departedAt: row.departed_at,
        promotedAt: row.promoted_at,
        reason: row.departed_reason ?? null,
      });
    }
  }
  return [...byId.values()];
}
