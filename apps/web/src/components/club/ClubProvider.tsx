'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { ClubDto } from '@/lib/club/types';

const ClubContext = createContext<ClubDto | null>(null);

export function ClubProvider({ club, children }: { club: ClubDto | null; children: ReactNode }) {
  return <ClubContext.Provider value={club}>{children}</ClubContext.Provider>;
}

export function useClub(): ClubDto | null {
  return useContext(ClubContext);
}

/** Prefer live club; fall back to mock identity only when DTO missing. */
export function useClubIdentity(fallback: { name: string; shortName: string; clubLabel?: string }) {
  const club = useClub();
  if (club) {
    return {
      name: club.name,
      shortName: club.shortName,
      crestTemplateId: club.crestTemplateId,
      primaryColor: club.primaryColor,
      secondaryColor: club.secondaryColor,
      isLive: true as const,
    };
  }
  return {
    name: fallback.name,
    shortName: fallback.shortName,
    crestTemplateId: undefined as string | undefined,
    primaryColor: undefined as string | undefined,
    secondaryColor: undefined as string | undefined,
    isLive: false as const,
  };
}
