import { hasPlayedUnlock } from '@/lib/fixtures/played-unlock';
import { resolveNavLockLabel, resolveNavLockReason } from '@/lib/nav-lock-copy';
import { TRANSFERS_THIN } from '@/lib/transfers/types';
import { closedWindowSentence } from '@/lib/transfers/window';

const CLOSED_WINDOW_TITLE = 'Okno transferowe zamknięte';

export type FinanceTransferEntry = {
  readonly href: '/hub' | '/transfers';
  readonly label: string;
};

/** Market links only while the window is open. Locked copy matches nav. */
export function resolveFinanceTransferEntry(input: {
  readonly transferWindowOpen: boolean;
  readonly playedCount: number;
  readonly needsReaction: boolean;
  readonly variant: 'primary' | 'empty';
}): FinanceTransferEntry {
  if (!input.transferWindowOpen) {
    return {
      href: '/hub',
      label: resolveNavLockLabel('transfers', 'Transfery', input.playedCount),
    };
  }
  if (input.variant === 'empty') {
    return { href: '/transfers', label: 'Transfery' };
  }
  return {
    href: '/transfers',
    label: input.needsReaction ? 'Przejdź do transferów' : 'Zobacz rynek transferowy',
  };
}

/** Before the league unlock, closed market is the nav lock — not a shut window. */
export function resolveTransfersClosedSoftLock(playedCount: number): {
  readonly title: string;
  readonly reason: string;
} {
  if (!hasPlayedUnlock(playedCount, TRANSFERS_THIN.UNLOCK_AFTER_PLAYED)) {
    return {
      title: resolveNavLockLabel('transfers', 'Transfery', playedCount),
      reason: resolveNavLockReason('transfers', playedCount),
    };
  }
  return { title: CLOSED_WINDOW_TITLE, reason: closedWindowSentence(playedCount) };
}
