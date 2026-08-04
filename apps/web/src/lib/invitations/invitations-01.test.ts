import { describe, expect, it } from 'vitest';

import { resolveClubInvitations } from '@/lib/invitations/resolve-club-invitations';
import type { ClubMessagesDto } from '@/lib/messages';
import type { HubCta } from '@/lib/hub/types';

const emptyMessages: ClubMessagesDto = { items: [] };

const matchPrimary: HubCta = {
  id: 'play-next-match',
  label: 'Idź do meczu',
  href: '/match/fix-1/tunnel',
  access: 'open',
};

const squadPrimary: HubCta = {
  id: 'view-squad',
  label: 'Zobacz kadrę',
  href: '/squad',
  access: 'open',
};

const decisionMessages: ClubMessagesDto = {
  items: [
    {
      id: 'msg:h2h:offer-a:seller',
      kind: 'offer_brief',
      subject: 'Oferta H2H: A. Player',
      fromLabel: 'Transfery',
      href: '/transfers',
      priority: 'decision',
    },
    {
      id: 'msg:transfer-window',
      kind: 'system',
      subject: 'Okno transferowe jest otwarte',
      fromLabel: 'System',
      href: '/transfers',
      priority: 'info',
    },
  ],
};

describe('resolveClubInvitations (LFE-NOTIFICATIONS-01)', () => {
  it('returns empty when no Variant B signals', () => {
    const dto = resolveClubInvitations({
      messages: emptyMessages,
      hubSession: 'idle',
      primary: squadPrimary,
      nextFixtureId: null,
    });
    expect(dto.items).toEqual([]);
  });

  it('ignores Messages info (E1) — not an invitation source', () => {
    const dto = resolveClubInvitations({
      messages: {
        items: [
          {
            id: 'msg:transfer-window',
            kind: 'system',
            subject: 'Okno transferowe jest otwarte',
            fromLabel: 'System',
            href: '/transfers',
            priority: 'info',
          },
        ],
      },
      hubSession: 'idle',
      primary: squadPrimary,
      nextFixtureId: null,
    });
    expect(dto.items).toEqual([]);
  });

  it('transfer decision → single invitation REUSE message id/href/subject', () => {
    const dto = resolveClubInvitations({
      messages: decisionMessages,
      hubSession: 'matchday',
      primary: matchPrimary,
      nextFixtureId: 'fix-1',
    });
    expect(dto.items).toHaveLength(1);
    expect(dto.items[0]).toEqual({
      id: 'msg:h2h:offer-a:seller',
      kind: 'transfer_decision',
      subject: 'Oferta H2H: A. Player',
      href: '/transfers',
      source: 'messages',
    });
  });

  it('matchday only → hub invitation when Primary is play-next-match', () => {
    const dto = resolveClubInvitations({
      messages: emptyMessages,
      hubSession: 'matchday',
      primary: matchPrimary,
      nextFixtureId: 'fix-1',
    });
    expect(dto.items).toHaveLength(1);
    expect(dto.items[0]).toMatchObject({
      id: 'inv:matchday:fix-1',
      kind: 'matchday',
      href: '/match/fix-1/tunnel',
      source: 'hub',
    });
  });

  it('both signals → transfer wins (≤1)', () => {
    const dto = resolveClubInvitations({
      messages: decisionMessages,
      hubSession: 'matchday',
      primary: matchPrimary,
      nextFixtureId: 'fix-1',
    });
    expect(dto.items).toHaveLength(1);
    expect(dto.items[0]!.kind).toBe('transfer_decision');
  });

  it('suppressMatchday skips hub invitation', () => {
    const dto = resolveClubInvitations({
      messages: emptyMessages,
      hubSession: 'matchday',
      primary: matchPrimary,
      nextFixtureId: 'fix-1',
      suppressMatchday: true,
    });
    expect(dto.items).toEqual([]);
  });

  it('matchday without play-next-match Primary → empty', () => {
    const dto = resolveClubInvitations({
      messages: emptyMessages,
      hubSession: 'matchday',
      primary: squadPrimary,
      nextFixtureId: 'fix-1',
    });
    expect(dto.items).toEqual([]);
  });
});
