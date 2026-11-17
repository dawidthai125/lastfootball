import { describe, expect, it } from 'vitest';

import { clubHomeResult } from '@/lib/first-match/result';

describe('clubHomeResult', () => {
  it('reads the inaugural score from the home side', () => {
    expect(clubHomeResult(1, 1)).toBe('draw');
    expect(clubHomeResult(2, 0)).toBe('win');
    expect(clubHomeResult(0, 1)).toBe('loss');
  });

  it('rejects a score that was not sent', () => {
    expect(clubHomeResult(Number.NaN, 1)).toBeNull();
    expect(clubHomeResult(1.5, 0)).toBeNull();
    expect(clubHomeResult(-1, 0)).toBeNull();
  });
});
