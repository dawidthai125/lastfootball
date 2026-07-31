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
    lastTrainingOn: null,
    seasonNumber: 1,
    seasonPhase: 'in_season',
    leagueTier: 'iv',
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

  it('returns OFFSEASON when seasonPhase is offseason (LFE-SEASON-END-01)', () => {
    const off = club({
      firstMatchCompletedAt: '2026-07-24T12:00:00.000Z',
      seasonPhase: 'offseason',
    });
    expect(resolveHubPhase(off, { hasFixtures: true })).toBe('OFFSEASON');
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
    expect(primary.href).toBe(`/match/${next.id}/tunnel`);
  });

  it('idle without upcoming → Zobacz kadrę', () => {
    const phase = 'EARLY_CLUB' as const;
    const session = resolveHubSession(phase, null, null);
    expect(session).toBe('idle');
    const primary = resolvePrimaryCta(phase, session, { nextFixture: null });
    expect(primary.href).toBe('/squad');
    expect(primary.label).toBe('Zobacz kadrę');
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

  it('daily loop secondary: Trening · Kadra · Transfery · Finanse · Terminarz', () => {
    const secondary = resolveSecondaryCtas('SEASON', {
      hasFixtures: true,
      trainingUnlocked: true,
      transferWindowOpen: true,
    });
    expect(secondary.map((c) => c.id)).toEqual([
      'training',
      'squad',
      'transfers',
      'finance',
      'fixtures',
    ]);
    expect(secondary.every((c) => c.access === 'open')).toBe(true);
  });

  it('soft-locks Trening / Transfery / Finanse on EARLY_CLUB daily secondary', () => {
    const secondary = resolveSecondaryCtas('EARLY_CLUB', { hasFixtures: false });
    expect(secondary.find((c) => c.id === 'training')?.access).toBe('soft_locked');
    expect(secondary.find((c) => c.id === 'transfers')?.access).toBe('soft_locked');
    expect(secondary.find((c) => c.id === 'finance')?.access).toBe('soft_locked');
    expect(secondary.find((c) => c.id === 'squad')?.access).toBe('open');
    expect(secondary.find((c) => c.id === 'fixtures')?.access).toBe('soft_locked');
  });
});

describe('hub nav unlock', () => {
  it('opens matches; soft-locks mid-game modules on EARLY_CLUB', () => {
    expect(resolveNavAccess('squad', 'EARLY_CLUB')).toBe('open');
    expect(resolveNavAccess('matches', 'EARLY_CLUB')).toBe('open');
    expect(resolveNavAccess('rankings', 'EARLY_CLUB')).toBe('open');
    expect(resolveNavAccess('training', 'EARLY_CLUB')).toBe('soft_locked');
    expect(resolveNavAccess('transfers', 'EARLY_CLUB')).toBe('soft_locked');
    expect(resolveNavAccess('finance', 'EARLY_CLUB')).toBe('soft_locked');
    expect(resolveNavAccess('league', 'EARLY_CLUB')).toBe('soft_locked');
  });

  it('opens Finanse + Sponsors + Board on SEASON; Stadium locked; Transfery need window; Training needs unlock', () => {
    expect(resolveNavAccess('finance', 'SEASON')).toBe('open');
    expect(resolveNavAccess('sponsors', 'SEASON')).toBe('open');
    expect(resolveNavAccess('sponsors', 'OFFSEASON')).toBe('open');
    expect(resolveNavAccess('board', 'SEASON')).toBe('open');
    expect(resolveNavAccess('board', 'OFFSEASON')).toBe('open');
    expect(resolveNavAccess('stadium', 'SEASON')).toBe('soft_locked');
    expect(resolveNavAccess('stadium', 'OFFSEASON')).toBe('soft_locked');
    expect(resolveNavAccess('academy', 'SEASON')).toBe('open');
    expect(resolveNavAccess('scouting', 'SEASON')).toBe('open');
    expect(resolveNavAccess('academy', 'EARLY_CLUB')).toBe('soft_locked');
    expect(resolveNavAccess('scouting', 'EARLY_CLUB')).toBe('soft_locked');
    expect(resolveNavAccess('sponsors', 'EARLY_CLUB')).toBe('soft_locked');
    expect(resolveNavAccess('board', 'EARLY_CLUB')).toBe('soft_locked');
    expect(resolveNavAccess('training', 'SEASON')).toBe('soft_locked');
    expect(resolveNavAccess('training', 'SEASON', { trainingUnlocked: true })).toBe('open');
    expect(resolveNavAccess('transfers', 'SEASON')).toBe('soft_locked');
    expect(resolveNavAccess('transfers', 'SEASON', { transferWindowOpen: true })).toBe('open');
  });

  it('opens Finanse secondary on SEASON', () => {
    const secondary = resolveSecondaryCtas('SEASON', { hasFixtures: true });
    expect(secondary.find((c) => c.id === 'finance')?.access).toBe('open');
    expect(secondary.length).toBeLessThanOrEqual(5);
  });
});
