'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { ClubDto } from '@/lib/club/types';

type ClubContextValue = {
  readonly club: ClubDto | null;
  /** S1: fixtures slate exists → Hub SEASON (LFE-LEAGUE-02). */
  readonly hasFixtures: boolean;
  /** Derived: played fixtures >= training unlock (LFE-TRAINING-01). */
  readonly trainingUnlocked: boolean;
};

const ClubContext = createContext<ClubContextValue>({
  club: null,
  hasFixtures: false,
  trainingUnlocked: false,
});

export function ClubProvider({
  club,
  hasFixtures = false,
  trainingUnlocked = false,
  children,
}: {
  club: ClubDto | null;
  hasFixtures?: boolean;
  trainingUnlocked?: boolean;
  children: ReactNode;
}) {
  return (
    <ClubContext.Provider value={{ club, hasFixtures, trainingUnlocked }}>
      {children}
    </ClubContext.Provider>
  );
}

export function useClub(): ClubDto | null {
  return useContext(ClubContext).club;
}

export function useHasFixtures(): boolean {
  return useContext(ClubContext).hasFixtures;
}

export function useTrainingUnlocked(): boolean {
  return useContext(ClubContext).trainingUnlocked;
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
