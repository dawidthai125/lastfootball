import { describe, expect, it } from 'vitest';

import { emptyPlayerName, latePressFromEvents, whyLine } from './why-line';

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

  it('says a late press produced a goal even when shots are close', () => {
    expect(
      whyLine({
        homeName: 'Lastovia',
        awayName: 'Orzeł',
        homeShots: 5,
        awayShots: 6,
        homePassesCompleted: 10,
        awayPassesCompleted: 12,
        firstGoalMinute: 12,
        latePress: { minute: 80, value: 75, goalAfter: true },
      }),
    ).toBe('Pressing 75 od 80. minuty dał gola.');
  });

  it('says a late press changed nothing when no goal followed', () => {
    expect(
      whyLine({
        homeName: 'Lastovia',
        awayName: 'Orzeł',
        homeShots: 5,
        awayShots: 6,
        homePassesCompleted: 10,
        awayPassesCompleted: 12,
        firstGoalMinute: null,
        latePress: { minute: 76, value: 70, goalAfter: false },
      }),
    ).toBe('Pressing 70 od 76. minuty nie zmienił wyniku.');
  });

  it('names the emptiest player only when shots and passes show no edge', () => {
    expect(
      whyLine({
        homeName: 'Lastovia',
        awayName: 'Orzeł',
        homeShots: 4,
        awayShots: 6,
        homePassesCompleted: 10,
        awayPassesCompleted: 12,
        firstGoalMinute: null,
        emptyName: 'A. Kot',
      }),
    ).toBe('Najbardziej pusty: A. Kot.');
  });

  it('keeps the shot sentence when a player is also empty', () => {
    expect(
      whyLine({
        homeName: 'Lastovia',
        awayName: 'Orzeł',
        homeShots: 9,
        awayShots: 3,
        homePassesCompleted: 10,
        awayPassesCompleted: 12,
        firstGoalMinute: 12,
        emptyName: 'A. Kot',
      }),
    ).toBe('Więcej strzałów miała drużyna Lastovia.');
  });
});

describe('latePressFromEvents', () => {
  it('keeps the last pressing change from minute 75 and drops earlier ones', () => {
    expect(
      latePressFromEvents([
        { type: 'SYSTEM', payload: { kind: 'pressing', minute: 40, value: 60 } },
        { type: 'SYSTEM', payload: { kind: 'pressing', minute: 78, value: 70 } },
        { type: 'SYSTEM', payload: { kind: 'pressing', minute: 84, value: 80 } },
        { type: 'GOAL', payload: { minute: 85 } },
      ]),
    ).toEqual({ minute: 84, value: 80 });
  });

  it('ignores a pressing change that has no minute', () => {
    expect(
      latePressFromEvents([{ type: 'SYSTEM', payload: { kind: 'pressing', value: 80 } }]),
    ).toBeNull();
  });
});

describe('emptyPlayerName', () => {
  it('picks the lowest freshness at or under 40', () => {
    expect(
      emptyPlayerName([
        { name: 'Świeży', freshness: 80 },
        { name: 'Zmęczony', freshness: 40 },
        { name: 'Pusty', freshness: 12 },
      ]),
    ).toBe('Pusty');
  });
});
