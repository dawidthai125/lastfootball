import { describe, expect, it } from 'vitest';

import { reconcileExpiredIntl } from '@/lib/squad/reconcile-intl';
import { reconcileExpiredLoans } from '@/lib/squad/reconcile-loans';
import { validateStartingXi } from '@/lib/squad/validate-starting-xi';
import type { SquadPlayerDto } from '@/lib/squad/types';

function player(
  partial: Partial<SquadPlayerDto> & Pick<SquadPlayerDto, 'id' | 'position'>,
): SquadPlayerDto {
  return {
    name: partial.name ?? partial.id,
    shortName: partial.id,
    shirtNumber: 1,
    age: 24,
    form: 50,
    energy: 80,
    skill: 60,
    potentialBand: 'medium',
    potentialLabel: 'Średni',
    careerPhase: 'rising',
    careerPhaseLabel: 'Rozwój',
    status: 'READY',
    nationality: 'POL',
    attributes: [],
    contract: { wage: 1000, until: '30.06.2028', clause: 100_000, role: 'Zawodnik' },
    history: [],
    starter: true,
    captain: false,
    version: 1,
    ...partial,
  };
}

describe('play polish', () => {
  it('recalls outgoing and returns incoming loans past loan_until', () => {
    const patches = reconcileExpiredLoans(
      [
        {
          id: 'out',
          onLoan: true,
          loanedIn: false,
          loanUntil: '2026-11-01',
          wage: 500,
          wageBank: 1000,
        },
        {
          id: 'in',
          onLoan: false,
          loanedIn: true,
          loanUntil: '2026-11-01',
          wage: 400,
          wageBank: null,
        },
        {
          id: 'active',
          onLoan: true,
          loanedIn: false,
          loanUntil: '2026-12-01',
          wage: 500,
          wageBank: 1000,
        },
      ],
      '2026-11-17',
    );
    expect(patches).toEqual([
      { id: 'out', kind: 'recall', wage: 1000 },
      { id: 'in', kind: 'return_in' },
    ]);
  });

  it('clears national call-up after intl_absent_until', () => {
    expect(
      reconcileExpiredIntl(
        [
          { id: 'gone', intlAbsentUntil: '2026-11-10' },
          { id: 'active', intlAbsentUntil: '2026-11-20' },
          { id: 'none', intlAbsentUntil: null },
        ],
        '2026-11-17',
      ),
    ).toEqual([{ id: 'gone' }]);
  });

  it('blocks XI when a starter is on national call-up', () => {
    const xi = Array.from({ length: 11 }, (_, i) =>
      player({
        id: `p${i}`,
        position: i === 0 ? 'BR' : 'N',
        starter: true,
        intlAbsentUntil: i === 3 ? '2026-11-20' : null,
      }),
    );
    expect(validateStartingXi(xi, '2026-11-17').ok).toBe(false);
    expect(validateStartingXi(xi).ok).toBe(true);
  });
});
