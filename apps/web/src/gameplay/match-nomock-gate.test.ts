import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Match and player identity must come from the club, never from dashboardMock.
 */
describe('runtime club identity gate', () => {
  const root = process.cwd();

  it('live match and player hero do not read dashboardMock', () => {
    const files = [
      'src/gameplay/live-match-runtime.ts',
      'src/components/match/LiveMatchFoundation.tsx',
      'src/components/squad/PlayerDetail.tsx',
    ];
    for (const file of files) {
      const src = readFileSync(join(root, file), 'utf8');
      expect(src, file).not.toContain('dashboardMock');
    }
  });

  it('live runtime does not build a session from the seed fixture', () => {
    const src = readFileSync(join(root, 'src/gameplay/live-match-runtime.ts'), 'utf8');
    expect(src).not.toContain('createSessionFromFixture');
    expect(existsSync(join(root, 'src/gameplay/create-session-from-fixture.ts'))).toBe(false);
  });
});
