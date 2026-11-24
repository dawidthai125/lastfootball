import { TRANSFERS_THIN } from '@/lib/transfers/types';

/** League matches of one season. */
const SEASON_MATCHES = 22;

/**
 * Transfer windows of a club season (GDD §12.2, D152), counted in its league matches:
 * the break and the start of the season, then a winter window.
 */
export const TRANSFER_WINDOWS = Object.freeze({
  AUTUMN_CLOSES: 8,
  WINTER_OPENS: 11,
  WINTER_CLOSES: 16,
});

/** `played` = league matches of this season. The first season opens after the unlock. */
export function isTransferWindowOpen(input: {
  readonly season: number;
  readonly offseason: boolean;
  readonly played: number;
}): boolean {
  if (input.offseason || input.played >= SEASON_MATCHES) return true;
  if (input.season <= 1 && input.played < TRANSFERS_THIN.UNLOCK_AFTER_PLAYED) return false;
  if (input.played < TRANSFER_WINDOWS.AUTUMN_CLOSES) return true;
  return (
    input.played >= TRANSFER_WINDOWS.WINTER_OPENS && input.played < TRANSFER_WINDOWS.WINTER_CLOSES
  );
}

/** `unlockPlayed` also counts closed seasons (`unlockPlayedCount`). */
function playedThisSeason(unlockPlayed: number): number {
  return Math.max(0, Math.trunc(unlockPlayed)) % SEASON_MATCHES;
}

export function closedWindowSentence(unlockPlayed: number): string {
  const played = playedThisSeason(unlockPlayed);
  return played < TRANSFER_WINDOWS.WINTER_OPENS
    ? `Okno transferowe jest zamknięte. Otworzy się po ${TRANSFER_WINDOWS.WINTER_OPENS}. meczu ligowym sezonu (masz ${played}).`
    : `Okno transferowe jest zamknięte. Otworzy się po ostatnim meczu ligowym sezonu (masz ${played} z ${SEASON_MATCHES}).`;
}

/** When the open window closes. Null in the break: it stays open into the next season. */
export function windowClosesSentence(unlockPlayed: number, offseason: boolean): string | null {
  if (offseason) return null;
  const played = playedThisSeason(unlockPlayed);
  const closes =
    played < TRANSFER_WINDOWS.AUTUMN_CLOSES
      ? TRANSFER_WINDOWS.AUTUMN_CLOSES
      : TRANSFER_WINDOWS.WINTER_CLOSES;
  return `Zamknie się po ${closes}. meczu ligowym sezonu (masz ${played}).`;
}
