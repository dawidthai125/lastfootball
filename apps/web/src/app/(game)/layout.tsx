import type { ReactNode } from 'react';

import { AppShell } from '@/components/layout/AppShell';

/** Game chrome — Hub and all in-game routes. */
export default function GameLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
