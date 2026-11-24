const FORMAT = new Intl.DateTimeFormat('pl-PL', {
  timeZone: 'Europe/Warsaw',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/** Calendar day of the game (Warsaw), for example 24.11.2026. Empty for an unreadable date. */
export function polishDay(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : FORMAT.format(date);
}
