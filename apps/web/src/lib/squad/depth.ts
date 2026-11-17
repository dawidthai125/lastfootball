/** Club depth that other screens can store: morale, personality, staff, set pieces. */

export type Personality = 'spokojny' | 'lider' | 'wybuchowy';
export type MatchRole = 'xi' | 'bench' | 'out';
export type MatchResult = 'win' | 'draw' | 'loss';
export type PressTone = 'praise' | 'calm' | 'criticize';

export const PERSONALITIES = ['spokojny', 'lider', 'wybuchowy'] as const;
export const STAFF_FEE = 8_000;

export function isPersonality(value: unknown): value is Personality {
  return value === 'spokojny' || value === 'lider' || value === 'wybuchowy';
}

export function personalityLabel(value: Personality): string {
  if (value === 'lider') return 'Lider';
  if (value === 'wybuchowy') return 'Wybuchowy';
  return 'Spokojny';
}

/** Same mix as the database function personality_from_id. */
export function personalityFromId(id: string): Personality {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 33 + id.charCodeAt(i)) >>> 0;
  }
  return PERSONALITIES[hash % 3] ?? 'spokojny';
}

export function moraleDelta(input: {
  readonly result: MatchResult;
  readonly role: MatchRole;
  readonly personality: Personality;
}): number {
  if (input.role === 'out') return 0;
  const base = input.result === 'win' ? 4 : input.result === 'loss' ? -4 : 0;
  let extra = 0;
  if (input.personality === 'lider')
    extra = input.result === 'win' ? 2 : input.result === 'loss' ? -1 : 0;
  if (input.personality === 'wybuchowy') {
    extra = input.result === 'win' ? 2 : input.result === 'loss' ? -3 : 0;
  }
  const swing = input.personality === 'spokojny' ? Math.trunc((base + extra) / 2) : base + extra;
  return input.role === 'bench' ? Math.trunc(swing / 2) : swing;
}

export function nextMorale(current: number, delta: number): number {
  const base = Number.isFinite(current) ? Math.trunc(current) : 60;
  return Math.max(0, Math.min(100, base + delta));
}

export function contractUntilLabel(iso: string | null | undefined): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return '30.06.2028';
  const [year, month, day] = iso.slice(0, 10).split('-');
  return `${day}.${month}.${year}`;
}

export function clauseFromSkill(skill: number): number {
  const safe = Number.isFinite(skill) ? Math.trunc(skill) : 0;
  return 100_000 + safe * 5_000;
}

export function hireOnce(input: {
  readonly cash: number;
  readonly owned: boolean;
}): { ok: true; fee: number; cashAfter: number } | { ok: false; reason: 'cash' } {
  if (input.owned) return { ok: true, fee: 0, cashAfter: input.cash };
  if (!Number.isFinite(input.cash) || input.cash < STAFF_FEE) return { ok: false, reason: 'cash' };
  return { ok: true, fee: STAFF_FEE, cashAfter: input.cash - STAFF_FEE };
}

export function individualStep(input: {
  readonly energy: number;
  readonly group: number;
  readonly potential: number;
  readonly lastOn: string | null;
  readonly today: string;
}): { ok: true; energy: number; group: number } | { ok: false; reason: 'today' | 'energy' } {
  if (input.lastOn === input.today) return { ok: false, reason: 'today' };
  if (!Number.isFinite(input.energy) || input.energy < 15) return { ok: false, reason: 'energy' };
  const cap = Number.isFinite(input.potential) ? Math.trunc(input.potential) : input.group;
  return {
    ok: true,
    energy: Math.max(0, Math.trunc(input.energy) - 8),
    group: Math.min(cap, Math.trunc(input.group) + 1),
  };
}

export function pressDelta(tone: PressTone): number {
  if (tone === 'praise') return 2;
  if (tone === 'criticize') return -2;
  return 0;
}

export function isPressTone(value: unknown): value is PressTone {
  return value === 'praise' || value === 'calm' || value === 'criticize';
}

/** Physio clears one extra missed match. A one-match injury still costs that match. */
export function injuryLeft(matches: number, physio: boolean): number {
  const step = physio ? 2 : 1;
  return Math.max(0, Math.trunc(matches) - step);
}
