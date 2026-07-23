export interface Score {
  readonly home: number;
  readonly away: number;
}

export const ZERO_SCORE: Score = Object.freeze({ home: 0, away: 0 });

export function createScore(home = 0, away = 0): Score {
  return Object.freeze({ home, away });
}
