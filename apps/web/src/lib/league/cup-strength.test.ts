import { describe, expect, it } from 'vitest';

import { resolveOpponentXi } from '@/lib/fixtures/create-session';

const average = (competition: string, opponentClubId: string, leagueTier: string) => {
  const xi = resolveOpponentXi({ leagueTier } as never, { competition, opponentClubId } as never);
  return xi.reduce((sum, p) => sum + p.skill!, 0) / xi.length;
};

describe('strength of rivals (D162)', () => {
  it('a higher league is stronger than the same club in the cup', () => {
    expect(average('league', 'bot-x', 'i') - average('cup', 'bot-x', 'i')).toBeCloseTo(8);
    expect(average('league', 'bot-x', 'ii') - average('cup', 'bot-x', 'ii')).toBeCloseTo(6);
    expect(average('league', 'bot-x', 'iii') - average('cup', 'bot-x', 'iii')).toBeCloseTo(3);
  });

  it('a new club meets the same rivals as before', () => {
    expect(average('league', 'bot-x', 'iv')).toBe(average('cup', 'bot-x', 'iv'));
    expect(average('cup', 'cup-i-1', 'iv')).toBeLessThanOrEqual(82);
  });
});
