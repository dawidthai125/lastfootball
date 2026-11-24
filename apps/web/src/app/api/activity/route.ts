import { NextResponse } from 'next/server';

import { warsawDateKey } from '@/lib/fixtures/matchday-gate';
import { tryAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** One row per account and day. Nothing about the device or the page. */
export async function POST(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse(null, { status: 401 });
  const result = await tryAdminClient()
    ?.from('account_activity')
    .upsert({ user_id: user.id, day: warsawDateKey(new Date()) } as never, {
      onConflict: 'user_id,day',
      ignoreDuplicates: true,
    });
  return new NextResponse(null, { status: !result || result.error ? 503 : 204 });
}
