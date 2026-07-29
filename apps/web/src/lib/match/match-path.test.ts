import { describe, expect, it } from 'vitest';

import {
  isMatchPathPathname,
  matchLivePath,
  matchPrePath,
  matchTunnelPath,
  matchVsPath,
} from '@/lib/match/match-path';

describe('LFE-UI-IMPL-02 match path routes', () => {
  it('builds Tunnel → VS → Pre → Live paths', () => {
    const id = 'fx-1';
    expect(matchTunnelPath(id)).toBe('/match/fx-1/tunnel');
    expect(matchVsPath(id)).toBe('/match/fx-1/vs');
    expect(matchPrePath(id)).toBe('/match/fx-1');
    expect(matchLivePath(id)).toBe('/match/fx-1/live');
  });

  it('detects immersive match pathnames', () => {
    expect(isMatchPathPathname('/match/fx-1/tunnel')).toBe(true);
    expect(isMatchPathPathname('/match/fx-1/live')).toBe(true);
    expect(isMatchPathPathname('/hub')).toBe(false);
  });
});
