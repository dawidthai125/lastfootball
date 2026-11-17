import { kickoffPressing } from '@/lib/training/style';

export type PressLine = 'high' | 'mid' | 'low';

export function isPressLine(value: string): value is PressLine {
  return value === 'high' || value === 'mid' || value === 'low';
}

export function pressLineShift(line: string): number {
  if (line === 'high') return 4;
  if (line === 'low') return -4;
  return 0;
}

export function kickoffPressingWithLine(points: number, line: string): number {
  const raw = kickoffPressing(points) + pressLineShift(line);
  if (raw < 34) return 34;
  if (raw > 74) return 74;
  return raw;
}

export function pressLineLabel(line: string): string {
  if (line === 'high') return 'Wysoki pressing';
  if (line === 'low') return 'Niski blok';
  return 'Środek';
}
