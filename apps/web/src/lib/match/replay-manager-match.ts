import { createKickoffCommand, type MatchSession, type PitchSide } from '@lastfootball/lfe';

import {
  LIVE_SUB_LIMIT,
  SUB_COMMAND,
  managerCommand,
  managerSubstitution,
  type ManagerLogEntry,
} from '@/lib/match/manager-commands';

const MAX_STEPS = 12_000;

/** Same start as LiveMatchRuntime: the log ticks only line up with this order. */
export function kickOffSession(session: MatchSession): void {
  session.start();
  session.step();
  session.dispatch(createKickoffCommand({ tick: session.context().tick, source: 'system' }));
  session.step();
}

/**
 * Official result of a manager match (D127). Seed, squads and decisions are replayed
 * on the server; the browser never states a score. Unknown or refused entries are
 * skipped exactly like a refused click in the live view.
 */
export function replayManagerMatch(
  session: MatchSession,
  side: PitchSide,
  log: readonly ManagerLogEntry[],
): { home: number; away: number } | null {
  kickOffSession(session);
  let next = 0;
  for (let step = 0; step < MAX_STEPS; step += 1) {
    const state = session.getMatchState();
    if (state.phase === 'FINISHED') return { home: state.score.home, away: state.score.away };
    const tick = session.context().tick;
    while (next < log.length && log[next]!.t <= tick) {
      apply(session, side, log[next]!, tick);
      next += 1;
    }
    session.step();
  }
  return null;
}

function apply(session: MatchSession, side: PitchSide, entry: ManagerLogEntry, tick: number): void {
  const state = session.getMatchState();
  if (entry.c === SUB_COMMAND) {
    if (state.phase === 'FULL_TIME') return;
    const used = state.substitutions.filter((sub) => sub.side === side).length;
    if (used >= LIVE_SUB_LIMIT) return;
    session.dispatch(managerSubstitution(entry.o!, entry.i!, tick, side));
  } else {
    const command = managerCommand(entry.c, tick, side);
    if (!command) return;
    session.dispatch(command);
  }
  session.context().events.flush();
}
