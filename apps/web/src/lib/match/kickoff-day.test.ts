import { describe, expect, it } from 'vitest';

import { kickoffDay } from '@/lib/match/kickoff-day';

describe('kickoffDay', () => {
  it('keeps yesterday only just after midnight', () => {
    expect(kickoffDay('2026-11-23', new Date('2026-11-24T00:04:00Z'))).toBe('2026-11-23');
    expect(kickoffDay('2026-11-23', new Date('2026-11-24T01:00:00Z'))).toBe('2026-11-24');
  });

  it('ignores any other claim', () => {
    const now = new Date('2026-11-24T00:04:00Z');
    expect(kickoffDay('2026-11-20', now)).toBe('2026-11-24');
    expect(kickoffDay('2026-12-24', now)).toBe('2026-11-24');
    expect(kickoffDay(null, now)).toBe('2026-11-24');
  });
});
