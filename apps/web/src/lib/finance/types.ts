/** Thin economy constants — temporary until GDD §26 balance pass (LFE-ECONOMY-01). */
export const ECONOMY_THIN = {
  STARTER_CASH: 100_000,
  REWARD_WIN: 5_000,
  REWARD_DRAW: 2_500,
  REWARD_LOSS: 1_000,
  CURRENCY: 'EUR',
} as const;

export type FinanceMovementCategory = 'starter' | 'match_reward';

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
