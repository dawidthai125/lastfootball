import { redirect } from 'next/navigation';

import { TrainingView } from '@/components/training/TrainingView';
import { readClubBuild } from '@/lib/club/read-build';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { createClient } from '@/lib/supabase/server';
import { countPlayedInList, listClubFixtures } from '@/lib/fixtures';
import { listClubPlayers } from '@/lib/squad/get-players';
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
    playedCount: countPlayedInList(fixtures.filter((f) => f.competition === 'league')),
    lastTrainingOn: club.lastTrainingOn,
    activePlayers,
  });

  const supabase = await createClient();
  const build = await readClubBuild(supabase, club.id);

  return (
    <TrainingView
      training={training}
      coachGroup={build.coachGroup}
      cash={club.cashBalance}
      stylePressing={build.stylePressing}
      styleTempo={build.styleTempo}
    />
  );
}
