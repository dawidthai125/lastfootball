/**
 * Last Football Engine — public API surface.
 * Foundation only: status + placeholders. No match simulation yet.
 */

export { LFE_VERSION, LFE_STATUS, getEngineStatus } from './status';
export type { EngineStatus, EngineModuleStatus, EngineStatusReport } from './status';

export type { MatchInput, MatchResult, MatchEvent, MatchHandle } from './match/types';
export { createMatch } from './match/session';
