import { describe, expect, it } from 'vitest';

import { ECONOMY_THIN } from '@/lib/finance/types';
import { formatMoney } from '@/lib/finance/format-money';
import { resolveClubFinance, resolveCashChipLabel } from '@/lib/finance/resolve-club-finance';
import { resolveTransferEnvelope } from '@/lib/finance/resolve-transfer-envelope';
import { resolveLeagueMatchReward } from '@/lib/finance/resolve-match-reward';
import type { FinanceMovementDto } from '@/lib/finance/types';

describe('ECONOMY_THIN constants', () => {
  it('matches GDD §26 amounts', () => {
    expect(ECONOMY_THIN.STARTER_CASH).toBe(100_000);
    expect(ECONOMY_THIN.REWARD_WIN).toBe(5_000);
    expect(ECONOMY_THIN.REWARD_DRAW).toBe(2_500);
    expect(ECONOMY_THIN.REWARD_LOSS).toBe(1_000);
    expect(ECONOMY_THIN.CURRENCY).toBe('EUR');
    expect(ECONOMY_THIN.ENVELOPE_RATIO).toBe(1);
    expect(ECONOMY_THIN.SPONSOR_BASE).toBe(15_000);
    expect(ECONOMY_THIN.SPONSOR_BONUS).toBe(10_000);
  });

  it('exposes shared TRANSFER_FEE coefficients (GDD §26)', () => {
    expect(ECONOMY_THIN.TRANSFER_FEE.SKILL_MULT).toBe(2_000);
    expect(ECONOMY_THIN.TRANSFER_FEE.AGE_BONUS).toBe(1_500);
    expect(ECONOMY_THIN.TRANSFER_FEE.AGE_REF).toBe(30);
    expect(ECONOMY_THIN.TRANSFER_FEE.FLOOR).toBe(25_000);
    expect(ECONOMY_THIN.TRANSFER_FEE.ROUND).toBe(1_000);
  });
});

describe('resolveTransferEnvelope', () => {
  it('is the sole Thin derive: envelope === cash when ratio is 1', () => {
    const e = resolveTransferEnvelope(105_000);
    expect(e.ratio).toBe(1);
    expect(e.envelopeBalance).toBe(105_000);
    expect(e.envelopeLabel).toBe(formatMoney(105_000));
  });

  it('clamps non-positive cash to zero envelope', () => {
    expect(resolveTransferEnvelope(0).envelopeBalance).toBe(0);
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
    expect(dto.envelopeBalance).toBe(resolveTransferEnvelope(105_000).envelopeBalance);
    expect(dto.envelopeLabel).toBe(resolveTransferEnvelope(105_000).envelopeLabel);
    expect(dto.lastMovement?.id).toBe('m2');
    expect(dto.recentMovements).toHaveLength(2);
    expect(resolveCashChipLabel(dto)).toBe(dto.cashLabel);
  });
});
