import { NextResponse } from 'next/server';

import { env } from '@/config/env';
import { isSchedulerRequest } from '@/lib/notifications/notify-token';
import { runNotifications } from '@/lib/notifications/run';
import { readNotifyToken } from '@/lib/notifications/server-secrets';
import { createNotifyDeps } from '@/lib/notifications/store';
import { tryAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const NO_STORE = { 'Cache-Control': 'no-store' };

/** Called by pg_cron every 30 minutes. Answers with counts only. */
export async function POST(request: Request): Promise<NextResponse> {
  const admin = tryAdminClient();
  const allowed = await isSchedulerRequest(
    request.headers.get('authorization'),
    env.cronSecret,
    () => readNotifyToken(admin),
  );
  if (!allowed) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: NO_STORE });
  }
  try {
    const deps = await createNotifyDeps(admin);
    if (!deps) return NextResponse.json({ available: false }, { headers: NO_STORE });
    const counts = await runNotifications(deps, new Date());
    return NextResponse.json({ available: true, ...counts }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500, headers: NO_STORE });
  }
}
