'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { env } from '@/config/env';
import { loadEmailGate } from '@/lib/auth/email-confirm';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { openChallenge } from '@/lib/rivals/open-challenge';
import { createAdminClient } from '@/lib/supabase/admin';
import { readPages } from '@/lib/supabase/read-pages';
import { createClient } from '@/lib/supabase/server';

export type RivalClub = {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
};

export type RivalChallengeView = {
  readonly id: string;
  /** Null once the season of that match is closed. */
  readonly fixtureId: string | null;
  readonly rivalName: string;
  readonly rivalShort: string;
  readonly challengerName: string;
  readonly status: 'open' | 'played';
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly incoming: boolean;
};

export async function listRivalClubs(): Promise<RivalClub[]> {
  if (!env.isSupabaseConfigured) return [];
  const supabase = await createClient();
  const rows = await readPages<{ id: string; name: string; short_name: string }>((from, to) =>
    supabase
      .rpc('list_rival_clubs')
      .order('name' as never)
      .order('id' as never)
      .range(from, to),
  );
  return (rows ?? []).map((row) => ({ id: row.id, name: row.name, shortName: row.short_name }));
}

export async function listRivalChallenges(clubId: string): Promise<RivalChallengeView[]> {
  if (!env.isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rival_challenges')
    .select(
      'id, fixture_id, challenger_club_id, challenger_name, rival_name, rival_short, status, home_score, away_score',
    )
    .or(`challenger_club_id.eq.${clubId},rival_club_id.eq.${clubId}`)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  const rows = data as {
    id: string;
    fixture_id: string | null;
    challenger_club_id: string;
    challenger_name: string;
    rival_name: string;
    rival_short: string;
    status: string;
    home_score: number | null;
    away_score: number | null;
  }[];
  return rows.map((row) => ({
    id: row.id,
    fixtureId: row.fixture_id,
    rivalName: row.challenger_club_id === clubId ? row.rival_name : row.challenger_name,
    rivalShort: row.rival_short,
    challengerName: row.challenger_name,
    status: row.status === 'played' ? 'played' : 'open',
    homeScore: row.home_score,
    awayScore: row.away_score,
    incoming: row.challenger_club_id !== clubId,
  }));
}

export type RivalChallengeState = { readonly error?: string };

export async function createRivalChallenge(
  _prev: RivalChallengeState,
  formData: FormData,
): Promise<RivalChallengeState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const rivalId = String(formData.get('rivalId') ?? '');
  const club = await getManagerClub().catch(() => null);
  if (!club) return { error: 'Nie znaleziono klubu.' };
  if (!rivalId || rivalId === club.id) return { error: 'Nie wybrano rywala.' };

  const emailGate = await loadEmailGate(club.ownerId);
  if (emailGate.rivalsBlocked) return { error: 'Potwierdź email, żeby wyzwać klub.' };

  const supabase = await createClient();
  const rivals = await listRivalClubs();
  const rival = rivals.find((row) => row.id === rivalId);
  if (!rival) return { error: 'Nie znaleziono rywala.' };

  const { data: existing } = await supabase
    .from('rival_challenges')
    .select('fixture_id, status')
    .eq('challenger_club_id', club.id)
    .eq('rival_club_id', rival.id)
    .eq('status', 'open')
    .maybeSingle();
  const alreadyOpen = existing as { fixture_id: string } | null;
  if (alreadyOpen?.fixture_id) redirect(`/match/${alreadyOpen.fixture_id}`);

  const fixtureId = await openChallenge(createAdminClient(), club, rival);
  if (!fixtureId) return { error: 'Nie udało się utworzyć wyzwania.' };

  revalidatePath('/rivals');
  redirect(`/match/${fixtureId}`);
}
