import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

/**
 * Refresh Supabase session cookies and return user (if any).
 * Must call getUser() so expired tokens are refreshed into the response.
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  userId: string | null;
  hasClub: boolean;
  configured: boolean;
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configured = Boolean(url && anonKey);

  let response = NextResponse.next({ request });

  if (!configured || !url || !anonKey) {
    return { response, userId: null, hasClub: false, configured: false };
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasClub = false;
  if (user) {
    const { data, error } = await supabase
      .from('clubs')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();
    const clubRow = data as { id: string } | null;
    const fromTable = !error && Boolean(clubRow?.id);

    // Dev-only metadata fallback — production routing uses clubs table only.
    const metaFallback =
      process.env.NODE_ENV === 'development' &&
      process.env.LFE_DEV_CLUB_META_FALLBACK === '1' &&
      user.user_metadata?.has_club === true;

    hasClub = fromTable || metaFallback;
  }

  return { response, userId: user?.id ?? null, hasClub, configured: true };
}
