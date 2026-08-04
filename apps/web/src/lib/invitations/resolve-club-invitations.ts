/**
 * Club invitations — Information Thin (LFE-NOTIFICATIONS-01).
 * Pure composition from Messages + Hub · never mutates domain · no sessionStorage.
 */

import type { HubCta, HubSession } from '@/lib/hub/types';
import type { ClubMessagesDto } from '@/lib/messages';
import { UI_COPY } from '@/lib/ui/copy';

export type ClubInvitationKind = 'transfer_decision' | 'matchday';

export type ClubInvitationDto = {
  readonly id: string;
  readonly kind: ClubInvitationKind;
  readonly subject: string;
  readonly href: string;
  readonly source: 'messages' | 'hub';
};

export type ClubInvitationsDto = {
  /** Length 0 or 1 — UI must not re-pick / re-sort. */
  readonly items: readonly ClubInvitationDto[];
};

export type ResolveClubInvitationsInput = {
  readonly messages: ClubMessagesDto;
  readonly hubSession: HubSession;
  readonly primary: HubCta;
  readonly nextFixtureId: string | null;
  /** true = do not emit matchday (already on Hub / match decision path). */
  readonly suppressMatchday?: boolean;
};

/**
 * Sole Invitation Layer SSOT (LFE-NOTIFICATIONS-01).
 * Priority: transfer decision (Messages) → matchday Hub Primary.
 */
export function resolveClubInvitations(input: ResolveClubInvitationsInput): ClubInvitationsDto {
  const decision = input.messages.items.find((m) => m.priority === 'decision');
  if (decision) {
    return {
      items: [
        {
          id: decision.id,
          kind: 'transfer_decision',
          subject: decision.subject,
          href: decision.href,
          source: 'messages',
        },
      ],
    };
  }

  if (
    !input.suppressMatchday &&
    input.hubSession === 'matchday' &&
    input.primary.id === 'play-next-match' &&
    input.nextFixtureId
  ) {
    return {
      items: [
        {
          id: `inv:matchday:${input.nextFixtureId}`,
          kind: 'matchday',
          subject: UI_COPY.invitationMatchday,
          href: input.primary.href,
          source: 'hub',
        },
      ],
    };
  }

  return { items: [] };
}
