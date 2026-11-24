import { describe, expect, it } from 'vitest';

import {
  CONTRACT_MIN_SENIORS,
  contractFarewell,
  contractPreview,
  contractReminder,
  keptWage,
  planContractExpiry,
  type ContractPlayer,
} from '@/lib/season/contract-expiry';
import { contractTalkOpen, renewedContractSeason } from '@/lib/squad/contract-talk';

function squad(count: number, patch: (i: number) => Partial<ContractPlayer> = () => ({})) {
  return Array.from({ length: count }, (_, i): ContractPlayer => ({
    id: `p${String(i).padStart(2, '0')}`,
    name: `P${i}`,
    pos: i < 2 ? 'BR' : 'ŚP',
    skill: 50 + i,
    wage: 1000,
    personality: 'lider',
    academyTrack: false,
    departedAt: null,
    contractSeason: 5,
    ...patch(i),
  }));
}
const ids = (players: readonly ContractPlayer[]) => players.map((p) => p.id);

describe('contract expiry (D139)', () => {
  it('lets only ended contracts go', () => {
    const plan = planContractExpiry(
      squad(18, (i) => ({ contractSeason: i === 4 ? 2 : i === 5 ? 1 : i === 6 ? null : 3 })),
      2,
    );
    expect(ids(plan.leave)).toEqual(['p04', 'p05']);
    expect(plan.keep).toEqual([]);
  });

  it('never goes under fourteen seniors or without a goalkeeper, weakest leave first', () => {
    const plan = planContractExpiry(
      squad(18, () => ({ contractSeason: 1 })),
      1,
    );
    expect(plan.leave).toHaveLength(18 - CONTRACT_MIN_SENIORS);
    expect(ids(plan.leave)).toEqual(['p00', 'p02', 'p03', 'p04']);
    expect(ids(plan.keep)).toContain('p01');
  });

  it('ignores juniors, loans and those who left', () => {
    const plan = planContractExpiry(
      squad(18, (i) => ({
        contractSeason: 1,
        academyTrack: i === 3,
        loanedIn: i === 4,
        departedAt: i === 5 ? '2026-12-01' : null,
      })),
      1,
    );
    // 15 of our seniors: one may go.
    expect(ids(plan.leave)).toEqual(['p00']);
    expect(ids(plan.keep)).not.toContain('p04');
  });

  it('tells in the last season, before the start and after it', () => {
    const players = squad(18, (i) => ({ contractSeason: i === 7 || i === 8 ? 2 : 4 }));
    expect(contractReminder(players, 1)).toBeNull();
    expect(contractReminder(players, 2)).toBe('Ostatni sezon kontraktu: P7, P8');
    expect(contractPreview(players, 2)).toBe('Bez przedłużenia odejdą za darmo: P7, P8.');
    expect(contractPreview(players, 1)).toBeNull();
    expect(contractFarewell([])).toBeNull();
    expect(contractFarewell(['A', 'B', 'C'])).toBe('Koniec kontraktu, odeszli: A, B i jeszcze 1');
    expect(keptWage(players[0]!)).toEqual({ wage: 1100 });
  });

  it('raises the full wage of a player on loan, not the half that is paid', () => {
    expect(keptWage({ wage: 500, personality: 'lider', onLoan: true, wageBank: 1000 })).toEqual({
      wage: 550,
      bank: 1100,
    });
  });

  it('opens the talk in the last two seasons and renews for two more', () => {
    expect(contractTalkOpen(4, 2)).toBe(false);
    expect(contractTalkOpen(3, 2)).toBe(true);
    expect(contractTalkOpen(2, 2)).toBe(true);
    expect(contractTalkOpen(renewedContractSeason(2), 2)).toBe(false);
  });
});
