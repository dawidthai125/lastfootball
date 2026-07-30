import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * LFE-MESSAGES-01 — gate against runtime mocks (D40/D41).
 */
describe('LFE-MESSAGES-01 mock gate', () => {
  const root = process.cwd();

  it('MessagesPreview is removed from production', () => {
    expect(existsSync(join(root, 'src/components/panel/MessagesPreview.tsx'))).toBe(false);
  });

  it('messages page has no hardcoded inbox subjects', () => {
    const src = readFileSync(join(root, 'src/app/(game)/messages/page.tsx'), 'utf8');
    expect(src).toContain('resolveClubMessages');
    expect(src).not.toContain('K. Baran');
    expect(src).not.toContain('kolejkę 12');
    expect(src).not.toContain('const messages = [');
  });

  it('OverlayRoot has no MOCK_NOTIFICATIONS', () => {
    const src = readFileSync(join(root, 'src/components/overlay/OverlayRoot.tsx'), 'utf8');
    expect(src).toContain('useClubMessages');
    expect(src).not.toContain('MOCK_NOTIFICATIONS');
    expect(src).not.toContain('Oznacz wszystkie jako przeczytane');
  });

  it('dashboardMock has no messagesPreview', () => {
    const src = readFileSync(join(root, 'src/data/mock.ts'), 'utf8');
    expect(src).not.toContain('messagesPreview');
    expect(src).not.toContain('K. Baran');
  });

  it('nav has no static messages badge FOMO flag', () => {
    const src = readFileSync(join(root, 'src/lib/nav.ts'), 'utf8');
    expect(src).not.toMatch(/id:\s*'messages'[\s\S]*?badge:\s*true/);
  });
});
