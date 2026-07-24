import { NextResponse, type NextRequest } from 'next/server';

import { isFirstMatchTunnelPath, FIRST_MATCH_PATHS } from '@/lib/first-match/constants';
import { updateSession } from '@/lib/supabase/middleware';

const PUBLIC_PREFIXES = ['/login', '/register', '/auth', '/regulamin', '/prywatnosc', '/status'];

/** In-game / onboarding — require session. */
const PROTECTED_PREFIXES = [
  '/hub',
  '/welcome',
  '/onboarding',
  '/club',
  '/squad',
  '/stadium',
  '/league',
  '/matches',
  '/match',
  '/training',
  '/academy',
  '/scouting',
  '/transfers',
  '/finance',
  '/sponsors',
  '/board',
  '/messages',
  '/achievements',
  '/profile',
  '/settings',
  '/players',
  '/player',
  '/rankings',
];

function startsWithAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isSafeNext(path: string | null): path is string {
  return Boolean(path && path.startsWith('/') && !path.startsWith('//'));
}

function postAuthPath(hasClub: boolean, firstMatchCompleted: boolean): string {
  if (!hasClub) return '/welcome';
  if (!firstMatchCompleted) return FIRST_MATCH_PATHS.intro;
  return '/hub';
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const { response, userId, hasClub, firstMatchCompleted, configured } =
    await updateSession(request);

  const isPublic = pathname === '/' || startsWithAny(pathname, PUBLIC_PREFIXES);
  const isProtected = startsWithAny(pathname, PROTECTED_PREFIXES);
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isOnboarding = pathname === '/welcome' || pathname.startsWith('/onboarding');
  const onFirstMatchTunnel = isFirstMatchTunnelPath(pathname);

  // Landing: session → skip marketing
  if (pathname === '/' && userId) {
    const url = request.nextUrl.clone();
    url.pathname = postAuthPath(hasClub, firstMatchCompleted);
    return NextResponse.redirect(url);
  }

  // Auth pages: already signed in → continue journey
  if (isAuthPage && userId) {
    const url = request.nextUrl.clone();
    const next = searchParams.get('next');
    if (hasClub && firstMatchCompleted && isSafeNext(next)) {
      url.pathname = next;
      url.search = '';
      return NextResponse.redirect(url);
    }
    url.pathname = postAuthPath(hasClub, firstMatchCompleted);
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (isProtected && !userId) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    if (!configured) {
      url.searchParams.set('error', 'supabase_unconfigured');
    }
    return NextResponse.redirect(url);
  }

  // Authenticated without club cannot enter game shell (Hub etc.)
  if (userId && !hasClub && isProtected && !isOnboarding) {
    const url = request.nextUrl.clone();
    url.pathname = '/welcome';
    return NextResponse.redirect(url);
  }

  // First Match tunnel: has club, incomplete → only tunnel paths
  if (userId && hasClub && !firstMatchCompleted) {
    if (isProtected && !onFirstMatchTunnel) {
      const url = request.nextUrl.clone();
      url.pathname = FIRST_MATCH_PATHS.intro;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  // Completed first match: leave intro / club wizard / welcome → Hub
  // Keep /onboarding/welcome-lf reachable once (post-match beat).
  if (userId && hasClub && firstMatchCompleted) {
    if (
      pathname === FIRST_MATCH_PATHS.intro ||
      pathname === '/welcome' ||
      pathname === '/onboarding/club'
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/hub';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  void isPublic;

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
