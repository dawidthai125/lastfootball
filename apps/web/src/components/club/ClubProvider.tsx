'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { ClubDto } from '@/lib/club/types';
import type { ClubInvitationsDto } from '@/lib/invitations';
import type { ClubMessagesDto } from '@/lib/messages';

const EMPTY_MESSAGES: ClubMessagesDto = { items: [] };
const EMPTY_INVITATIONS: ClubInvitationsDto = { items: [] };

type ClubContextValue = {
  readonly club: ClubDto | null;
  /** S1: fixtures slate exists → Hub SEASON (LFE-LEAGUE-02). */
  readonly hasFixtures: boolean;
  /** Derived: played fixtures >= training unlock (LFE-TRAINING-01). */
  readonly trainingUnlocked: boolean;
  /** Derived inbox — resolveClubMessages only (LFE-MESSAGES-01 · D43). */
  readonly messages: ClubMessagesDto;
  /** Invitation Layer — resolveClubInvitations composition (LFE-NOTIFICATIONS-01). */
  readonly invitations: ClubInvitationsDto;
};

const ClubContext = createContext<ClubContextValue>({
  club: null,
  hasFixtures: false,
  trainingUnlocked: false,
  messages: EMPTY_MESSAGES,
  invitations: EMPTY_INVITATIONS,
});

export function ClubProvider({
  club,
  hasFixtures = false,
  trainingUnlocked = false,
  messages = EMPTY_MESSAGES,
  invitations = EMPTY_INVITATIONS,
  children,
}: {
  club: ClubDto | null;
  hasFixtures?: boolean;
  trainingUnlocked?: boolean;
  messages?: ClubMessagesDto;
  invitations?: ClubInvitationsDto;
  children: ReactNode;
}) {
  return (
    <ClubContext.Provider
      value={{ club, hasFixtures, trainingUnlocked, messages, invitations }}
    >
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

/** Same DTO as /messages — Overlay / nav badge (D43). */
export function useClubMessages(): ClubMessagesDto {
  return useContext(ClubContext).messages;
}

/** Invitation Layer DTO — toast host only (≠ Messages). */
export function useClubInvitations(): ClubInvitationsDto {
  return useContext(ClubContext).invitations;
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
