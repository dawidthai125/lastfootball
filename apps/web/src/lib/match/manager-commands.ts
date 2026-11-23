import {
  createChangeFormationCommand,
  createSetMentalityCommand,
  createSetPressingCommand,
  createSetTempoCommand,
  createSetWidthCommand,
  createSubstitutePlayerCommand,
  type MatchSession,
  type PitchSide,
} from '@lastfootball/lfe';

export const LIVE_SUB_LIMIT = 3;
export const SUB_COMMAND = 'sub';
/** More entries than any manager needs; a longer log is refused. */
export const MANAGER_LOG_MAX = 300;

/** One manager decision. `t` is the session tick it was dispatched on. */
export type ManagerLogEntry = {
  readonly t: number;
  readonly c: string;
  readonly o?: string;
  readonly i?: string;
};

type LfeCommand = Parameters<MatchSession['dispatch']>[0];

export function managerCommand(
  commandId: string,
  tick: number,
  side: PitchSide,
): LfeCommand | null {
  switch (commandId) {
    case 'press':
      return createSetPressingCommand({ tick, source: 'ui', value: 75, side });
    case 'tempo':
      return createSetTempoCommand({ tick, source: 'ui', value: 70, side });
    case 'wide':
      return createSetWidthCommand({ tick, source: 'ui', value: 70, side });
    case 'attack':
      return createSetMentalityCommand({ tick, source: 'ui', value: 70, side });
    case 'defend':
      return createSetMentalityCommand({ tick, source: 'ui', value: 30, side });
    case 'balance':
      return createSetMentalityCommand({ tick, source: 'ui', value: 50, side });
    case 'form-442':
      return createChangeFormationCommand({ tick, source: 'ui', side, formationCode: '4-4-2' });
    case 'form-433':
      return createChangeFormationCommand({ tick, source: 'ui', side, formationCode: '4-3-3' });
    default:
      return null;
  }
}

export function managerSubstitution(
  playerOutId: string,
  playerInId: string,
  tick: number,
  side: PitchSide,
): LfeCommand {
  return createSubstitutePlayerCommand({ tick, source: 'ui', side, playerOutId, playerInId });
}

/** Untrusted form text → log. Null means the log is not usable. */
export function parseManagerLog(raw: unknown): readonly ManagerLogEntry[] | null {
  if (raw == null || raw === '') return [];
  if (typeof raw !== 'string' || raw.length > 60_000) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(value) || value.length > MANAGER_LOG_MAX) return null;
  const out: ManagerLogEntry[] = [];
  let last = 0;
  for (const item of value as unknown[]) {
    if (typeof item !== 'object' || item === null) return null;
    const { t, c, o, i } = item as Record<string, unknown>;
    if (typeof t !== 'number' || !Number.isInteger(t) || t < last || t > 20_000) return null;
    if (typeof c !== 'string' || c.length > 20) return null;
    last = t;
    if (c === SUB_COMMAND) {
      if (typeof o !== 'string' || typeof i !== 'string' || o.length > 80 || i.length > 80) {
        return null;
      }
      out.push({ t, c, o, i });
    } else {
      out.push({ t, c });
    }
  }
  return out;
}
