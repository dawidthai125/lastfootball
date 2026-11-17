import { describe, expect, it } from 'vitest';

import { validateStartingXi } from '@/lib/squad/validate-starting-xi';
import type { SquadPlayerDto } from '@/lib/squad/types';

function player(id: string, position: string, onLoan = false): SquadPlayerDto {
  return {
    id,
    name: id,
    shortName: id,
    shirtNumber: 1,
    position,
    age: 24,
    form: 70,
    energy: 80,
    skill: 60,
    potentialBand: 'medium',
    potentialLabel: 'Sufit ukryty',
    careerPhase: 'prime',
    careerPhaseLabel: 'Szczyt',
    status: 'READY',
    nationality: 'POL',
    attributes: [],
    contract: { wage: 1000, until: '30.06.2028', clause: 100000, role: 'Skład' },
    history: [],
    starter: true,
    captain: false,
    version: 1,
    onLoan,
  };
}

describe('loaned players stay out of the XI', () => {
  it('rejects one loaned starter', () => {
    const starters = [
      player('gk', 'BR'),
      ...Array.from({ length: 10 }, (_, i) => player(`p${i}`, 'ŚP')),
    ];
    starters[3] = player('out', 'ŚP', true);
    const result = validateStartingXi(starters);
    expect(result.ok).toBe(false);
    expect(result.errors.some((line) => line.includes('Wypożyczony'))).toBe(true);
  });
});
