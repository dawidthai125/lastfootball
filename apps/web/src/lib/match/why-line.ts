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
  /** Last pressing change from the 75th minute, when the log has one. */
  readonly latePress?: {
    readonly minute: number;
    readonly value: number;
    readonly goalAfter: boolean;
  } | null;
  /** Name of the least fresh player at or under 40. Absent when nobody is empty. */
  readonly emptyName?: string | null;
};

/** Last pressing dial at minute 75 or later. Earlier changes and missing minutes are ignored. */
export function latePressFromEvents(
  events: readonly { type: string; payload?: unknown }[],
): { minute: number; value: number } | null {
  let found: { minute: number; value: number } | null = null;
  for (const event of events) {
    if (event.type !== 'SYSTEM' || !event.payload || typeof event.payload !== 'object') continue;
    const payload = event.payload as { kind?: unknown; minute?: unknown; value?: unknown };
    if (payload.kind !== 'pressing') continue;
    if (typeof payload.minute !== 'number' || typeof payload.value !== 'number') continue;
    const minute = Math.trunc(payload.minute);
    const value = Math.trunc(payload.value);
    if (!Number.isFinite(minute) || minute < 75 || !Number.isFinite(value)) continue;
    found = { minute, value };
  }
  return found;
}

/** Lowest freshness at or under 40. Fresher players stay out of the sentence. */
export function emptyPlayerName(
  players: readonly { name: string; freshness: number }[],
): string | null {
  let best: { name: string; freshness: number } | null = null;
  for (const player of players) {
    if (!Number.isFinite(player.freshness) || player.freshness > 40) continue;
    const name = player.name.trim();
    if (!name) continue;
    if (!best || player.freshness < best.freshness) best = { name, freshness: player.freshness };
  }
  return best ? best.name : null;
}

function asInt(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.trunc(value);
}

export function whyLine(input: WhyLineInput): string {
  const minute = input.firstGoalMinute;
  if (minute !== null && Number.isFinite(minute) && asInt(minute) >= 75) {
    return 'Mecz otworzył się późno.';
  }

  const press = input.latePress;
  if (press && Number.isFinite(press.minute) && asInt(press.minute) >= 75) {
    const value = asInt(press.value);
    const at = asInt(press.minute);
    return press.goalAfter
      ? `Pressing ${value} od ${at}. minuty dał gola.`
      : `Pressing ${value} od ${at}. minuty nie zmienił wyniku.`;
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

  const empty = input.emptyName?.trim();
  if (empty) return `Najbardziej pusty: ${empty}.`;

  return 'Żadna strona nie narzuciła wyraźnej przewagi.';
}
