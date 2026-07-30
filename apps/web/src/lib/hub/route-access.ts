import { FLAT_NAV, type NavItem } from '@/lib/nav';
import type { HubNavAccess, HubPhase } from '@/lib/hub/types';
import {
  isModuleSoftLocked,
  resolveNavAccess,
  type NavAccessContext,
} from '@/lib/hub/unlock';

/** Normalize trailing slash (except root). */
export function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname || '/';
}

/**
 * Map URL → FLAT_NAV item. No match → null (D67 pass-through).
 * Exact href wins; else longest prefix `href/`.
 * Adding a nav item to FLAT_NAV is enough for the gate (D66).
 */
export function resolveNavItemForPathname(pathname: string): NavItem | null {
  const path = normalizePathname(pathname);
  const exact = FLAT_NAV.find((item) => item.href === path);
  if (exact) return exact;

  const prefixed = FLAT_NAV.filter((item) => path.startsWith(`${item.href}/`)).sort(
    (a, b) => b.href.length - a.href.length,
  );
  return prefixed[0] ?? null;
}

/**
 * Route access mirrored from nav SSOT (D63).
 * `null` = outside FLAT_NAV → transparent pass-through (D67).
 */
export function resolveRouteNavAccess(
  pathname: string,
  phase: HubPhase,
  ctx: NavAccessContext = {},
): HubNavAccess | null {
  const item = resolveNavItemForPathname(pathname);
  if (!item) return null;
  return resolveNavAccess(item.id, phase, ctx);
}

/** True when route is soft-locked; false when open or pass-through. */
export function isRouteSoftLocked(
  pathname: string,
  phase: HubPhase,
  ctx: NavAccessContext = {},
): boolean {
  const item = resolveNavItemForPathname(pathname);
  if (!item) return false;
  return isModuleSoftLocked(item.id, phase, ctx);
}
