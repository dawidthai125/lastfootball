import { describe, expect, it } from 'vitest';

import { kickoffBlockReason, latestPlayedAt } from '@/lib/fixtures/kickoff-gate';

const now = new Date('2026-11-12T18:00:00.000Z');
const earlierToday = '2026-11-12T12:00:00.000Z';
const yesterday = '2026-11-11T12:00:00.000Z';
const email = 'Potwierdź email, żeby rozgrywać kolejne mecze.';
const day = 'Kolejka na dziś już rozegrana. Następny mecz od jutra.';

describe('kickoffBlockReason', () => {
  it('blocks every competition after the email deadline', () => {
    expect(
      kickoffBlockReason({
        matchesBlocked: true,
        competition: 'league',
        lastPlayedAt: null,
        now,
      }),
    ).toBe(email);
    expect(
      kickoffBlockReason({
        matchesBlocked: true,
        competition: 'human',
        lastPlayedAt: null,
        now,
      }),
    ).toBe(email);
  });

  it('prefers the email sentence over the same-day sentence', () => {
    expect(
      kickoffBlockReason({
        matchesBlocked: true,
        competition: 'cup',
        lastPlayedAt: earlierToday,
        now,
      }),
    ).toBe(email);
  });

  it('returns the day sentence for league and cup on the same Warsaw day', () => {
    for (const competition of ['league', 'cup'] as const) {
      expect(
        kickoffBlockReason({
          matchesBlocked: false,
          competition,
          lastPlayedAt: earlierToday,
          now,
        }),
      ).toBe(day);
    }
  });

  it('skips the day rule for a human match', () => {
    expect(
      kickoffBlockReason({
        matchesBlocked: false,
        competition: 'human',
        lastPlayedAt: earlierToday,
        now,
      }),
    ).toBeNull();
  });

  it('allows the next Warsaw day and a first kickoff', () => {
    expect(
      kickoffBlockReason({
        matchesBlocked: false,
        competition: 'league',
        lastPlayedAt: yesterday,
        now,
      }),
    ).toBeNull();
    expect(
      kickoffBlockReason({
        matchesBlocked: false,
        competition: 'league',
        lastPlayedAt: null,
        now,
      }),
    ).toBeNull();
  });
});

describe('latestPlayedAt', () => {
  it('uses the newest played kickoff, including a later cup', () => {
    expect(
      latestPlayedAt([
        { status: 'played', playedAt: yesterday },
        { status: 'upcoming', playedAt: null },
        { status: 'played', playedAt: earlierToday },
      ]),
    ).toBe(earlierToday);
  });

  it('leaves the league day open after a human league match', () => {
    expect(
      latestPlayedAt([
        { status: 'played', competition: 'league', playedAt: yesterday },
        { status: 'played', competition: 'human', playedAt: earlierToday },
      ]),
    ).toBe(yesterday);
  });

  it('keeps challenges on their own day', () => {
    const fixtures = [
      { status: 'played', competition: 'league' as const, playedAt: yesterday },
      { status: 'played', competition: 'challenge' as const, playedAt: earlierToday },
    ];
    expect(latestPlayedAt(fixtures)).toBe(yesterday);
    expect(latestPlayedAt(fixtures, 'challenge')).toBe(earlierToday);
    const gate = (competition: 'league' | 'challenge', challengeAt: string | null) =>
      kickoffBlockReason({
        matchesBlocked: false,
        competition,
        lastPlayedAt: competition === 'league' ? yesterday : earlierToday,
        lastChallengeAt: challengeAt,
        now,
      });
    expect(gate('league', earlierToday)).toBeNull();
    expect(gate('challenge', earlierToday)).toContain('Wyzwanie na dziś');
    expect(gate('challenge', yesterday)).toBeNull();
    expect(gate('challenge', null)).toBeNull();
  });

  it('returns null when nothing has been played', () => {
    expect(latestPlayedAt([{ status: 'upcoming', playedAt: null }])).toBeNull();
    expect(latestPlayedAt([])).toBeNull();
  });
});
