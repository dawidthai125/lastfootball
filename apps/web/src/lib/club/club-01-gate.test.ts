import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * LFE-CLUB-01 — gate against PlaceholderPage / mocks / staff (D40/D41 · D47–D50).
 */
describe('LFE-CLUB-01 club page gate', () => {
  const root = process.cwd();
  const pagePath = join(root, 'src/app/(game)/club/page.tsx');
  const viewPath = join(root, 'src/components/club/ClubProfileView.tsx');

  it('club page feeds only resolveClubProfile', () => {
    const src = readFileSync(pagePath, 'utf8');
    expect(src).toContain('resolveClubProfile');
    expect(src).toContain('ClubProfileView');
    expect(src).not.toContain('PlaceholderPage');
    expect(src).not.toContain('Podgląd UI');
    expect(src).not.toContain('dashboardMock');
  });

  it('club page has no wkrótce / staff placeholders', () => {
    const src = readFileSync(pagePath, 'utf8');
    expect(src).not.toContain('wkrótce');
    expect(src).not.toContain('Personel');
    expect(src).not.toContain('Asystent');
    expect(src).not.toContain('Skaut');
  });

  it('ClubProfileView is presentation-only (no resolve / STARTER / formatMoney)', () => {
    const src = readFileSync(viewPath, 'utf8');
    expect(src).toContain('ClubProfileDto');
    expect(src).not.toContain('resolveClubProfile');
    expect(src).not.toContain('STARTER_PACKAGE');
    expect(src).not.toContain('formatMoney');
    expect(src).not.toContain('resolveLeagueTable');
    expect(src).not.toContain('getManagerClub');
    expect(src).not.toContain('Personel');
    expect(src).not.toContain('wkrótce');
    expect(src).not.toContain('Podgląd UI');
  });
});
