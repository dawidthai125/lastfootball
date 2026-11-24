import { serverDb } from '@/lib/supabase/admin';
import type { HAgePlayersPort } from '@/lib/season/transition/h-age';
import type { SeasonAgePlayerSlice } from '@/lib/squad/season-age';
import { createClient } from '@/lib/supabase/server';

type PlayersClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Supabase port for H-AGE — club players only (incl. academy_track; excl. departed).
 */
export function createHAgeSupabasePort(supabase: PlayersClient): HAgePlayersPort {
  return {
    async listActiveClubPlayers(clubId) {
      const read = (columns: string) =>
        supabase.from('players').select(columns).eq('club_id', clubId).is('departed_at', null);
      let { data, error } = await read('id, age, skill, potential, aged_for_season');
      // A database before D134 ages without the marker.
      if (error?.code === '42703') ({ data, error } = await read('id, age, skill, potential'));

      if (error) {
        return { error: 'Nie udało się wczytać kadry do aktualizacji wieku.' };
      }

      const rows = (data ?? []) as unknown as Array<{
        id: string;
        age: number;
        skill: number;
        potential: number;
        aged_for_season?: number | null;
      }>;

      const slices: SeasonAgePlayerSlice[] = rows.map((r) => ({
        id: r.id,
        age: r.age,
        skill: r.skill,
        potential: r.potential,
        ...(r.aged_for_season === undefined ? {} : { agedForSeason: r.aged_for_season }),
      }));
      return slices;
    },

    async writePlayerAgeSkill(clubId, row, unlessAgedFor) {
      let update = serverDb(supabase)
        .from('players')
        .update({
          age: row.age,
          skill: row.skill,
          ...(row.agedForSeason === undefined ? {} : { aged_for_season: row.agedForSeason }),
        } as never)
        .eq('id', row.id)
        .eq('club_id', clubId)
        .is('departed_at', null);
      if (unlessAgedFor !== undefined) {
        update = update.or(`aged_for_season.is.null,aged_for_season.neq.${unlessAgedFor}`);
      }
      const { data, error } = await update.select('id').maybeSingle();

      if (error || !data) {
        return { ok: false, error: 'Nie udało się zapisać wieku zawodnika.' };
      }
      return { ok: true };
    },
  };
}
