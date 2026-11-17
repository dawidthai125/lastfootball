import { describe, expect, it } from 'vitest';

import { preMatchStakeValue, preMatchWeatherNote } from '@/lib/fixtures/pre-match-copy';

describe('pre-match competition copy', () => {
  it('names a challenge and a cup instead of the league', () => {
    expect(preMatchStakeValue('challenge', 'IV liga')).toBe('Wyzwanie');
    expect(preMatchStakeValue('cup', 'IV liga')).toBe('Puchar');
    expect(preMatchStakeValue('human', 'IV liga')).toBe('Liga ludzi');
    expect(preMatchStakeValue('league', 'IV liga')).toBe('IV liga');
  });

  it('keeps the league weather sentence and names the other competitions', () => {
    expect(preMatchWeatherNote('league')).toBe(
      'Mecz ligowy — bez wpływu pogody na silnik (Thin A)',
    );
    expect(preMatchWeatherNote('challenge')).toContain('Wyzwanie');
    expect(preMatchWeatherNote('cup')).toContain('Puchar');
    expect(preMatchWeatherNote('challenge')).not.toContain('ligowy');
  });
});
