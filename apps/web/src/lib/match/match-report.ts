/**
 * Three sentences after a match. Every number comes from the recorded log.
 */

export type MatchReportInput = {
  readonly homeName: string;
  readonly awayName: string;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly homePassesCompleted: number;
  readonly awayPassesCompleted: number;
  readonly homeShots: number;
  readonly awayShots: number;
  readonly firstGoal: {
    readonly minute: string;
    readonly side: 'home' | 'away' | 'unknown';
  } | null;
};

export function threeMatchSentences(input: MatchReportInput): readonly [string, string, string] {
  const score = `${input.homeName} ${input.homeScore}:${input.awayScore} ${input.awayName}.`;
  const passes = `Podania celne: ${input.homeName} ${input.homePassesCompleted}, ${input.awayName} ${input.awayPassesCompleted}.`;
  const third = input.firstGoal
    ? `Pierwszy gol: ${input.firstGoal.minute}, ${sideName(input, input.firstGoal.side)}.`
    : `Strzały: ${input.homeName} ${input.homeShots}, ${input.awayName} ${input.awayShots}.`;
  return [score, passes, third];
}

function sideName(input: MatchReportInput, side: 'home' | 'away' | 'unknown'): string {
  if (side === 'home') return input.homeName;
  if (side === 'away') return input.awayName;
  return 'nieznana drużyna';
}
