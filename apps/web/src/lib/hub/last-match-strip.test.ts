import { describe, expect, it } from 'vitest';

import type { ClubDto } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import { buildLastMatchStrip, newestPlayed } from '@/lib/hub/early-club-content';

function club(): ClubDto {
  return {
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
    transferWindowOpen: false,
    lastTrainingOn: null,
    seasonNumber: 1,
    seasonPhase: 'in_season',
    leagueTier: 'iv',
  };
}

function played(partial?: Partial<FixtureDto>): FixtureDto {
  return {
    id: 'fx-played',
    clubId: 'c1',
    matchday: 1,
    competition: 'league',
    opponentClubId: 'opp-wilki-polnocy',
    opponent: { id: 'opp-wilki-polnocy', name: 'Wilki Północy', shortName: 'WLP' },
    isHome: true,
    status: 'played',
    homeScore: 2,
    awayScore: 1,
    playedAt: '2026-11-12T12:00:00.000Z',
    createdAt: '2026-07-24T12:00:00.000Z',
    ...partial,
  };
}

describe('buildLastMatchStrip', () => {
  it('links a scored fixture and shows one note line', () => {
    const strip = buildLastMatchStrip(club(), played({ matchNote: 'Lastovia wygrała 2:1.' }));
    expect(strip.href).toBe('/match/fx-played');
    expect(strip.detail).toBe('Kolejka 1 · Test FC 2:1 Wilki Północy');
    expect(strip.note).toBe('Lastovia wygrała 2:1.');
  });

  it('omits the note line when the note is missing or blank', () => {
    expect(buildLastMatchStrip(club(), played()).note).toBeNull();
    expect(buildLastMatchStrip(club(), played({ matchNote: null })).note).toBeNull();
    expect(buildLastMatchStrip(club(), played({ matchNote: '   ' })).note).toBeNull();
  });

  it('still links a played fixture that has no score', () => {
    const strip = buildLastMatchStrip(
      club(),
      played({ homeScore: null, awayScore: null, matchNote: '' }),
    );
    expect(strip.href).toBe('/match/fx-played');
    expect(strip.detail).toContain('Test FC vs Wilki Północy');
    expect(strip.note).toBeNull();
  });

  it('does not invent a match or a note before any fixture is played', () => {
    const strip = buildLastMatchStrip(club(), null);
    expect(strip.href).toBeNull();
    expect(strip.note).toBeNull();
    expect(strip.detail).toContain('Pierwszy mecz');
    expect(strip.detail).not.toContain('/match/');
  });
});

describe('newestPlayed', () => {
  it('takes the newest match of any competition and names it', () => {
    const league = played({ id: 'l', playedAt: '2026-11-25T07:00:00Z' });
    const human = played({
      id: 'h',
      competition: 'human',
      matchday: 301,
      playedAt: '2026-11-25T09:00:00Z',
    });
    const newest = newestPlayed([human, league], league);
    expect(newest?.id).toBe('h');
    expect(buildLastMatchStrip(club(), newest).detail).toMatch(/^Liga ludzi · /);
    expect(newestPlayed([], league)?.id).toBe('l');
  });
});
