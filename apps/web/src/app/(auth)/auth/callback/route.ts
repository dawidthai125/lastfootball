import { NextResponse } from 'next/server';

import { getPostAuthPath, sanitizeNextPath } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

/**
 * Supabase Auth code exchange (SSR cookies).
 * Configured redirect: /auth/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const next = sanitizeNextPath(nextParam, '/hub');
      if (next === '/reset-password' || next.startsWith('/reset-password?')) {
        return NextResponse.redirect(new URL('/reset-password', origin));
      }
      const fallback = await getPostAuthPath(data.user.id);
      const safeNext = sanitizeNextPath(nextParam, fallback);
      if (safeNext.startsWith('/auth/email-confirmed')) {
        return NextResponse.redirect(new URL(safeNext, origin));
      }
      const destination =
        fallback === '/welcome' || fallback === '/onboarding/first-match' ? fallback : safeNext;
      return NextResponse.redirect(new URL(destination, origin));
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback', origin));
}
