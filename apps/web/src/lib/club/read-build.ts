import type { createClient } from '@/lib/supabase/server';
import { emptyStadiumLevels, type StadiumLevels } from '@/lib/stadium/levels';
import { isCoachGroup, type CoachGroup } from '@/lib/training/coach';
import { clampStyle } from '@/lib/training/style';

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

export type ClubBuild = {
  readonly coachGroup: CoachGroup | null;
  readonly levels: StadiumLevels;
  /** Pressing habit 0..8. Missing column stays 0. */
  readonly stylePressing: number;
  /** Tempo habit 0..8. Missing column stays 0. */
  readonly styleTempo: number;
};

function clampLevel(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(3, Math.trunc(value)));
}

/** Levels and coach. Missing columns stay at the old game: no coach, stadium 0. */
export async function readClubBuild(supabase: AppSupabase, clubId: string): Promise<ClubBuild> {
  const rich = await supabase
    .from('clubs')
    .select('coach_group, stands_level, pitch_level, training_center_level')
    .eq('id', clubId)
    .maybeSingle();

  const style = await supabase
    .from('clubs')
    .select('style_pressing')
    .eq('id', clubId)
    .maybeSingle();
  const stylePressing =
    style.error || !style.data
      ? 0
      : clampStyle((style.data as { style_pressing?: number }).style_pressing ?? 0);

  const tempo = await supabase.from('clubs').select('style_tempo').eq('id', clubId).maybeSingle();
  const styleTempo =
    tempo.error || !tempo.data
      ? 0
      : clampStyle((tempo.data as { style_tempo?: number }).style_tempo ?? 0);

  if (rich.error || !rich.data) {
    return { coachGroup: null, levels: emptyStadiumLevels(), stylePressing, styleTempo };
  }

  const row = rich.data as {
    coach_group: string | null;
    stands_level: number;
    pitch_level: number;
    training_center_level: number;
  };
  return {
    coachGroup: isCoachGroup(row.coach_group) ? row.coach_group : null,
    levels: {
      stands: clampLevel(row.stands_level),
      pitch: clampLevel(row.pitch_level),
      trainingCenter: clampLevel(row.training_center_level),
    },
    stylePressing,
    styleTempo,
  };
}
