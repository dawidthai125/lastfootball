import { formatMoney } from '@/lib/finance/format-money';
import { resolveTransferEnvelope } from '@/lib/finance/resolve-transfer-envelope';
import { ECONOMY_THIN, type ClubFinanceDto, type FinanceMovementDto } from '@/lib/finance/types';

const RECENT_LIMIT = 10;

/**
 * Sole finance view SSOT for product UI (LFE-ECONOMY-01 / E1 envelope).
 * UI must not read cash/movements from DB shapes directly.
 */
export function resolveClubFinance(
  club: { readonly id: string; readonly cashBalance: number },
  movements: readonly FinanceMovementDto[],
): ClubFinanceDto {
  const sorted = [...movements].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const recent = sorted.slice(0, RECENT_LIMIT);
  const envelope = resolveTransferEnvelope(club.cashBalance);
  return {
    cashBalance: club.cashBalance,
    cashLabel: formatMoney(club.cashBalance),
    currency: ECONOMY_THIN.CURRENCY,
    envelopeBalance: envelope.envelopeBalance,
    envelopeLabel: envelope.envelopeLabel,
    lastMovement: recent[0] ?? null,
    recentMovements: recent,
  };
}

/** One-line Hub chip label (cash only — no trend). */
export function resolveCashChipLabel(finance: ClubFinanceDto): string {
  return finance.cashLabel;
}
