import { ECONOMY_THIN } from '@/lib/finance/types';

/** Format cash for PL UI (EUR, 0 decimals). */
export function formatMoney(value: number, currency: string = ECONOMY_THIN.CURRENCY): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
