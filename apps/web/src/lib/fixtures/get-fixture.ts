import { createClient } from '@/lib/supabase/server';
import { env } from '@/config/env';
import { mapFixtureRow } from '@/lib/fixtures/map-fixture';
import { humanRoundFromFixture } from '@/lib/league/human-league';
import type { FixtureDto, FixtureRow } from '@/lib/fixtures/types';
import { clampStyle } from '@/lib/training/style';

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

async function withHumanNames(clubId: string, fixtures: FixtureDto[]): Promise<FixtureDto[]> {
  if (!fixtures.some((fixture) => fixture.competition === 'human')) return fixtures;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('human_broadcasts')
    .select('matchday, home_id, away_id, home_name, away_name, home_short, away_short, seed')
    .or(`home_id.eq.${clubId},away_id.eq.${clubId}`);
  if (error || !data) return fixtures;
  const rows = data as {
    matchday: number;
    home_id: string;
    away_id: string;
    home_name: string;
    away_name: string;
    home_short: string;
    away_short: string;
    seed: string;
  }[];
  return fixtures.map((fixture) => {
    if (fixture.competition !== 'human') return fixture;
    const round = humanRoundFromFixture(fixture.matchday);
    const row = rows.find((item) => item.matchday === round);
    if (!row) return fixture;
    const home = row.home_id === clubId;
    return {
      ...fixture,
      sharedSeed: Number(row.seed),
      opponent: {
        id: fixture.opponentClubId,
        name: home ? row.away_name : row.home_name,
        shortName: home ? row.away_short : row.home_short,
      },
    };
  });
}

const FIXTURE_SELECT =
  'id, club_id, matchday, competition, opponent_club_id, is_home, status, home_score, away_score, played_at, created_at';

const CLUB_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function homeClubId(viewerClubId: string, fixture: FixtureDto): string | null {
  const id = fixture.isHome ? viewerClubId : fixture.opponentClubId;
  return CLUB_UUID.test(id) ? id : null;
}

/** Home pitch and stands for the match ground. A missing column leaves fixtures unchanged. */
async function attachHomeGround(
  viewerClubId: string,
  fixtures: FixtureDto[],
): Promise<FixtureDto[]> {
  const ids = [
    ...new Set(
      fixtures
        .map((fixture) => homeClubId(viewerClubId, fixture))
        .filter((id): id is string => id != null),
    ),
  ];
  if (ids.length === 0) return fixtures;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clubs')
    .select('id, pitch_level, stands_level')
    .in('id', ids);
  if (error || !data) return fixtures;
  const levels = new Map(
    (data as { id: string; pitch_level: number; stands_level: number }[]).map((row) => [
      row.id,
      {
        pitch: Math.max(0, Math.min(3, Math.trunc(row.pitch_level ?? 0))),
        stands: Math.max(0, Math.min(3, Math.trunc(row.stands_level ?? 0))),
      },
    ]),
  );
  return fixtures.map((fixture) => {
    const id = homeClubId(viewerClubId, fixture);
    const ground = id ? levels.get(id) : undefined;
    if (!ground) return fixture;
    return { ...fixture, homePitchLevel: ground.pitch, homeStandsLevel: ground.stands };
  });
}

/** Pressing habit. A missing column leaves the fixture unchanged. */
async function attachClubStyle(
  viewerClubId: string,
  fixtures: FixtureDto[],
): Promise<FixtureDto[]> {
  const ids = [
    ...new Set(
      [
        ...fixtures.map((fixture) => homeClubId(viewerClubId, fixture)),
        CLUB_UUID.test(viewerClubId) ? viewerClubId : null,
      ].filter((id): id is string => id != null),
    ),
  ];
  if (ids.length === 0) return fixtures;
  const supabase = await createClient();
  const { data, error } = await supabase.from('clubs').select('id, style_pressing').in('id', ids);
  if (error || !data) return fixtures;
  const points = new Map(
    (data as { id: string; style_pressing: number }[]).map((row) => [
      row.id,
      clampStyle(row.style_pressing ?? 0),
    ]),
  );
  return fixtures.map((fixture) => {
    const homeId = homeClubId(viewerClubId, fixture);
    return {
      ...fixture,
      homeStylePressing: homeId ? (points.get(homeId) ?? 0) : 0,
      viewerStylePressing: points.get(viewerClubId) ?? 0,
    };
  });
}

async function withGround(viewerClubId: string, fixtures: FixtureDto[]): Promise<FixtureDto[]> {
  return attachClubStyle(viewerClubId, await attachHomeGround(viewerClubId, fixtures));
}

export async function listClubFixtures(clubId: string): Promise<FixtureDto[]> {
  if (!env.isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('fixtures')
    .select(FIXTURE_SELECT)
    .eq('club_id', clubId)
    .order('matchday', { ascending: true });

  if (error || !data) return [];
  return withGround(
    clubId,
    await withHumanNames(
      clubId,
      await withChallengeNames(clubId, (data as FixtureRow[]).map(mapFixtureRow)),
    ),
  );
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
  const [dto] = await withGround(
    clubId,
    await withHumanNames(
      clubId,
      await withChallengeNames(clubId, [mapFixtureRow(data as FixtureRow)]),
    ),
  );
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
  const [dto] = await withGround(clubId, [mapFixtureRow(data as FixtureRow)]);
  return dto ?? null;
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
  const [dto] = await withGround(clubId, [mapFixtureRow(data as FixtureRow)]);
  return dto ?? null;
}
