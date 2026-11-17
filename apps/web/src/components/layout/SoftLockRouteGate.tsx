'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import {
  useClub,
  useHasFixtures,
  usePlayedCount,
  useTrainingUnlocked,
} from '@/components/club/ClubProvider';
import { SoftLockState } from '@/components/ui/SoftLockState';
import { resolveHubPhase, isModuleSoftLocked } from '@/lib/hub';
import { resolveNavItemForPathname } from '@/lib/hub/route-access';
import { resolveNavLockReason } from '@/lib/nav-lock-copy';
import { UI_COPY } from '@/lib/ui/copy';
import { resolveSoftLockIllustration } from '@/lib/ui/soft-lock-illustration';

/**
 * Generic route soft-lock gate (LFE-SOFTLOCK-01 · D63–D67).
 * Access SSOT: FLAT_NAV → isModuleSoftLocked (= resolveNavAccess) → SoftLockState.
 * Outside FLAT_NAV → transparent pass-through (D67). No domain logic.
 */
export function SoftLockRouteGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const club = useClub();
  const hasFixtures = useHasFixtures();
  const trainingUnlocked = useTrainingUnlocked();
  const playedCount = usePlayedCount();
  const phase = resolveHubPhase(club, { hasFixtures });
  const ctx = {
    transferWindowOpen: club?.transferWindowOpen,
    trainingUnlocked,
  };

  const item = resolveNavItemForPathname(pathname);
  if (!item || !isModuleSoftLocked(item.id, phase, ctx)) {
    return children;
  }

  const art = resolveSoftLockIllustration(item.id);

  return (
    <SoftLockState
      waId={art.waId}
      illustrationSrc={art.illustrationSrc}
      title={UI_COPY.softLockTitle(item.label)}
      reason={resolveNavLockReason(item.id, playedCount)}
    />
  );
}
