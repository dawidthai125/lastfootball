import { DEVELOPMENT_THIN } from '@/lib/squad/development-thin';

/** Derived only — never persisted (D124). */
export type CareerPhaseId = 'youth' | 'rising' | 'prime' | 'decline' | 'late';

/**
 * Extensible domain input for Career Phase derive.
 * Thin uses `age` only. Optional fields are reserved so future EPICs
 * (role / experience / …) can extend without breaking `{ age }` callers.
 */
export type CareerPhaseInput = {
  readonly age: number;
  /** Future: position / preferred role bias (unused in Thin). */
  readonly role?: string;
  /** Future: accumulated experience signal (unused in Thin). */
  readonly experience?: number;
};

export type CareerPhaseView = {
  readonly id: CareerPhaseId;
  readonly label: string;
};

const PHASE_LABEL: Record<CareerPhaseId, string> = {
  youth: 'Młodość',
  rising: 'Rozwój',
  prime: 'Szczyt',
  decline: 'Schyłek',
  late: 'Jesień',
};

/**
 * Sole SSOT for Career Phase (D124).
 * Pure · deterministic · age-based Thin; ignores reserved optional fields today.
 */
export function resolveCareerPhase(input: CareerPhaseInput): CareerPhaseId {
  const age = normalizeAge(input.age);
  if (age <= DEVELOPMENT_THIN.PHASE_YOUTH_MAX) return 'youth';
  if (age <= DEVELOPMENT_THIN.PHASE_RISING_MAX) return 'rising';
  if (age <= DEVELOPMENT_THIN.PHASE_PRIME_MAX) return 'prime';
  if (age <= DEVELOPMENT_THIN.PHASE_DECLINE_MAX) return 'decline';
  return 'late';
}

/** Presentation helper — zero threshold logic. */
export function resolveCareerPhaseView(phase: CareerPhaseId): CareerPhaseView {
  return Object.freeze({ id: phase, label: PHASE_LABEL[phase] });
}

export function careerPhaseLabel(input: CareerPhaseInput): string {
  return resolveCareerPhaseView(resolveCareerPhase(input)).label;
}

function normalizeAge(age: number): number {
  if (!Number.isFinite(age)) return 1;
  return Math.max(1, Math.min(50, Math.trunc(age)));
}
