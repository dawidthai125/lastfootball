import { createKickoffCommand, type MatchSession } from '@lastfootball/lfe';

/** Play a shared seed with no manager commands. Both clubs must call this the same way. */
export function finishSharedSession(session: MatchSession, maxSteps = 8000) {
  session.start();
  session.step();
  session.dispatch(createKickoffCommand({ tick: session.context().tick, source: 'system' }));
  session.step();
  for (let step = 0; step < maxSteps; step += 1) {
    const phase = session.getMatchState().phase;
    if (phase === 'FINISHED' || phase === 'FULL_TIME' || session.status === 'stopped') break;
    session.step();
  }
  const state = session.getMatchState();
  return {
    seed: session.context().seed,
    home: state.score.home,
    away: state.score.away,
    homePasses: state.statistics.home.passesCompleted,
    awayPasses: state.statistics.away.passesCompleted,
    homeAttempted: state.statistics.home.passesAttempted,
    awayAttempted: state.statistics.away.passesAttempted,
  };
}
