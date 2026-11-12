/**
 * One Polish sentence that says why a match looked the way it did.
 * Does not replace the three sentences from the match report.
 */

export type WhyLineInput = {
  readonly homeName: string;
  readonly awayName: string;
  readonly homeShots: number;
  readonly awayShots: number;
  readonly homePassesCompleted: number;
  readonly awayPassesCompleted: number;
  /** Display minute of the first goal, or null when nobody scored. */
  readonly firstGoalMinute: number | null;
};

function asInt(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.trunc(value);
}

export function whyLine(input: WhyLineInput): string {
  const minute = input.firstGoalMinute;
  if (minute !== null && Number.isFinite(minute) && asInt(minute) >= 75) {
    return 'Mecz otworzył się późno.';
  }

  const homeShots = asInt(input.homeShots);
  const awayShots = asInt(input.awayShots);
  if (Math.abs(homeShots - awayShots) >= 4) {
    const name = homeShots > awayShots ? input.homeName : input.awayName;
    return `Więcej strzałów miała drużyna ${name}.`;
  }

  const homePasses = asInt(input.homePassesCompleted);
  const awayPasses = asInt(input.awayPassesCompleted);
  if (Math.abs(homePasses - awayPasses) >= 20) {
    const name = homePasses > awayPasses ? input.homeName : input.awayName;
    return `Więcej celnych podań miała drużyna ${name}.`;
  }

  return 'Żadna strona nie narzuciła wyraźnej przewagi.';
}
