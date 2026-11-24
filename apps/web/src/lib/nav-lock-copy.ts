import { hasPlayedUnlock } from '@/lib/fixtures/played-unlock';
import { TRAINING_THIN } from '@/lib/training/types';
import { TRANSFERS_THIN } from '@/lib/transfers/types';
import { closedWindowSentence } from '@/lib/transfers/window';
import { UI_COPY } from '@/lib/ui/copy';

/** Compact progress while league unlock is pending, e.g. `Trening · 1/2`. */
function unlockProgressLabel(name: string, playedCount: number, required: number): string {
  const safe = Math.max(0, Math.min(playedCount, required));
  return `${name} · ${safe}/${required}`;
}

/**
 * Lock label for shell nav. Call only when the item is soft-locked.
 * Trening / Transfery match hub secondary copy. Other items stay "niedostępne".
 */
export function resolveNavLockLabel(
  itemId: string,
  itemLabel: string,
  playedCount: number,
): string {
  if (itemId === 'training') {
    return unlockProgressLabel('Trening', playedCount, TRAINING_THIN.UNLOCK_AFTER_PLAYED);
  }
  if (itemId === 'transfers') {
    if (!hasPlayedUnlock(playedCount, TRANSFERS_THIN.UNLOCK_AFTER_PLAYED)) {
      return unlockProgressLabel('Transfery', playedCount, TRANSFERS_THIN.UNLOCK_AFTER_PLAYED);
    }
    return 'Transfery · okno zamknięte';
  }
  return `${itemLabel} — ${UI_COPY.softLockUnavailable}`;
}

/** Body copy for soft-lock modal / route gate. Same facts as the nav label. */
export function resolveNavLockReason(itemId: string, playedCount: number): string {
  if (itemId === 'training') {
    return `Trening odblokuje się po ${TRAINING_THIN.UNLOCK_AFTER_PLAYED} rozegranych meczach ligowych (masz ${playedCount}).`;
  }
  if (itemId === 'transfers') {
    if (!hasPlayedUnlock(playedCount, TRANSFERS_THIN.UNLOCK_AFTER_PLAYED)) {
      return `Transfery odblokują się po ${TRANSFERS_THIN.UNLOCK_AFTER_PLAYED} rozegranych meczach ligowych (masz ${playedCount}).`;
    }
    return closedWindowSentence(playedCount);
  }
  return UI_COPY.softLockReason;
}
