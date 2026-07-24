import { describe, expect, it } from 'vitest';

import type { ClubDto } from '@/lib/club/types';
import { isFirstMatchCompleted } from '@/lib/club/types';

import {
  resolveHubPhase,
  resolveHubSession,
  resolvePrimaryCta,
  resolveSecondaryCtas,
  resolveNavAccess,
} from '@/lib/hub';

function club(partial?: Partial<ClubDto>): ClubDto {
  return {
    id: 'c1',
    ownerId: 'u1',
    name: 'Test FC',
    shortName: 'TFC',
    primaryColor: '#112233',
    secondaryColor: '#445566',
    crestTemplateId: 'crest-a',
    createdAt: '2026-01-01T00:00:00.000Z',
    firstMatchCompletedAt: null,
    ...partial,
  };
}

describe('hub resolveHubPhase', () => {
  it('returns NEW_CLUB when first match incomplete', () => {
    expect(resolveHubPhase(null)).toBe('NEW_CLUB');
    expect(resolveHubPhase(club())).toBe('NEW_CLUB');
    expect(isFirstMatchCompleted(club())).toBe(false);
  });

  it('returns EARLY_CLUB when first match completed', () => {
    expect(resolveHubPhase(club({ firstMatchCompletedAt: '2026-07-24T12:00:00.000Z' }))).toBe(
      'EARLY_CLUB',
    );
  });
});

describe('hub primary CTA', () => {
  it('resolves exactly one open primary for EARLY_CLUB', () => {
    const phase = 'EARLY_CLUB' as const;
    const session = resolveHubSession(phase);
    const primary = resolvePrimaryCta(phase, session);
    expect(primary.access).toBe('open');
    expect(primary.href).toBe('/squad');
    expect(resolveSecondaryCtas(phase).length).toBeLessThanOrEqual(5);
  });
});

describe('hub nav unlock', () => {
  it('soft-locks mid-game modules on EARLY_CLUB', () => {
    expect(resolveNavAccess('squad', 'EARLY_CLUB')).toBe('open');
    expect(resolveNavAccess('training', 'EARLY_CLUB')).toBe('soft_locked');
    expect(resolveNavAccess('transfers', 'EARLY_CLUB')).toBe('soft_locked');
    expect(resolveNavAccess('finance', 'EARLY_CLUB')).toBe('soft_locked');
    expect(resolveNavAccess('league', 'EARLY_CLUB')).toBe('soft_locked');
  });
});
