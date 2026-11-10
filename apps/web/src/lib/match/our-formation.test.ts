import { describe, expect, it } from 'vitest';

import { parseOurFormation } from '@/lib/match/our-formation';

describe('parseOurFormation', () => {
  it('accepts only the two live shapes', () => {
    expect(parseOurFormation('4-3-3')).toBe('4-3-3');
    expect(parseOurFormation(['4-3-3'])).toBe('4-3-3');
    expect(parseOurFormation('4-4-2')).toBe('4-4-2');
    expect(parseOurFormation('5-3-2')).toBe('4-4-2');
    expect(parseOurFormation(undefined)).toBe('4-4-2');
  });
});
