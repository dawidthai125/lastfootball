export const FIRST_MATCH_ID = 'first' as const;

export const FIRST_MATCH_PATHS = {
  intro: '/onboarding/first-match',
  prematch: `/match/${FIRST_MATCH_ID}`,
  live: `/match/${FIRST_MATCH_ID}/live`,
  welcome: '/onboarding/welcome-lf',
} as const;

export const FIRST_MATCH_BOT = {
  name: 'Orły Pustyni',
  shortName: 'ORP',
} as const;

/** True when pathname is part of the first-match tunnel (before Hub unlock). */
export function isFirstMatchTunnelPath(pathname: string): boolean {
  return (
    pathname === FIRST_MATCH_PATHS.intro ||
    pathname === FIRST_MATCH_PATHS.welcome ||
    pathname === FIRST_MATCH_PATHS.prematch ||
    pathname === FIRST_MATCH_PATHS.live ||
    pathname.startsWith(`${FIRST_MATCH_PATHS.prematch}/`)
  );
}
