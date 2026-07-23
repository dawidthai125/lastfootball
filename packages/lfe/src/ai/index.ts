/**
 * Match AI (LFE-MATCH-AI-01).
 * Pure decision layer — no MatchState mutation, no EventBus, no UI.
 * Match Engine consumes decisions and applies RNG + state/events.
 */

export type {
  MatchAiActionDecision,
  MatchAiContext,
  MatchAiDecision,
  MatchAiPossessionDecision,
  MatchAiSideContext,
} from './types';

export { buildMatchAiContext, formationAggressiveness, sideContext } from './context';

export {
  decideAction,
  decideActionFromState,
  decidePossession,
  decidePossessionFromState,
  scorePhaseModifier,
} from './decide';

export type { TacticStyle } from './styles';
export { styleFromMentality } from './styles';
