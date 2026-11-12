/** One league/cup kickoff per Warsaw calendar day. Pure. */

export function warsawDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Null when the club may play. A sentence when today's match is already done. */
export function matchdayBlockReason(
  lastPlayedAt: string | null | undefined,
  now: Date,
): string | null {
  if (!lastPlayedAt) return null;
  const last = new Date(lastPlayedAt);
  if (Number.isNaN(last.getTime())) return null;
  if (warsawDateKey(last) !== warsawDateKey(now)) return null;
  return 'Kolejka na dziś już rozegrana. Następny mecz od jutra.';
}
