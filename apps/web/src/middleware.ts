import { NextResponse, type NextRequest } from 'next/server';

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

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const { response, userId, hasClub, configured } = await updateSession(request);

  const isPublic = pathname === '/' || startsWithAny(pathname, PUBLIC_PREFIXES);
  const isProtected = startsWithAny(pathname, PROTECTED_PREFIXES);
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isOnboarding = pathname === '/welcome' || pathname.startsWith('/onboarding');

  // Landing: session → skip marketing (PLAN §4.1.5)
  if (pathname === '/' && userId) {
    const url = request.nextUrl.clone();
    url.pathname = hasClub ? '/hub' : '/welcome';
    return NextResponse.redirect(url);
  }

  // Auth pages: already signed in → continue journey
  if (isAuthPage && userId) {
    const url = request.nextUrl.clone();
    url.pathname = hasClub ? '/hub' : '/welcome';
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

  // Has club + still on onboarding → Hub
  if (userId && hasClub && isOnboarding) {
    const url = request.nextUrl.clone();
    url.pathname = '/hub';
    return NextResponse.redirect(url);
  }

  // Honour safe ?next= only when already allowed (post-login handled in actions)
  const next = searchParams.get('next');
  if (userId && hasClub && isAuthPage && isSafeNext(next)) {
    const url = request.nextUrl.clone();
    url.pathname = next;
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Avoid unused warning — public paths fall through
  void isPublic;

  return response;
}

export const config = {
  matcher: [
    /*
     * Skip static assets and Next internals.
     */
    '/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
