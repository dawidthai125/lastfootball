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

  it('returns the day sentence for league, cup, and challenge on the same Warsaw day', () => {
    for (const competition of ['league', 'cup', 'challenge'] as const) {
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

  it('returns null when nothing has been played', () => {
    expect(latestPlayedAt([{ status: 'upcoming', playedAt: null }])).toBeNull();
    expect(latestPlayedAt([])).toBeNull();
  });
});
