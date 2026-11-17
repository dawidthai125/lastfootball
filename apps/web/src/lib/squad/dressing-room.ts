import type { Personality } from '@/lib/squad/depth';
import { nextMorale } from '@/lib/squad/depth';

export type DressingConflict = {
  readonly id: string;
  readonly aId: string;
  readonly aName: string;
  readonly bId: string;
  readonly bName: string;
  readonly subject: string;
};

export type DressingPlayer = {
  readonly id: string;
  readonly name: string;
  readonly morale: number;
  readonly personality: Personality;
  readonly starter: boolean;
};

/**
 * One conflict when two explosive starters sit under morale 45.
 * Pure — UI must not invent a second rule.
 */
export function resolveDressingConflict(
  players: readonly DressingPlayer[],
): DressingConflict | null {
  const hot = players
    .filter((p) => p.starter && p.personality === 'wybuchowy' && p.morale < 45)
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id));
  if (hot.length < 2) return null;
  const a = hot[0]!;
  const b = hot[1]!;
  return {
    id: `dress:${a.id}:${b.id}`,
    aId: a.id,
    aName: a.name,
    bId: b.id,
    bName: b.name,
    subject: `Szatnia: ${a.name} i ${b.name}`,
  };
}

export function mediateConflictMorale(current: number): number {
  return nextMorale(current, 3);
}

export function ignoreConflictMorale(current: number): number {
  return nextMorale(current, -2);
}
