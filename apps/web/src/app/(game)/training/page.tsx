import { redirect } from 'next/navigation';

import { TrainingView } from '@/components/training/TrainingView';
import { readClubBuild } from '@/lib/club/read-build';
import { isPressLine, isPressShape } from '@/lib/training/press-line';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { createClient } from '@/lib/supabase/server';
import { countPlayedInList, listClubFixtures, unlockPlayedCount } from '@/lib/fixtures';
import { listClubPlayers } from '@/lib/squad/get-players';
import { filterSeniorPlayers } from '@/lib/squad/types';
import { resolveClubTraining } from '@/lib/training';

/**
 * Team training — fed only by resolveClubTraining() (LFE-TRAINING-01).
 * Presentation: LFE-UI-IMPL-03 / HF-TRN-01|02.
 */
export default async function TrainingPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const [fixtures, activePlayers] = await Promise.all([
    listClubFixtures(club.id),
    listClubPlayers(club.id),
  ]);
  const training = resolveClubTraining({
    clubId: club.id,
    playedCount: unlockPlayedCount(
      countPlayedInList(fixtures.filter((f) => f.competition === 'league')),
      club.seasonNumber,
    ),
    lastTrainingOn: club.lastTrainingOn,
    activePlayers,
  });

  const supabase = await createClient();
  const build = await readClubBuild(supabase, club.id);
  const press = await supabase
    .from('fixtures')
    .select('id, press_tone')
    .eq('club_id', club.id)
    .eq('status', 'played')
    .order('played_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const pressRow =
    press.error || !press.data ? null : (press.data as { id: string; press_tone: string | null });
  const line = await supabase
    .from('clubs')
    .select('press_line, press_shape')
    .eq('id', club.id)
    .maybeSingle();
  const lineRaw =
    line.error || !line.data ? 'mid' : (line.data as { press_line?: string }).press_line;
  const pressLine = isPressLine(lineRaw ?? '') ? lineRaw : 'mid';
  const shapeRaw =
    line.error || !line.data ? 'flat' : (line.data as { press_shape?: string }).press_shape;
  const pressShape = isPressShape(shapeRaw ?? '') ? shapeRaw : 'flat';

  return (
    <TrainingView
      training={training}
      coachGroup={build.coachGroup}
      cash={club.cashBalance}
      stylePressing={build.stylePressing}
      styleTempo={build.styleTempo}
      styleWidth={build.styleWidth}
      physio={build.physio}
      assistantGroup={build.assistantGroup}
      players={filterSeniorPlayers(activePlayers).map((player) => ({
        id: player.id,
        name: player.name,
        energy: player.energy ?? 80,
      }))}
      pressFixtureId={pressRow?.id ?? null}
      pressDone={Boolean(pressRow?.press_tone)}
      pressLine={pressLine}
      pressShape={pressShape}
    />
  );
}
