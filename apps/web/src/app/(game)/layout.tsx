import type { ReactNode } from 'react';

import { ClubProvider } from '@/components/club/ClubProvider';
import { AppShell } from '@/components/layout/AppShell';
import { getManagerClub } from '@/lib/club/get-manager-club';

/** Game chrome — Hub and in-game routes with live club DTO when present. */
export default async function GameLayout({ children }: { children: ReactNode }) {
  const club = await getManagerClub();
  return (
    <ClubProvider club={club}>
      <AppShell>{children}</AppShell>
    </ClubProvider>
  );
}
