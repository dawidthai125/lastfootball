import { describe, expect, it } from 'vitest';

import type { ClubDto } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import { resolveClubAchievements } from '@/lib/achievements';

function club(partial?: Partial<ClubDto>): ClubDto {
  return {
    id: 'c1',
    ownerId: 'u1',
    name: 'Test FC',
    shortName: 'TFC',
    primaryColor: '#112233',
    secondaryColor: '#445566',
    crestTemplateId: 'crest-a',
    createdAt: '2026-07-20T10:00:00.000Z',
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

describe('resolveClubAchievements', () => {
  it('always includes club_founded from createdAt', () => {
    const dto = resolveClubAchievements({ club: club(), fixtures: [] });
    expect(dto.milestones).toHaveLength(1);
    expect(dto.milestones[0]).toMatchObject({
      id: 'club_founded',
      category: 'club',
      occurredAt: '2026-07-20T10:00:00.000Z',
    });
  });

  it('adds first_match when firstMatchCompletedAt set (immutable presence)', () => {
    const c = club({ firstMatchCompletedAt: '2026-07-21T18:00:00.000Z' });
    const a = resolveClubAchievements({ club: c, fixtures: [] });
    const b = resolveClubAchievements({ club: c, fixtures: [] });
    expect(a.milestones.map((m) => m.id)).toEqual(['club_founded', 'first_match']);
    expect(a).toEqual(b);
  });

  it('adds first_league_match from played fixture; sorts chronologically', () => {
    const dto = resolveClubAchievements({
      club: club({
        createdAt: '2026-07-20T10:00:00.000Z',
        firstMatchCompletedAt: '2026-07-21T12:00:00.000Z',
      }),
      fixtures: [
        fixture({
          id: 'fx-2',
          status: 'played',
          playedAt: '2026-07-25T15:00:00.000Z',
          homeScore: 1,
          awayScore: 0,
        }),
        fixture({
          id: 'fx-1',
          status: 'played',
          playedAt: '2026-07-22T15:00:00.000Z',
          homeScore: 2,
          awayScore: 1,
        }),
      ],
    });
    expect(dto.milestones.map((m) => m.id)).toEqual([
      'club_founded',
      'first_match',
      'first_league_match',
    ]);
    expect(dto.milestones.find((m) => m.id === 'first_league_match')?.occurredAt).toBe(
      '2026-07-22T15:00:00.000Z',
    );
  });

  it('adds first_training when lastTrainingOn set', () => {
    const dto = resolveClubAchievements({
      club: club({
        firstMatchCompletedAt: '2026-07-21T12:00:00.000Z',
        lastTrainingOn: '2026-07-23',
      }),
      fixtures: [],
    });
    expect(dto.milestones.map((m) => m.id)).toContain('first_training');
    expect(dto.milestones.find((m) => m.id === 'first_training')?.occurredAt).toBe('2026-07-23');
  });

  it('is deterministic for identical domain state', () => {
    const input = {
      club: club({
        firstMatchCompletedAt: '2026-07-21T12:00:00.000Z',
        lastTrainingOn: '2026-07-23',
      }),
      fixtures: [
        fixture({
          status: 'played',
          playedAt: '2026-07-22T15:00:00.000Z',
          homeScore: 1,
          awayScore: 0,
        }),
      ],
    };
    expect(resolveClubAchievements(input)).toEqual(resolveClubAchievements(input));
  });

  it('never returns xp / score / reward fields', () => {
    const { milestones } = resolveClubAchievements({
      club: club({ firstMatchCompletedAt: '2026-07-21T12:00:00.000Z' }),
      fixtures: [],
    });
    for (const m of milestones) {
      expect(m).toEqual({
        id: expect.any(String),
        category: expect.any(String),
        title: expect.any(String),
        detail: expect.any(String),
        occurredAt: expect.anything(),
      });
      expect(m).not.toHaveProperty('xp');
      expect(m).not.toHaveProperty('score');
      expect(m).not.toHaveProperty('reward');
      expect(m).not.toHaveProperty('cash');
    }
  });

  it('does not import or depend on Daily Goal module', async () => {
    const src = await import('@/lib/achievements/resolve-club-achievements');
    expect(src.resolveClubAchievements).toBeTypeOf('function');
    // Module graph isolation: achievements barrel must not re-export daily
    const barrel = await import('@/lib/achievements');
    expect('resolveClubDailyGoal' in barrel).toBe(false);
  });
});
