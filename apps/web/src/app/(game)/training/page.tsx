import { redirect } from 'next/navigation';

import { TrainingView } from '@/components/training/TrainingView';
import { getManagerClub } from '@/lib/club/get-manager-club';
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
    playedCount: countPlayedInList(fixtures),
    lastTrainingOn: club.lastTrainingOn,
    activePlayers,
  });

  return <TrainingView training={training} />;
}
