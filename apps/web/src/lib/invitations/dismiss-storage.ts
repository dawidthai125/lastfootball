/** sessionStorage key prefix — presentation dismiss only (LFE-NOTIFICATIONS-01). */
export const INVITATION_DISMISS_KEY_PREFIX = 'lf:invitation:dismissed:';

export function invitationDismissStorageKey(invitationId: string): string {
  return `${INVITATION_DISMISS_KEY_PREFIX}${invitationId}`;
}
