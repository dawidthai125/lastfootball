import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * LFE-NOTIFICATIONS-01 — naming + mock gate (Invitation Layer, not Notification*).
 */
describe('LFE-NOTIFICATIONS-01 invitation gate', () => {
  const root = process.cwd();
  const invitationsDir = join(root, 'src/lib/invitations');

  it('invitations module exists under lib/invitations', () => {
    expect(existsSync(invitationsDir)).toBe(true);
  });

  it('new invitations sources avoid Notification* identifiers', () => {
    const files = readdirSync(invitationsDir).filter((f) => f.endsWith('.ts'));
    for (const file of files) {
      const src = readFileSync(join(invitationsDir, file), 'utf8');
      expect(src).not.toMatch(/\bClubNotifications?Dto\b/);
      expect(src).not.toMatch(/\bresolveClubNotifications\b/);
      expect(src).not.toMatch(/\bNotificationToast/);
    }
  });

  it('no lib/notifications module', () => {
    expect(existsSync(join(root, 'src/lib/notifications'))).toBe(false);
  });

  it('resolver exports Invitation naming', () => {
    const src = readFileSync(join(invitationsDir, 'resolve-club-invitations.ts'), 'utf8');
    expect(src).toContain('resolveClubInvitations');
    expect(src).toContain('ClubInvitationsDto');
    expect(src).toContain('ClubInvitationDto');
  });

  it('Overlay chrome uses messages kind (D43 peek), not notifications', () => {
    const provider = readFileSync(join(root, 'src/components/overlay/OverlayProvider.tsx'), 'utf8');
    const rootOverlay = readFileSync(join(root, 'src/components/overlay/OverlayRoot.tsx'), 'utf8');
    expect(provider).toContain("'messages'");
    expect(provider).not.toContain("'notifications'");
    expect(rootOverlay).toContain("active === 'messages'");
    expect(rootOverlay).not.toContain("active === 'notifications'");
  });
});
