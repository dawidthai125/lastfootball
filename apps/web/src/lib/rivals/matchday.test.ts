import { describe, expect, it } from 'vitest';

import { mapFixtureRow } from '@/lib/fixtures/map-fixture';
import { createSessionFromLeagueFixture } from '@/lib/fixtures/create-session';
import type { ClubDto } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import type { RosterPlayerSeed } from '@/lib/squad';
import type { PitchRole } from '@lastfootball/lfe';

import { nextChallengeMatchday } from '@/lib/rivals/matchday';

describe('rival challenges', () => {
  it('starts challenge matchdays at 201 and steps past used ones', () => {
    expect(nextChallengeMatchday([1, 22, 101])).toBe(201);
    expect(nextChallengeMatchday([201, 202])).toBe(203);
  });

  it('maps a challenge row without an AI catalog id', () => {
    const dto = mapFixtureRow({
      id: 'fx',
      club_id: 'club',
      matchday: 201,
      competition: 'challenge',
      opponent_club_id: '11111111-1111-1111-1111-111111111111',
      is_home: true,
      status: 'upcoming',
      home_score: null,
      away_score: null,
      played_at: null,
      created_at: '2026-11-11T00:00:00.000Z',
    });
    expect(dto.competition).toBe('challenge');
    expect(dto.opponent.name).toBe('Rywal');
  });

  it('plays the rival squad instead of an AI seed', () => {
    const roles: PitchRole[] = ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'CM', 'RW', 'CM', 'ST', 'LW'];
    const xi = (prefix: string): RosterPlayerSeed[] =>
      roles.map((role, index) => ({
        id: `${prefix}-${index}`,
        name: `${prefix}${index}`,
        number: index + 1,
        pos: 'ŚP',
        role,
        starter: true,
        skill: 60,
      }));
    const club: ClubDto = {
      id: 'c1',
      ownerId: 'u1',
      name: 'Test FC',
      shortName: 'TFC',
      primaryColor: '#112233',
      secondaryColor: '#445566',
      crestTemplateId: 'crest-a',
      createdAt: '2026-01-01T00:00:00.000Z',
      firstMatchCompletedAt: '2026-07-24T12:00:00.000Z',
      cashBalance: 100_000,
      transferWindowOpen: true,
      lastTrainingOn: null,
      seasonNumber: 1,
      seasonPhase: 'in_season',
      leagueTier: 'iv',
    };
    const fixture: FixtureDto = {
      id: 'fx-1',
      clubId: 'c1',
      matchday: 201,
      competition: 'challenge',
      opponentClubId: 'rival-club',
      opponent: { id: 'rival-club', name: 'Rywal FC', shortName: 'RYW' },
      isHome: true,
      status: 'upcoming',
      homeScore: null,
      awayScore: null,
      playedAt: null,
      createdAt: '2026-11-11T00:00:00.000Z',
    };
    const session = createSessionFromLeagueFixture(
      club,
      fixture,
      xi('home'),
      [],
      '4-4-2',
      xi('away'),
    );
    const ids = session.getMatchState().players.map((player) => String(player.id));
    expect(ids).toContain('away-0');
    expect(ids.some((id) => id.startsWith('o-'))).toBe(false);
  });
});
