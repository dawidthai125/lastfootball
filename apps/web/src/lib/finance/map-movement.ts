import type { FinanceMovementDto, FinanceMovementCategory } from '@/lib/finance/types';

export type FinanceMovementRow = {
  id: string;
  club_id: string;
  category: string;
  label: string;
  amount: number;
  fixture_id: string | null;
  created_at: string;
};

export function mapFinanceMovementRow(row: FinanceMovementRow): FinanceMovementDto {
  return {
    id: row.id,
    createdAt: row.created_at,
    category: row.category as FinanceMovementCategory,
    label: row.label,
    amount: row.amount,
    fixtureId: row.fixture_id,
  };
}
