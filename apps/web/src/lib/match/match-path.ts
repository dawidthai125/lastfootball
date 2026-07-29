/**
 * LFE-UI-IMPL-02 — Match Path route helpers (presentation).
 */

export function matchTunnelPath(id: string): string {
  return `/match/${id}/tunnel`;
}

export function matchVsPath(id: string): string {
  return `/match/${id}/vs`;
}

export function matchPrePath(id: string): string {
  return `/match/${id}`;
}

export function matchLivePath(id: string): string {
  return `/match/${id}/live`;
}

/** Immersive Match Path — hide shell nav (Hi-Fi). */
export function isMatchPathPathname(pathname: string): boolean {
  return pathname === '/match' || pathname.startsWith('/match/');
}
