'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useClubInvitations } from '@/components/club/ClubProvider';
import { invitationDismissStorageKey, type ClubInvitationDto } from '@/lib/invitations';
import { UI_COPY } from '@/lib/ui/copy';

import './invitation-toast.css';

function readDismissed(id: string): boolean {
  try {
    return sessionStorage.getItem(invitationDismissStorageKey(id)) === '1';
  } catch {
    return false;
  }
}

function writeDismissed(id: string): void {
  try {
    sessionStorage.setItem(invitationDismissStorageKey(id), '1');
  } catch {
    /* private mode / blocked storage — toast can still dismiss via local state */
  }
}

function shouldSuppressMatchdayPath(pathname: string): boolean {
  if (pathname === '/hub' || pathname === '/hub/') return true;
  if (pathname === '/match' || pathname.startsWith('/match/')) return true;
  return false;
}

/**
 * Invitation toast — presentation only (LFE-NOTIFICATIONS-01).
 * Dismiss = sessionStorage; never mutates domain.
 */
export function InvitationToastHost() {
  const invitations = useClubInvitations();
  const pathname = usePathname();
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const candidate: ClubInvitationDto | null = invitations.items[0] ?? null;

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!candidate) {
      setDismissedId(null);
      return;
    }
    setDismissedId(readDismissed(candidate.id) ? candidate.id : null);
  }, [candidate]);

  const onDismiss = useCallback(() => {
    if (!candidate) return;
    writeDismissed(candidate.id);
    setDismissedId(candidate.id);
  }, [candidate]);

  if (!hydrated || !candidate) return null;
  if (dismissedId === candidate.id) return null;
  if (candidate.kind === 'matchday' && shouldSuppressMatchdayPath(pathname)) return null;
  // Immersive Match Path: no chrome toast (same as TopBar hide).
  if (pathname === '/match' || pathname.startsWith('/match/')) return null;

  return (
    <div
      className="lf-invitation-toast lf-motion-enter"
      role="status"
      aria-live="polite"
      aria-label={UI_COPY.invitationAria}
      data-lf-impl="LFE-NOTIFICATIONS-01"
    >
      <Link
        href={candidate.href}
        className="lf-invitation-toast__body lf-motion-press"
        onClick={onDismiss}
      >
        <span className="lf-invitation-toast__eyebrow">{UI_COPY.invitationEyebrow}</span>
        <span className="lf-invitation-toast__subject">{candidate.subject}</span>
        <span className="lf-invitation-toast__cta">{UI_COPY.invitationOpen}</span>
      </Link>
      <button
        type="button"
        className="lf-invitation-toast__dismiss"
        aria-label={UI_COPY.invitationDismiss}
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  );
}
