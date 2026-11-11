'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { env } from '@/config/env';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { nextChallengeMatchday } from '@/lib/rivals/matchday';
import { createClient } from '@/lib/supabase/server';

export type RivalClub = {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
};

export type RivalChallengeView = {
  readonly id: string;
  readonly fixtureId: string;
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
  const { data, error } = await supabase.rpc('list_rival_clubs');
  if (error || !data) return [];
  const rows = data as { id: string; name: string; short_name: string }[];
  return rows.map((row) => ({ id: row.id, name: row.name, shortName: row.short_name }));
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
    fixture_id: string;
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

export async function createRivalChallenge(formData: FormData): Promise<void> {
  if (!env.isSupabaseConfigured) return;
  const rivalId = String(formData.get('rivalId') ?? '');
  const club = await getManagerClub();
  if (!club || !rivalId || rivalId === club.id) return;

  const supabase = await createClient();
  const rivals = await listRivalClubs();
  const rival = rivals.find((row) => row.id === rivalId);
  if (!rival) return;

  const { data: existing } = await supabase
    .from('rival_challenges')
    .select('fixture_id, status')
    .eq('challenger_club_id', club.id)
    .eq('rival_club_id', rival.id)
    .eq('status', 'open')
    .maybeSingle();
  const openChallenge = existing as { fixture_id: string } | null;
  if (openChallenge?.fixture_id) redirect(`/match/${openChallenge.fixture_id}`);

  const { data: days } = await supabase
    .from('fixtures')
    .select('matchday')
    .eq('club_id', club.id)
    .eq('competition', 'challenge');
  const matchday = nextChallengeMatchday(
    ((days ?? []) as { matchday: number }[]).map((row) => row.matchday),
  );

  const { data: fixture, error: fixtureErr } = await supabase
    .from('fixtures')
    .insert({
      club_id: club.id,
      matchday,
      competition: 'challenge',
      opponent_club_id: rival.id,
      is_home: true,
      status: 'upcoming',
    } as never)
    .select('id')
    .single();
  const created = fixture as { id: string } | null;
  if (fixtureErr || !created) return;

  const { error: challengeErr } = await supabase.from('rival_challenges').insert({
    fixture_id: created.id,
    challenger_club_id: club.id,
    challenger_name: club.name,
    challenger_short: club.shortName,
    rival_club_id: rival.id,
    rival_name: rival.name,
    rival_short: rival.shortName,
    status: 'open',
  } as never);
  if (challengeErr) return;

  revalidatePath('/rivals');
  redirect(`/match/${created.id}`);
}
