import { describe, expect, it } from 'vitest';

import { safeNextPath } from '@/lib/auth/safe-next';

describe('path after signing in', () => {
  it('keeps a path inside the game', () => {
    expect(safeNextPath('/hub')).toBe('/hub');
    expect(safeNextPath('/match/1/live?x=1')).toBe('/match/1/live?x=1');
  });

  it('refuses another site in every spelling a browser accepts', () => {
    for (const next of [
      '//evil.example',
      '/\\evil.example/logo.svg',
      '/\t/evil.example',
      '/\n/evil.example',
      'https://evil.example',
      '',
      null,
      undefined,
    ]) {
      expect(safeNextPath(next)).toBeNull();
    }
  });
});
