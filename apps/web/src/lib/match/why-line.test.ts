import { describe, expect, it } from 'vitest';

import { whyLine } from './why-line';

describe('whyLine', () => {
  it('returns the late sentence at minute 80 even when shots differ by 10', () => {
    expect(
      whyLine({
        homeName: 'Lastovia',
        awayName: 'Orzeł',
        homeShots: 12,
        awayShots: 2,
        homePassesCompleted: 140,
        awayPassesCompleted: 100,
        firstGoalMinute: 80,
      }),
    ).toBe('Mecz otworzył się późno.');
  });

  it('names the home side when shots are 9 vs 3 at minute 12', () => {
    expect(
      whyLine({
        homeName: 'Lastovia',
        awayName: 'Orzeł',
        homeShots: 9,
        awayShots: 3,
        homePassesCompleted: 100,
        awayPassesCompleted: 90,
        firstGoalMinute: 12,
      }),
    ).toBe('Więcej strzałów miała drużyna Lastovia.');
  });

  it('names the home side when shots are close and passes are 140 vs 100', () => {
    expect(
      whyLine({
        homeName: 'Lastovia',
        awayName: 'Orzeł',
        homeShots: 5,
        awayShots: 6,
        homePassesCompleted: 140,
        awayPassesCompleted: 100,
        firstGoalMinute: 12,
      }),
    ).toBe('Więcej celnych podań miała drużyna Lastovia.');
  });

  it('returns the equal sentence when shots, passes and a missing goal show no edge', () => {
    expect(
      whyLine({
        homeName: 'Lastovia',
        awayName: 'Orzeł',
        homeShots: 4,
        awayShots: 6,
        homePassesCompleted: 10,
        awayPassesCompleted: 12,
        firstGoalMinute: null,
      }),
    ).toBe('Żadna strona nie narzuciła wyraźnej przewagi.');
  });

  it('names the away side when shots are 1 vs 8', () => {
    expect(
      whyLine({
        homeName: 'Lastovia',
        awayName: 'Orzeł',
        homeShots: 1,
        awayShots: 8,
        homePassesCompleted: 10,
        awayPassesCompleted: 12,
        firstGoalMinute: null,
      }),
    ).toBe('Więcej strzałów miała drużyna Orzeł.');
  });
});
