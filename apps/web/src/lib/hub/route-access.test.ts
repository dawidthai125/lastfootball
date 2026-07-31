import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { FLAT_NAV } from '@/lib/nav';
import {
  isRouteSoftLocked,
  normalizePathname,
  resolveNavItemForPathname,
  resolveRouteNavAccess,
} from '@/lib/hub/route-access';
import { resolveNavAccess } from '@/lib/hub/unlock';

const webRoot = join(__dirname, '../..');

describe('route-access (LFE-SOFTLOCK-01)', () => {
  it('normalizes trailing slash', () => {
    expect(normalizePathname('/sponsors/')).toBe('/sponsors');
    expect(normalizePathname('/')).toBe('/');
  });

  it('maps FLAT_NAV hrefs; unknown paths pass-through (D67)', () => {
    expect(resolveNavItemForPathname('/sponsors')?.id).toBe('sponsors');
    expect(resolveNavItemForPathname('/board/')?.id).toBe('board');
    expect(resolveNavItemForPathname('/stadium')?.id).toBe('stadium');
    expect(resolveNavItemForPathname('/match/abc/live')).toBeNull();
    expect(resolveNavItemForPathname('/players/xyz')).toBeNull();
    expect(resolveRouteNavAccess('/match/abc', 'SEASON')).toBeNull();
  });

  it('route access matches navigation for every FLAT_NAV item (D63)', () => {
    const phases = ['NEW_CLUB', 'EARLY_CLUB', 'SEASON'] as const;
    const ctxVariants = [
      {},
      { transferWindowOpen: true, trainingUnlocked: true },
      { transferWindowOpen: false, trainingUnlocked: false },
    ];

    for (const phase of phases) {
      for (const ctx of ctxVariants) {
        for (const item of FLAT_NAV) {
          const nav = resolveNavAccess(item.id, phase, ctx);
          const route = resolveRouteNavAccess(item.href, phase, ctx);
          expect(route).toBe(nav);
          expect(isRouteSoftLocked(item.href, phase, ctx)).toBe(nav === 'soft_locked');
        }
      }
    }
  });

  it('opens sponsors on SEASON/OFFSEASON; board/stadium remain soft-locked (D99)', () => {
    for (const phase of ['SEASON', 'OFFSEASON'] as const) {
      expect(resolveRouteNavAccess('/sponsors', phase)).toBe('open');
      expect(isRouteSoftLocked('/sponsors', phase)).toBe(false);
      for (const href of ['/board', '/stadium'] as const) {
        expect(resolveRouteNavAccess(href, phase)).toBe('soft_locked');
        expect(isRouteSoftLocked(href, phase)).toBe(true);
      }
    }
  });

  it('pages strip Fake Production / PlaceholderPage (D52 · D64)', () => {
    const pages = [
      'app/(game)/sponsors/page.tsx',
      'app/(game)/board/page.tsx',
      'app/(game)/stadium/page.tsx',
    ];
    for (const rel of pages) {
      const src = readFileSync(join(webRoot, rel), 'utf8');
      expect(src).not.toMatch(/from ['"]@\/components\/layout\/PlaceholderPage['"]/);
      expect(src).not.toContain('Podgląd UI');
      expect(src).not.toContain('NordTech');
      expect(src).not.toContain('210 000');
      expect(src).not.toContain('8 400');
      expect(src).not.toContain('42 500');
      expect(src).not.toContain('450 000');
    }
  });

  it('sponsors page uses resolveClubSponsors (D96)', () => {
    const src = readFileSync(join(webRoot, 'app/(game)/sponsors/page.tsx'), 'utf8');
    expect(src).toContain('resolveClubSponsors');
    expect(src).toContain('SponsorsView');
  });
});
