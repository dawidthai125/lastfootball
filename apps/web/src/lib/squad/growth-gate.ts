import { DEVELOPMENT_THIN } from '@/lib/squad/development-thin';
import {
  resolveCareerPhase,
  type CareerPhaseId,
  type CareerPhaseInput,
} from '@/lib/squad/career-phase';

/**
 * Growth Gate coefficient ∈ (0, 1] — never 0 (LOCK 2).
 * Shared by Match PRIMARY and Training SUPPORTING.
 */
export function resolveGrowthCoefficient(phase: CareerPhaseId): number {
  switch (phase) {
    case 'youth':
      return DEVELOPMENT_THIN.GROWTH_COEFF_YOUTH;
    case 'rising':
      return DEVELOPMENT_THIN.GROWTH_COEFF_RISING;
    case 'prime':
      return DEVELOPMENT_THIN.GROWTH_COEFF_PRIME;
    case 'decline':
      return DEVELOPMENT_THIN.GROWTH_COEFF_DECLINE;
    case 'late':
      return DEVELOPMENT_THIN.GROWTH_COEFF_LATE;
    default: {
      const _exhaustive: never = phase;
      return _exhaustive;
    }
  }
}

/**
 * Deterministic allow for +1 skill impulse.
 * roll = hash(playerId:impulseKey) % 1000; allow if roll < floor(coeff * 1000).
 */
export function allowGrowthImpulse(
  playerId: string,
  impulseKey: string,
  phaseOrInput: CareerPhaseId | CareerPhaseInput,
): boolean {
  const phase = typeof phaseOrInput === 'string' ? phaseOrInput : resolveCareerPhase(phaseOrInput);
  const coeff = resolveGrowthCoefficient(phase);
  if (coeff >= 1) return true;
  const threshold = Math.floor(coeff * 1000);
  if (threshold <= 0) return false;
  const roll = stableHash(`${playerId}:${impulseKey}`) % 1000;
  return roll < threshold;
}

function stableHash(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
