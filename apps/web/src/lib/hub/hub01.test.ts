import { describe, expect, it } from 'vitest';

import type { ClubDto } from '@/lib/club/types';
import { isFirstMatchCompleted } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';

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

function fixture(partial?: Partial<FixtureDto>): FixtureDto {
  return {
    id: 'fix-1',
    clubId: 'c1',
    matchday: 1,
    competition: 'league',
    opponentClubId: 'opp-wilki-polnocy',
    opponent: { id: 'opp-wilki-polnocy', name: 'Wilki Północy', shortName: 'WLP' },
    isHome: true,
    status: 'upcoming',
    homeScore: null,
    awayScore: null,
    playedAt: null,
    createdAt: '2026-07-24T12:00:00.000Z',
    ...partial,
  };
}

describe('hub resolveHubPhase', () => {
  it('returns NEW_CLUB when first match incomplete', () => {
    expect(resolveHubPhase(null)).toBe('NEW_CLUB');
    expect(resolveHubPhase(club())).toBe('NEW_CLUB');
    expect(isFirstMatchCompleted(club())).toBe(false);
  });

  it('returns EARLY_CLUB when first match completed (Thin A — never SEASON)', () => {
    expect(resolveHubPhase(club({ firstMatchCompletedAt: '2026-07-24T12:00:00.000Z' }))).toBe(
      'EARLY_CLUB',
    );
  });
});

describe('hub session + primary CTA', () => {
  it('matchday + upcoming → Przygotuj mecz', () => {
    const phase = 'EARLY_CLUB' as const;
    const next = fixture();
    const session = resolveHubSession(phase, next, null);
    expect(session).toBe('matchday');
    const primary = resolvePrimaryCta(phase, session, { nextFixture: next, hasFixtures: true });
    expect(primary.access).toBe('open');
    expect(primary.id).toBe('play-next-match');
    expect(primary.href).toBe(`/match/${next.id}`);
  });

  it('idle without upcoming → Zobacz skład', () => {
    const phase = 'EARLY_CLUB' as const;
    const session = resolveHubSession(phase, null, null);
    expect(session).toBe('idle');
    const primary = resolvePrimaryCta(phase, session, { nextFixture: null });
    expect(primary.href).toBe('/squad');
  });

  it('post_match when played and no upcoming', () => {
    const phase = 'EARLY_CLUB' as const;
    const played = fixture({ status: 'played', homeScore: 2, awayScore: 1, matchday: 1 });
    expect(resolveHubSession(phase, null, played)).toBe('post_match');
  });

  it('opens Terminarz secondary when hasFixtures', () => {
    const secondary = resolveSecondaryCtas('EARLY_CLUB', { hasFixtures: true });
    const term = secondary.find((c) => c.id === 'fixtures');
    expect(term?.access).toBe('open');
    expect(secondary.length).toBeLessThanOrEqual(5);
  });
});

describe('hub nav unlock', () => {
  it('opens matches; soft-locks mid-game modules on EARLY_CLUB', () => {
    expect(resolveNavAccess('squad', 'EARLY_CLUB')).toBe('open');
    expect(resolveNavAccess('matches', 'EARLY_CLUB')).toBe('open');
    expect(resolveNavAccess('training', 'EARLY_CLUB')).toBe('soft_locked');
    expect(resolveNavAccess('transfers', 'EARLY_CLUB')).toBe('soft_locked');
    expect(resolveNavAccess('finance', 'EARLY_CLUB')).toBe('soft_locked');
    expect(resolveNavAccess('league', 'EARLY_CLUB')).toBe('soft_locked');
  });
});
