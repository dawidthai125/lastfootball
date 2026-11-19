import { describe, expect, it } from 'vitest';

import {
  describeFanMoodAfterResult,
  describeFanMoodChange,
  fanMoodLabel,
  fanResultFromScores,
  nextFanMood,
  resolvePlayedFixtureFanLine,
} from '@/lib/club/fans';

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

  it('describes the post-match mood delta', () => {
    expect(describeFanMoodChange(60, 'win')).toBe('Kibice: Spokojni 66 (+6)');
    expect(describeFanMoodChange(60, 'loss')).toBe('Kibice: Spokojni 54 (-6)');
  });

  it('describes stored mood after a settled result', () => {
    expect(describeFanMoodAfterResult(54, 'loss')).toBe('Kibice: Spokojni 54 (-6)');
  });

  it('maps scores to our result', () => {
    expect(fanResultFromScores(2, 1, true)).toBe('win');
    expect(fanResultFromScores(2, 1, false)).toBe('loss');
    expect(fanResultFromScores(1, 1, true)).toBe('draw');
  });

  it('resolvePlayedFixtureFanLine only for the latest played id', () => {
    expect(
      resolvePlayedFixtureFanLine({
        fixtureId: 'fx-1',
        latestPlayedId: 'fx-1',
        homeScore: 7,
        awayScore: 5,
        isHome: false,
        storedMood: 54,
      }),
    ).toBe('Kibice: Spokojni 54 (-6)');
    expect(
      resolvePlayedFixtureFanLine({
        fixtureId: 'fx-old',
        latestPlayedId: 'fx-1',
        homeScore: 1,
        awayScore: 0,
        isHome: true,
        storedMood: 54,
      }),
    ).toBeNull();
  });
});
