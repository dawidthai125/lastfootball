/**
 * Thin economy constants — numbers SSOT = GDD §26 (GDD-§26A/B).
 * Runtime contracts remain D18 (finance) / D20 (fee = derive).
 */
export const ECONOMY_THIN = {
  STARTER_CASH: 100_000,
  REWARD_WIN: 5_000,
  REWARD_DRAW: 2_500,
  REWARD_LOSS: 1_000,
  /** Sole currency for finance + transfers UI (GDD §26). */
  CURRENCY: 'EUR',
  /** Shared transfer-fee coefficients — consumed only by deriveTransferFee (D20). */
  TRANSFER_FEE: {
    SKILL_MULT: 2_000,
    AGE_BONUS: 1_500,
    AGE_REF: 30,
    FLOOR: 25_000,
    ROUND: 1_000,
  },
} as const;

export type FinanceMovementCategory = 'starter' | 'match_reward' | 'transfer_buy' | 'transfer_sell';

export type MatchRewardOutcome = 'win' | 'draw' | 'loss';

export type FinanceMovementDto = {
  readonly id: string;
  readonly createdAt: string;
  readonly category: FinanceMovementCategory;
  readonly label: string;
  readonly amount: number;
  readonly fixtureId: string | null;
};

export type ClubFinanceDto = {
  readonly cashBalance: number;
  readonly cashLabel: string;
  readonly currency: string;
  readonly lastMovement: FinanceMovementDto | null;
  readonly recentMovements: readonly FinanceMovementDto[];
};

export type MatchRewardDto = {
  readonly amount: number;
  readonly label: string;
  readonly outcome: MatchRewardOutcome;
  /** One-line Post Match / Hub-facing string. */
  readonly line: string;
};
