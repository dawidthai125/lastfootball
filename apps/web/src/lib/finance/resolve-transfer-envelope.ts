import { formatMoney } from '@/lib/finance/format-money';
import { ECONOMY_THIN } from '@/lib/finance/types';

export type TransferEnvelopeDto = {
  readonly envelopeBalance: number;
  readonly envelopeLabel: string;
  readonly ratio: number;
};

/**
 * Sole place that computes transfer envelope from cash (LFE-TRANSFERS-02-E1).
 * envelope = cashBalance × ENVELOPE_RATIO (floored; clamped to cash).
 * Not persisted — allocation view over cash_balance SSOT (D18).
 */
export function resolveTransferEnvelope(cashBalance: number): TransferEnvelopeDto {
  const ratio = ECONOMY_THIN.ENVELOPE_RATIO;
  const raw = Math.floor(cashBalance * ratio);
  const envelopeBalance = Math.max(0, Math.min(cashBalance, raw));
  return {
    envelopeBalance,
    envelopeLabel: formatMoney(envelopeBalance, ECONOMY_THIN.CURRENCY),
    ratio,
  };
}
