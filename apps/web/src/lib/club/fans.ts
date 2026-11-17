export type FanResult = 'win' | 'draw' | 'loss';

export function nextFanMood(current: number, result: FanResult): number {
  const base = Number.isFinite(current) ? Math.trunc(current) : 60;
  const delta = result === 'win' ? 6 : result === 'loss' ? -6 : 1;
  return Math.max(0, Math.min(100, base + delta));
}

export function fanMoodLabel(mood: number): string {
  if (!Number.isFinite(mood)) return 'Spokojni';
  if (mood >= 75) return 'Gorący';
  if (mood >= 50) return 'Spokojni';
  if (mood >= 25) return 'Zniecierpliwieni';
  return 'Wściekli';
}
