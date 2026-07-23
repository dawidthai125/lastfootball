import type { MatchSessionConfig } from './types';
import { createMatchModel, createMatchSettings, createMatchState, createTeam } from '../domain';
import type { Match } from '../domain';

/** Build Match aggregate + MatchState from session config. */
export function buildMatchFromConfig(config: MatchSessionConfig): Match {
  const home = createTeam({
    id: config.homeTeamId,
    name: config.homeTeamName ?? String(config.homeTeamId),
    shortName: config.homeShortName ?? 'HOM',
    side: 'home',
  });
  const away = createTeam({
    id: config.awayTeamId,
    name: config.awayTeamName ?? String(config.awayTeamId),
    shortName: config.awayShortName ?? 'AWY',
    side: 'away',
  });

  const settings = createMatchSettings(config.settings);
  const state = createMatchState({
    homeTeam: home,
    awayTeam: away,
    homeLineup: config.homeLineup,
    awayLineup: config.awayLineup,
    homeBench: config.homeBench,
    awayBench: config.awayBench,
    players: config.players,
    phase: 'PRE_MATCH',
  });

  return createMatchModel({
    id: config.matchId ?? `match-${config.seed}`,
    seed: config.seed,
    state,
    settings,
  });
}
