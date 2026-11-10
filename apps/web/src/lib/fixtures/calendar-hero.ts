type CalendarRow = {
  readonly day: number;
  readonly status: string;
  readonly competition: string;
};

/**
 * Calendar hero follows league priority.
 * Cup filter shows the next unplayed cup row. Other filters show the next league kickoff.
 */
export function pickCalendarHero<T extends CalendarRow>(
  fixtures: readonly T[],
  filter: 'ALL' | 'league' | 'cup' | 'friendly',
): T | null {
  const pool =
    filter === 'cup'
      ? fixtures.filter((f) => f.competition === 'cup' && f.status !== 'played')
      : fixtures.filter((f) => f.competition === 'league' && f.status === 'upcoming');
  return [...pool].sort((a, b) => a.day - b.day)[0] ?? null;
}
