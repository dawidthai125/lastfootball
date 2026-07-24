import type { ReactNode } from 'react';

import { ClubProvider } from '@/components/club/ClubProvider';
import { AppShell } from '@/components/layout/AppShell';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { ensureClubFixtures } from '@/lib/fixtures';

/** Game chrome — Hub and in-game routes with live club DTO when present. */
export default async function GameLayout({ children }: { children: ReactNode }) {
  const club = await getManagerClub();
  let hasFixtures = false;
  if (club && isFirstMatchCompleted(club)) {
    const fixtures = await ensureClubFixtures(club.id);
    hasFixtures = fixtures.length > 0;
  }
  return (
    <ClubProvider club={club} hasFixtures={hasFixtures}>
      <AppShell>{children}</AppShell>
    </ClubProvider>
  );
}
