import { kickoffPressing } from '@/lib/training/style';

export type PressLine = 'high' | 'mid' | 'low';
export type PressShape = 'flat' | 'left_high' | 'right_high' | 'split';

export function isPressLine(value: string): value is PressLine {
  return value === 'high' || value === 'mid' || value === 'low';
}

export function isPressShape(value: string): value is PressShape {
  return (
    value === 'flat' || value === 'left_high' || value === 'right_high' || value === 'split'
  );
}

export function pressLineShift(line: string): number {
  if (line === 'high') return 4;
  if (line === 'low') return -4;
  return 0;
}

/** Shape shifts the kickoff pressing dial on top of the line. */
export function pressShapeShift(shape: string): number {
  if (shape === 'left_high' || shape === 'right_high') return 2;
  if (shape === 'split') return 1;
  return 0;
}

export function kickoffPressingWithLine(
  points: number,
  line: string,
  shape: string = 'flat',
): number {
  const raw = kickoffPressing(points) + pressLineShift(line) + pressShapeShift(shape);
  if (raw < 34) return 34;
  if (raw > 74) return 74;
  return raw;
}

export function pressLineLabel(line: string): string {
  if (line === 'high') return 'Wysoki pressing';
  if (line === 'low') return 'Niski blok';
  return 'Środek';
}

export function pressShapeLabel(shape: string): string {
  if (shape === 'left_high') return 'Lewa wysoko';
  if (shape === 'right_high') return 'Prawa wysoko';
  if (shape === 'split') return 'Rozciągnięty';
  return 'Równo';
}
