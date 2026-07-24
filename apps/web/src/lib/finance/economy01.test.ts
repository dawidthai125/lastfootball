import { describe, expect, it } from 'vitest';

import { ECONOMY_THIN } from '@/lib/finance/types';
import { formatMoney } from '@/lib/finance/format-money';
import { resolveClubFinance, resolveCashChipLabel } from '@/lib/finance/resolve-club-finance';
import { resolveLeagueMatchReward } from '@/lib/finance/resolve-match-reward';
import type { FinanceMovementDto } from '@/lib/finance/types';

describe('ECONOMY_THIN constants', () => {
  it('matches Owner Thin amounts', () => {
    expect(ECONOMY_THIN.STARTER_CASH).toBe(100_000);
    expect(ECONOMY_THIN.REWARD_WIN).toBe(5_000);
    expect(ECONOMY_THIN.REWARD_DRAW).toBe(2_500);
    expect(ECONOMY_THIN.REWARD_LOSS).toBe(1_000);
    expect(ECONOMY_THIN.CURRENCY).toBe('EUR');
  });
});

describe('resolveLeagueMatchReward', () => {
  it('credits win/draw/loss from player perspective', () => {
    expect(resolveLeagueMatchReward({ homeScore: 2, awayScore: 0, isHome: true }).amount).toBe(
      ECONOMY_THIN.REWARD_WIN,
    );
    expect(resolveLeagueMatchReward({ homeScore: 1, awayScore: 1, isHome: false }).amount).toBe(
      ECONOMY_THIN.REWARD_DRAW,
    );
    expect(resolveLeagueMatchReward({ homeScore: 0, awayScore: 3, isHome: true }).amount).toBe(
      ECONOMY_THIN.REWARD_LOSS,
    );
    expect(resolveLeagueMatchReward({ homeScore: 0, awayScore: 1, isHome: false }).amount).toBe(
      ECONOMY_THIN.REWARD_WIN,
    );
  });

  it('exposes one-line reward string', () => {
    const r = resolveLeagueMatchReward({ homeScore: 1, awayScore: 0, isHome: true });
    expect(r.line).toContain(r.label);
    expect(r.line.startsWith('+')).toBe(true);
  });
});

describe('resolveClubFinance', () => {
  it('builds DTO with currency and recent movements', () => {
    const movements: FinanceMovementDto[] = [
      {
        id: 'm2',
        createdAt: '2026-07-25T12:00:00.000Z',
        category: 'match_reward',
        label: 'Nagroda za zwycięstwo',
        amount: 5000,
        fixtureId: 'fx-1',
      },
      {
        id: 'm1',
        createdAt: '2026-07-24T12:00:00.000Z',
        category: 'starter',
        label: 'Kapitał startowy',
        amount: 100000,
        fixtureId: null,
      },
    ];
    const dto = resolveClubFinance({ id: 'c1', cashBalance: 105_000 }, movements);
    expect(dto.currency).toBe('EUR');
    expect(dto.cashBalance).toBe(105_000);
    expect(dto.cashLabel).toBe(formatMoney(105_000));
    expect(dto.lastMovement?.id).toBe('m2');
    expect(dto.recentMovements).toHaveLength(2);
    expect(resolveCashChipLabel(dto)).toBe(dto.cashLabel);
  });
});
