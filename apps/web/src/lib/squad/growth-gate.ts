import { DEVELOPMENT_THIN } from '@/lib/squad/development-thin';
import {
  resolveCareerPhase,
  type CareerPhaseId,
  type CareerPhaseInput,
} from '@/lib/squad/career-phase';

/**
 * Growth Gate coefficient — never 0 (LOCK 2).
 * Shared by Match PRIMARY and Training SUPPORTING.
 * ≤1: impulse chance; >1: always allow + fractional bonus delta.
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
 * Deterministic allow for skill impulse.
 * roll = hash(playerId:impulseKey) % 1000; allow if roll < floor(coeff * 1000).
 * coeff ≥ 1 → always allow.
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

/**
 * Skill Δ when an impulse is allowed. Base = 1.
 * When coeff > 1 (Prime ×1.1): +1 more with probability (coeff − 1), deterministic.
 */
export function resolveGrowthSkillDelta(
  playerId: string,
  impulseKey: string,
  phaseOrInput: CareerPhaseId | CareerPhaseInput,
  base = DEVELOPMENT_THIN.SKILL_UP_MAX_PER_PLAYER,
): number {
  const phase = typeof phaseOrInput === 'string' ? phaseOrInput : resolveCareerPhase(phaseOrInput);
  const coeff = resolveGrowthCoefficient(phase);
  const safeBase = Math.max(1, Math.trunc(base));
  if (coeff <= 1) return safeBase;
  const bonusChance = coeff - 1;
  const threshold = Math.floor(bonusChance * 1000);
  if (threshold <= 0) return safeBase;
  const roll = stableHash(`${playerId}:${impulseKey}:prime-bonus`) % 1000;
  return roll < threshold ? safeBase + 1 : safeBase;
}

export function stableHash(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
