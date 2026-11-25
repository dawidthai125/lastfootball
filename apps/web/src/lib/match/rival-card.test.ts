import { describe, expect, it } from 'vitest';

import { buildRivalCardLines, lastRivalResult } from '@/lib/match/rival-card';
import { clubStyleSentence } from '@/lib/training/style';

const blankStyle = {
  stylePressing: null,
  styleTempo: null,
  styleWidth: null,
} as const;

describe('buildRivalCardLines', () => {
  it('uses Pierwszy mecz and hides form and style when nothing was read', () => {
    expect(
      buildRivalCardLines({
        last: null,
        starterForms: null,
        ...blankStyle,
      }),
    ).toEqual(['Pierwszy mecz w tym sezonie']);
  });

  it('formats the last home or away score, rounds starter form, and reuses the style sentence', () => {
    expect(
      buildRivalCardLines({
        last: { homeScore: 1, awayScore: 0, isHome: true },
        starterForms: [70, 71, 80],
        stylePressing: 2,
        styleTempo: 0,
        styleWidth: 4,
      }),
    ).toEqual(['1:0 · U siebie', 'Forma 74', clubStyleSentence(2, 0, 4)]);

    expect(
      buildRivalCardLines({
        last: { homeScore: 0, awayScore: 2, isHome: false },
        starterForms: [70, 71],
        ...blankStyle,
      }),
    ).toEqual(['0:2 · Wyjazd', 'Forma 71']);
  });

  it('omits form when the opponent has no player rows and omits style when any habit is missing', () => {
    expect(
      buildRivalCardLines({
        last: { homeScore: 3, awayScore: 1, isHome: true },
        starterForms: null,
        stylePressing: 1,
        styleTempo: null,
        styleWidth: 3,
      }),
    ).toEqual(['3:1 · U siebie']);

    expect(
      buildRivalCardLines({
        last: null,
        starterForms: [],
        stylePressing: 0,
        styleTempo: 0,
        styleWidth: null,
      }),
    ).toEqual(['Pierwszy mecz w tym sezonie']);
  });
});

describe('lastRivalResult', () => {
  it('keeps the latest finished meeting with this opponent', () => {
    expect(
      lastRivalResult(
        [
          {
            opponentClubId: 'opp',
            status: 'played',
            homeScore: 1,
            awayScore: 0,
            isHome: true,
            matchday: 1,
            playedAt: '2026-08-01T12:00:00.000Z',
          },
          {
            opponentClubId: 'other',
            status: 'played',
            homeScore: 9,
            awayScore: 9,
            isHome: false,
            matchday: 8,
            playedAt: '2026-10-01T12:00:00.000Z',
          },
          {
            opponentClubId: 'opp',
            status: 'upcoming',
            homeScore: null,
            awayScore: null,
            isHome: false,
            matchday: 12,
            playedAt: null,
          },
          {
            opponentClubId: 'opp',
            status: 'played',
            homeScore: 0,
            awayScore: 2,
            isHome: false,
            matchday: 12,
            playedAt: '2026-11-01T12:00:00.000Z',
          },
        ],
        'opp',
      ),
    ).toEqual({ homeScore: 0, awayScore: 2, isHome: false });
  });
});
