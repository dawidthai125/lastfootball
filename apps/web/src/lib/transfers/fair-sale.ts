import { homegrownSaleShare } from '@/lib/academy/levels';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { ECONOMY_THIN } from '@/lib/finance/types';

/** Player part the sale rules read (D133). */
export type SalePlayer = {
  readonly skill: number;
  readonly age: number;
  readonly origin?: string | null;
  readonly joinedAt?: string | null;
  readonly seniorMatches?: number;
  readonly saleUnknown?: boolean;
  readonly loanedIn?: boolean;
  readonly onLoan?: boolean;
};

/** Days a newcomer (academy, free agent, purchase) stays before he can be sold or listed. */
export const SALE_COOLDOWN_DAYS = 7;
/** Computer clubs pay this share for free agents. Home-grown: homegrownSaleShare (D134). */
export const FREE_ORIGIN_SHARE = 0.1;

const DAY_MS = 86_400_000;

/** Why he cannot leave yet, or null. Same rule for instant sale, list and offers. */
export function saleBlock(player: SalePlayer, now: Date = new Date()): string | null {
  if (player.loanedIn === true) return 'Wypożyczonego zawodnika nie możesz sprzedać.';
  if (player.origin === 'emergency') return 'Juniora awaryjnego nie możesz sprzedać.';
  if (player.saleUnknown === true) return 'Nie udało się ustalić ceny. Spróbuj ponownie.';
  if (player.onLoan === true) return 'Zawodnik jest na wypożyczeniu.';
  if (!player.joinedAt) return null;
  const joined = Date.parse(player.joinedAt);
  if (!Number.isFinite(joined)) return null;
  const left = Math.ceil((joined + SALE_COOLDOWN_DAYS * DAY_MS - now.getTime()) / DAY_MS);
  if (left <= 0) return null;
  return `Nowy w klubie. Sprzedasz go za ${left} ${left === 1 ? 'dzień' : 'dni'}.`;
}

/** The price on the page must be the price now. */
export function saleShownPriceError(shown: FormDataEntryValue | null, ask: number): string | null {
  return shown !== null && shown !== '' && Number(shown) === ask
    ? null
    : 'Cena się zmieniła, odśwież.';
}

/** Price computer clubs pay. Trades between managers keep deriveTransferFee. */
export function aiSaleAsk(player: SalePlayer): number {
  const full = deriveTransferFee(player.skill, player.age);
  if (player.origin !== 'academy' && player.origin !== 'free') return full;
  const share =
    player.origin === 'academy' ? homegrownSaleShare(player.seniorMatches) : FREE_ORIGIN_SHARE;
  const { ROUND } = ECONOMY_THIN.TRANSFER_FEE;
  return Math.round((full * share) / ROUND) * ROUND;
}
