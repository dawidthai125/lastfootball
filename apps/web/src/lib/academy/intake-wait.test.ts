import { describe, expect, it } from 'vitest';

import { intakeWaitDays, isAcademyId } from '@/lib/academy/intake';

const NOW = new Date('2026-11-24T12:00:00Z');

describe('academy intake rhythm', () => {
  it('opens once a week, counting juniors who already left', () => {
    expect(intakeWaitDays([], NOW)).toBe(0);
    expect(intakeWaitDays(['2026-11-24T11:00:00Z'], NOW)).toBe(7);
    expect(intakeWaitDays(['2026-11-01T00:00:00Z', '2026-11-20T12:00:00Z'], NOW)).toBe(3);
    expect(intakeWaitDays(['2026-11-17T12:00:00Z'], NOW)).toBe(0);
  });

  it('knows its own juniors', () => {
    expect(isAcademyId('a-12345678-abc', '12345678-9999-4000-8000-000000000000')).toBe(true);
    expect(isAcademyId('t-12345678-0', '12345678-9999-4000-8000-000000000000')).toBe(false);
  });
});
