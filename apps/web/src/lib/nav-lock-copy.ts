import { hasPlayedUnlock } from '@/lib/fixtures/played-unlock';
import { TRAINING_THIN } from '@/lib/training/types';
import { TRANSFERS_THIN } from '@/lib/transfers/types';
import { UI_COPY } from '@/lib/ui/copy';

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
    return `Trening · po ${TRAINING_THIN.UNLOCK_AFTER_PLAYED} meczach ligowych`;
  }
  if (itemId === 'transfers') {
    if (!hasPlayedUnlock(playedCount, TRANSFERS_THIN.UNLOCK_AFTER_PLAYED)) {
      return `Transfery · po ${TRANSFERS_THIN.UNLOCK_AFTER_PLAYED} meczach ligowych`;
    }
    return 'Transfery · okno zamknięte';
  }
  return `${itemLabel} — ${UI_COPY.softLockUnavailable}`;
}
