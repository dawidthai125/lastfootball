import type { DeepPartial, LfeConfig } from '../../config';
import type { Logger } from '../../core';
import type { MatchInput } from '../types';

/**
 * Configuration for createMatch / MatchSession (EPIC-6).
 * Extends MatchInput with engine + display options.
 */
export interface MatchSessionConfig extends MatchInput {
  readonly homeTeamName?: string;
  readonly awayTeamName?: string;
  readonly homeShortName?: string;
  readonly awayShortName?: string;
  readonly engine?: DeepPartial<LfeConfig>;
  readonly logger?: Logger;
}

export type SessionStatus = 'created' | 'ready' | 'running' | 'paused' | 'stopped' | 'disposed';
