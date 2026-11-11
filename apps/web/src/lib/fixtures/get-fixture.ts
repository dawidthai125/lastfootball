import { createClient } from '@/lib/supabase/server';
import { env } from '@/config/env';
import { mapFixtureRow } from '@/lib/fixtures/map-fixture';
import type { FixtureDto, FixtureRow } from '@/lib/fixtures/types';

async function withChallengeNames(clubId: string, fixtures: FixtureDto[]): Promise<FixtureDto[]> {
  if (!fixtures.some((fixture) => fixture.competition === 'challenge')) return fixtures;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rival_challenges')
    .select('fixture_id, rival_name, rival_short')
    .eq('challenger_club_id', clubId);
  if (error || !data) return fixtures;
  const rows = data as unknown as { fixture_id: string; rival_name: string; rival_short: string }[];
  const names = new Map(
    rows.map((row) => [row.fixture_id, { name: row.rival_name, shortName: row.rival_short }]),
  );
  return fixtures.map((fixture) => {
    const rival = names.get(fixture.id);
    if (!rival) return fixture;
    return {
      ...fixture,
      opponent: { id: fixture.opponentClubId, name: rival.name, shortName: rival.shortName },
    };
  });
}

const FIXTURE_SELECT =
  'id, club_id, matchday, competition, opponent_club_id, is_home, status, home_score, away_score, played_at, created_at';

export async function listClubFixtures(clubId: string): Promise<FixtureDto[]> {
  if (!env.isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('fixtures')
    .select(FIXTURE_SELECT)
    .eq('club_id', clubId)
    .order('matchday', { ascending: true });

  if (error || !data) return [];
  return withChallengeNames(clubId, (data as FixtureRow[]).map(mapFixtureRow));
}

export async function getFixtureByIdForClub(
  clubId: string,
  fixtureId: string,
): Promise<FixtureDto | null> {
  if (!env.isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('fixtures')
    .select(FIXTURE_SELECT)
    .eq('club_id', clubId)
    .eq('id', fixtureId)
    .maybeSingle();

  if (error || !data) return null;
  const [dto] = await withChallengeNames(clubId, [mapFixtureRow(data as FixtureRow)]);
  return dto ?? null;
}

/** Sole resolver for Hub / Primary CTA next match. */
export async function getNextFixture(clubId: string): Promise<FixtureDto | null> {
  if (!env.isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('fixtures')
    .select(FIXTURE_SELECT)
    .eq('club_id', clubId)
    .eq('competition', 'league')
    .eq('status', 'upcoming')
    .order('matchday', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapFixtureRow(data as FixtureRow);
}

export async function getLastPlayedFixture(clubId: string): Promise<FixtureDto | null> {
  if (!env.isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('fixtures')
    .select(FIXTURE_SELECT)
    .eq('club_id', clubId)
    .eq('competition', 'league')
    .eq('status', 'played')
    .order('matchday', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapFixtureRow(data as FixtureRow);
}
