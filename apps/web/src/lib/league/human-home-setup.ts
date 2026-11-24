import { clampStyle } from '@/lib/training/style';

/** Home side of a human league match, frozen with the line-ups (D137). */
export type HumanHomeSetup = {
  readonly homePitchLevel: number;
  readonly homeStylePressing: number;
  readonly homeStyleTempo: number;
  readonly homeStyleWidth: number;
  readonly homePressLine: 'high' | 'mid' | 'low';
  readonly homePressShape: 'left_high' | 'right_high' | 'split' | 'flat';
};

/** A bot, or an unreadable value, plays with the neutral setup. */
export function parseHomeSetup(value: unknown): HumanHomeSetup {
  const row = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const number = (key: string) => {
    const raw = row[key];
    return typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
  };
  const line = row.homePressLine;
  const shape = row.homePressShape;
  return {
    homePitchLevel: Math.max(0, Math.min(3, Math.trunc(number('homePitchLevel')))),
    homeStylePressing: clampStyle(number('homeStylePressing')),
    homeStyleTempo: clampStyle(number('homeStyleTempo')),
    homeStyleWidth: clampStyle(number('homeStyleWidth')),
    homePressLine: line === 'high' || line === 'low' ? line : 'mid',
    homePressShape:
      shape === 'left_high' || shape === 'right_high' || shape === 'split' ? shape : 'flat',
  };
}
