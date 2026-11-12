import { describe, expect, it } from 'vitest';

import { matchdayBlockReason, warsawDateKey } from '@/lib/fixtures/matchday-gate';

describe('matchday gate', () => {
  it('uses the Warsaw calendar, not UTC midnight', () => {
    const lateUtc = new Date('2026-11-12T23:30:00.000Z');
    expect(warsawDateKey(lateUtc)).toBe('2026-11-13');
  });

  it('blocks a second match on the same Warsaw day', () => {
    const now = new Date('2026-11-12T18:00:00.000Z');
    const earlier = '2026-11-12T12:00:00.000Z';
    expect(matchdayBlockReason(earlier, now)).toMatch(/jutra/);
  });

  it('allows the next Warsaw morning', () => {
    const now = new Date('2026-11-12T23:30:00.000Z');
    const earlier = '2026-11-12T20:00:00.000Z';
    expect(matchdayBlockReason(earlier, now)).toBeNull();
  });

  it('allows the first match', () => {
    expect(matchdayBlockReason(null, new Date('2026-11-12T12:00:00.000Z'))).toBeNull();
  });
});
