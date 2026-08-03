import type { HAgePlayersPort } from '@/lib/season/transition/h-age';
import type { SeasonAgePlayerSlice, SeasonAgeResultSlice } from '@/lib/squad/season-age';
import { createClient } from '@/lib/supabase/server';

type PlayersClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Supabase port for H-AGE — club players only (incl. academy_track; excl. departed).
 */
export function createHAgeSupabasePort(supabase: PlayersClient): HAgePlayersPort {
  return {
    async listActiveClubPlayers(clubId) {
      const { data, error } = await supabase
        .from('players')
        .select('id, age, skill, potential')
        .eq('club_id', clubId)
        .is('departed_at', null);

      if (error) {
        return { error: 'Nie udało się wczytać kadry do aktualizacji wieku.' };
      }

      const rows = (data ?? []) as Array<{
        id: string;
        age: number;
        skill: number;
        potential: number;
      }>;

      const slices: SeasonAgePlayerSlice[] = rows.map((r) => ({
        id: r.id,
        age: r.age,
        skill: r.skill,
        potential: r.potential,
      }));
      return slices;
    },

    async writePlayerAgeSkill(clubId, row: SeasonAgeResultSlice) {
      const { data, error } = await supabase
        .from('players')
        .update({ age: row.age, skill: row.skill } as never)
        .eq('id', row.id)
        .eq('club_id', clubId)
        .is('departed_at', null)
        .select('id')
        .maybeSingle();

      if (error || !data) {
        return { ok: false, error: 'Nie udało się zapisać wieku zawodnika.' };
      }
      return { ok: true };
    },
  };
}
