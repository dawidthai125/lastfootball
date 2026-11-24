import { describe, expect, it } from 'vitest';

import { lastFreshMatch } from '@/lib/fixtures/unfinished-match';

const now = new Date('2026-11-24T20:00:00Z');

describe('lastFreshMatch', () => {
  it('takes the newest played match of any competition', () => {
    expect(
      lastFreshMatch(
        [
          { id: 'a', status: 'played', playedAt: '2026-11-23T20:00:00Z' },
          { id: 'b', status: 'played', playedAt: '2026-11-24T10:00:00Z' },
          { id: 'c', status: 'upcoming', playedAt: null },
        ],
        now,
      ),
    ).toBe('b');
  });

  it('leaves old matches alone', () => {
    expect(
      lastFreshMatch([{ id: 'a', status: 'played', playedAt: '2026-11-20T20:00:00Z' }], now),
    ).toBeNull();
    expect(lastFreshMatch([], now)).toBeNull();
  });
});
