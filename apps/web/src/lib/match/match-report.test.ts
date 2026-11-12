import { describe, expect, it } from 'vitest';

import { threeMatchSentences } from './match-report';

describe('threeMatchSentences', () => {
  it('builds three sentences from the score, passes and the first goal', () => {
    const lines = threeMatchSentences({
      homeName: 'Lastovia',
      awayName: 'Orzeł',
      homeScore: 2,
      awayScore: 1,
      homePassesCompleted: 140,
      awayPassesCompleted: 121,
      homeShots: 8,
      awayShots: 5,
      firstGoal: { minute: "12'", side: 'home' },
    });

    expect(lines).toEqual([
      'Lastovia 2:1 Orzeł.',
      'Podania celne: Lastovia 140, Orzeł 121.',
      "Pierwszy gol: 12', Lastovia.",
    ]);
  });

  it('uses shots when the log has no goal', () => {
    const lines = threeMatchSentences({
      homeName: 'A',
      awayName: 'B',
      homeScore: 0,
      awayScore: 0,
      homePassesCompleted: 10,
      awayPassesCompleted: 9,
      homeShots: 3,
      awayShots: 4,
      firstGoal: null,
    });

    expect(lines[2]).toBe('Strzały: A 3, B 4.');
  });
});
