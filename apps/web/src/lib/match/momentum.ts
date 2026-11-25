/** Which side pushed, window by window, from the events of the match itself. */

const WINDOW_MINUTES = 7.5;
export const MOMENTUM_WINDOWS = 12;

const WEIGHT: Readonly<Record<string, number>> = { ATTACK: 1, CORNER: 1, SHOT: 2, GOAL: 3 };

/** 12 numbers: the home share (0–100) of a window. A quiet or future window is 50. */
export function momentumFromEvents(
  events: readonly { readonly type: string; readonly payload?: unknown }[],
): number[] {
  const home = new Array<number>(MOMENTUM_WINDOWS).fill(0);
  const away = new Array<number>(MOMENTUM_WINDOWS).fill(0);
  for (const event of events) {
    const weight = WEIGHT[String(event.type)];
    if (!weight || !event.payload || typeof event.payload !== 'object') continue;
    const payload = event.payload as { side?: unknown; minute?: unknown; kind?: unknown };
    // The decider of a shoot-out is not an attack.
    if (payload.kind === 'penalty_decider' || typeof payload.minute !== 'number') continue;
    const at = Math.floor(payload.minute / WINDOW_MINUTES);
    const index = Math.max(0, Math.min(MOMENTUM_WINDOWS - 1, at));
    if (payload.side === 'home') home[index]! += weight;
    else if (payload.side === 'away') away[index]! += weight;
  }
  return home.map((value, i) => {
    const total = value + away[i]!;
    return total === 0 ? 50 : Math.round((value / total) * 100);
  });
}
