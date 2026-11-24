import { NextResponse } from 'next/server';

import { parseManagerLog } from '@/lib/match/manager-commands';
import { saveMatchProgress } from '@/lib/match/kickoff-store';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BODY = 70_000;

const answer = (status: number) =>
  new NextResponse(null, { status, headers: { 'Cache-Control': 'no-store' } });

/** How far the manager's own match is, so it can be resumed but not started again (D150). */
export async function POST(request: Request): Promise<NextResponse> {
  const text = await request.text();
  if (text.length > MAX_BODY) return answer(413);
  let body: { fixtureId?: unknown; tick?: unknown; log?: unknown };
  try {
    body = JSON.parse(text) as typeof body;
  } catch {
    return answer(400);
  }
  const log = parseManagerLog(JSON.stringify(body?.log ?? null));
  if (
    typeof body?.fixtureId !== 'string' ||
    !UUID.test(body.fixtureId) ||
    typeof body.tick !== 'number' ||
    !Number.isInteger(body.tick) ||
    body.tick < 0 ||
    body.tick > 20_000 ||
    !Array.isArray(body.log) ||
    !log
  ) {
    return answer(400);
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return answer(401);
  const { data: club } = await supabase
    .from('clubs')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();
  const clubId = (club as { id: string } | null)?.id;
  if (!clubId) return answer(404);
  return answer((await saveMatchProgress(clubId, body.fixtureId, body.tick, log)) ? 204 : 409);
}
