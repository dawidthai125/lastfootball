import { describe, expect, it } from 'vitest';

import { withShape } from '@/lib/match/our-formation';
import { roleLabel } from '@/lib/match/role-label';

describe('match labels', () => {
  it('shows Polish positions', () => {
    expect(['GK', 'CB', 'LB', 'CM', 'ST'].map(roleLabel)).toEqual(['BR', 'ŚO', 'LO', 'ŚP', 'N']);
  });

  it('keeps the chosen shape in the address', () => {
    expect(withShape('/match/1/xi', '4-3-3')).toBe('/match/1/xi?shape=4-3-3');
    expect(withShape('/match/1/xi', '4-4-2')).toBe('/match/1/xi');
  });
});
