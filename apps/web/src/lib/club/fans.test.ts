import { describe, expect, it } from 'vitest';

import { fanMoodLabel, nextFanMood } from '@/lib/club/fans';

describe('fans', () => {
  it('moves mood by the result and stays inside 0..100', () => {
    expect(nextFanMood(98, 'win')).toBe(100);
    expect(nextFanMood(3, 'loss')).toBe(0);
    expect(nextFanMood(Number.NaN, 'draw')).toBe(61);
  });

  it('names the crowd from the mood band', () => {
    expect(fanMoodLabel(75)).toBe('Gorący');
    expect(fanMoodLabel(49)).toBe('Zniecierpliwieni');
    expect(fanMoodLabel(10)).toBe('Wściekli');
  });
});
