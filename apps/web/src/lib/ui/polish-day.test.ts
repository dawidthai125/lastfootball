import { describe, expect, it } from 'vitest';

import { polishDay } from '@/lib/ui/polish-day';

describe('polishDay', () => {
  it('follows the Warsaw day', () => {
    expect(polishDay('2026-11-24T23:30:00Z')).toBe('25.11.2026');
    expect(polishDay('2026-07-01T22:30:00Z')).toBe('02.07.2026');
    expect(polishDay('x')).toBe('');
  });
});
