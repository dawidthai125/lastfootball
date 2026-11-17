import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { mediateConflictMorale, resolveDressingConflict } from '@/lib/squad/dressing-room';
import {
  incomingLoanBlock,
  resolveIncomingLoanOffers,
} from '@/lib/squad/incoming-loan';
import { intlBlocksLineup, resolveIntlCallup } from '@/lib/squad/intl-callup';
import {
  kickoffPressingWithLine,
  pressShapeLabel,
  pressShapeShift,
} from '@/lib/training/press-line';
import {
  listAllowedAgreedAmounts,
  negotiationBundleLabel,
  NEGOTIATION_THIN,
  resolveFinalAmount,
  resolveNegotiationStep,
} from '@/lib/transfers/resolve-negotiation';
import { seedTransferCatalogue } from '@/lib/transfers/seed-catalogue';

const root = join(process.cwd(), 'src');

describe('world depth', () => {
  it('aliases inbox by redirect file', () => {
    const src = readFileSync(join(root, 'app/(game)/inbox/page.tsx'), 'utf8');
    expect(src).toContain("redirect('/messages')");
  });

  it('grows the market catalogue to thirteen seeds', () => {
    const rows = seedTransferCatalogue('1be439c0-9530-400a-a437-ceaccf61d482');
    expect(rows).toHaveLength(13);
    expect(rows.filter((r) => r.clubLabel === 'Wolny agent').length).toBeGreaterThanOrEqual(3);
  });

  it('derives incoming loans only with an open window', () => {
    const open = resolveIncomingLoanOffers({
      clubId: '1be439c0-9530-400a-a437-ceaccf61d482',
      transferWindowOpen: true,
      rosterCount: 18,
      today: '2026-11-17',
    });
    const closed = resolveIncomingLoanOffers({
      clubId: '1be439c0-9530-400a-a437-ceaccf61d482',
      transferWindowOpen: false,
      rosterCount: 18,
      today: '2026-11-17',
    });
    expect(closed).toEqual([]);
    expect(open.length).toBeLessThanOrEqual(2);
    expect(incomingLoanBlock({ rosterCount: 22, alreadyLoanedIn: 0 })).toBe(
      'Kadra jest pełna (max 22).',
    );
  });

  it('finds a dressing conflict for two explosive starters', () => {
    const conflict = resolveDressingConflict([
      {
        id: 'a',
        name: 'A',
        starter: true,
        morale: 40,
        personality: 'wybuchowy',
      },
      {
        id: 'b',
        name: 'B',
        starter: true,
        morale: 30,
        personality: 'wybuchowy',
      },
    ]);
    expect(conflict?.subject).toContain('A');
    expect(mediateConflictMorale(40)).toBe(43);
  });

  it('offers one intl call-up on the hashed day', () => {
    const callup = resolveIntlCallup({
      clubId: 'club-abc',
      today: '2026-11-17',
      players: [
        {
          id: 'p1',
          name: 'Star',
          skill: 70,
          nationality: 'POL',
          starter: true,
          onLoan: false,
          loanedIn: false,
        },
      ],
      alreadyAbsentIds: [],
    });
    if (callup) {
      expect(callup.playerId).toBe('p1');
      expect(intlBlocksLineup(callup.until, '2026-11-17')).toBe(true);
    }
  });

  it('shifts kickoff pressing by shape', () => {
    expect(pressShapeShift('left_high')).toBe(2);
    expect(pressShapeLabel('split')).toBe('Rozciągnięty');
    expect(kickoffPressingWithLine(0, 'mid', 'left_high')).toBe(
      kickoffPressingWithLine(0, 'mid', 'flat') + 2,
    );
  });

  it('adds a final negotiation step at 97 percent', () => {
    expect(NEGOTIATION_THIN.FINAL_PCT).toBe(97);
    expect(resolveFinalAmount(1000)).toBe(970);
    expect(listAllowedAgreedAmounts(1000)).toContain(970);
    expect(
      resolveNegotiationStep({ ask: 1000, phase: 'counter', playerAction: 'final' }),
    ).toEqual({ kind: 'final', finalAmount: 970 });
    expect(negotiationBundleLabel('fee_wage')).toContain('pensja');
  });
});
