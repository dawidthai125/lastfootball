import { NextResponse, type NextRequest } from 'next/server';

import { INVITE_COOKIE, INVITE_COOKIE_DAYS, isInviteCode } from '@/lib/invites/code';

/** Remembers the invitation and goes on to the sign-up. The name is looked up there. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse> {
  const { code } = await params;
  const response = NextResponse.redirect(new URL('/register', request.nextUrl.origin));
  if (isInviteCode(code)) {
    response.cookies.set(INVITE_COOKIE, code, {
      httpOnly: true,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
      path: '/',
      maxAge: INVITE_COOKIE_DAYS * 86_400,
    });
  }
  return response;
}
