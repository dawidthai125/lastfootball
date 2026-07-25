import type { ReactNode } from 'react';

import { ClubProvider } from '@/components/club/ClubProvider';
import { AppShell } from '@/components/layout/AppShell';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { countPlayedInList, ensureClubFixtures, hasPlayedUnlock } from '@/lib/fixtures';
import { TRAINING_THIN } from '@/lib/training/types';

/** Game chrome — Hub and in-game routes with live club DTO when present. */
export default async function GameLayout({ children }: { children: ReactNode }) {
  const club = await getManagerClub();
  let hasFixtures = false;
  let trainingUnlocked = false;
  if (club && isFirstMatchCompleted(club)) {
    const fixtures = await ensureClubFixtures(club.id);
    hasFixtures = fixtures.length > 0;
    const playedCount = countPlayedInList(fixtures);
    trainingUnlocked = hasPlayedUnlock(playedCount, TRAINING_THIN.UNLOCK_AFTER_PLAYED);
  }
  return (
    <ClubProvider club={club} hasFixtures={hasFixtures} trainingUnlocked={trainingUnlocked}>
      <AppShell>{children}</AppShell>
    </ClubProvider>
  );
}
