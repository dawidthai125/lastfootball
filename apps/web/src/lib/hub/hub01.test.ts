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
    cashBalance: 100_000,
    transferWindowOpen: false,
    ...partial,
  };
}

function fixture(partial?: Partial<FixtureDto>): FixtureDto {
  return {
    id: 'fx-1',
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

const afterFirst = club({ firstMatchCompletedAt: '2026-07-24T12:00:00.000Z' });

describe('hub resolveHubPhase', () => {
  it('returns NEW_CLUB when first match incomplete', () => {
    expect(resolveHubPhase(null)).toBe('NEW_CLUB');
    expect(resolveHubPhase(club())).toBe('NEW_CLUB');
    expect(isFirstMatchCompleted(club())).toBe(false);
  });

  it('returns EARLY_CLUB when first match done and no fixtures (S1)', () => {
    expect(resolveHubPhase(afterFirst)).toBe('EARLY_CLUB');
    expect(resolveHubPhase(afterFirst, { hasFixtures: false })).toBe('EARLY_CLUB');
  });

  it('returns SEASON when first match done and fixtures exist (S1)', () => {
    expect(resolveHubPhase(afterFirst, { hasFixtures: true })).toBe('SEASON');
  });
});

describe('hub session + primary CTA', () => {
  it('SEASON matchday + upcoming → Przygotuj mecz (same as EARLY_CLUB)', () => {
    const phase = 'SEASON' as const;
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
    const phase = 'SEASON' as const;
    const played = fixture({ status: 'played', homeScore: 2, awayScore: 1, matchday: 1 });
    expect(resolveHubSession(phase, null, played)).toBe('post_match');
  });

  it('opens Terminarz secondary when hasFixtures', () => {
    const secondary = resolveSecondaryCtas('SEASON', { hasFixtures: true });
    const term = secondary.find((c) => c.id === 'fixtures');
    expect(term?.access).toBe('open');
    expect(secondary.length).toBeLessThanOrEqual(5);
  });

  it('opens Tabela secondary on SEASON', () => {
    const secondary = resolveSecondaryCtas('SEASON', { hasFixtures: true });
    const league = secondary.find((c) => c.id === 'league');
    expect(league?.access).toBe('open');
    expect(league?.href).toBe('/league');
  });

  it('soft-locks Tabela on EARLY_CLUB', () => {
    const secondary = resolveSecondaryCtas('EARLY_CLUB', { hasFixtures: false });
    expect(secondary.find((c) => c.id === 'league')?.access).toBe('soft_locked');
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

  it('opens Finanse on SEASON; Transfery need window flag', () => {
    expect(resolveNavAccess('finance', 'SEASON')).toBe('open');
    expect(resolveNavAccess('training', 'SEASON')).toBe('soft_locked');
    expect(resolveNavAccess('transfers', 'SEASON')).toBe('soft_locked');
    expect(resolveNavAccess('transfers', 'SEASON', { transferWindowOpen: true })).toBe('open');
  });

  it('opens Finanse secondary on SEASON', () => {
    const secondary = resolveSecondaryCtas('SEASON', { hasFixtures: true });
    expect(secondary.find((c) => c.id === 'finance')?.access).toBe('open');
    expect(secondary.length).toBeLessThanOrEqual(5);
  });
});
