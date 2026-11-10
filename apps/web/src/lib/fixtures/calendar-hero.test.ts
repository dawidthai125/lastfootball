import { describe, expect, it } from 'vitest';

import { pickCalendarHero } from '@/lib/fixtures/calendar-hero';

const rows = [
  { id: 'league-next', day: 9, status: 'upcoming', competition: 'league' },
  { id: 'cup-sched', day: 101, status: 'scheduled', competition: 'cup' },
  { id: 'league-later', day: 10, status: 'scheduled', competition: 'league' },
];

describe('pickCalendarHero', () => {
  it('keeps the next league kickoff ahead of a scheduled cup tie', () => {
    expect(pickCalendarHero(rows, 'ALL')?.id).toBe('league-next');
    expect(pickCalendarHero(rows, 'league')?.id).toBe('league-next');
  });

  it('shows the cup tie only on the cup filter', () => {
    expect(pickCalendarHero(rows, 'cup')?.id).toBe('cup-sched');
  });
});
