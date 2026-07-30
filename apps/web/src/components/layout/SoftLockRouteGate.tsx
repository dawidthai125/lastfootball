'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { useClub, useHasFixtures, useTrainingUnlocked } from '@/components/club/ClubProvider';
import { SoftLockState } from '@/components/ui/SoftLockState';
import { resolveHubPhase, isModuleSoftLocked } from '@/lib/hub';
import { resolveNavItemForPathname } from '@/lib/hub/route-access';
import { UI_COPY } from '@/lib/ui/copy';

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
  const phase = resolveHubPhase(club, { hasFixtures });
  const ctx = {
    transferWindowOpen: club?.transferWindowOpen,
    trainingUnlocked,
  };

  const item = resolveNavItemForPathname(pathname);
  if (!item || !isModuleSoftLocked(item.id, phase, ctx)) {
    return children;
  }

  return (
    <SoftLockState
      waId="ILL-002"
      illustrationSrc="/assets/world-art/ill-002-softlock-training.png"
      title={`${item.label} jest ${UI_COPY.softLockUnavailable}`}
      reason={UI_COPY.softLockReason}
    />
  );
}
