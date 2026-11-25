import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

import { OpenMatchNotice } from '@/components/match/OpenMatchNotice';
import { openMatchOf } from '@/lib/match/kickoff-store';
import { EmergencyJuniorOffer } from '@/components/squad/EmergencyJuniorOffer';
import { KickoffBlocked } from '@/components/match/KickoffBlocked';
import { PreMatchView } from '@/components/match/PreMatchView';
import { Panel } from '@/components/ui/Panel';
import { readClubBuild } from '@/lib/club/read-build';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { createClient } from '@/lib/supabase/server';
import { buildFirstPreMatchBundle } from '@/lib/first-match/bundles';
import { FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { lastMoodFixture, resolvePlayedFixtureFanLine } from '@/lib/club/fans';
import { buildLeaguePreMatchBundle, getFixtureByIdForClub, listClubFixtures } from '@/lib/fixtures';
import { parseOurFormation } from '@/lib/match/our-formation';
import { lineupEditorHref } from '@/lib/match/xi-block-path';
import { loadClubStartingXi, SquadUnavailableError } from '@/lib/squad/load-starting-xi';
import { upcomingKickoffSentence } from '@/lib/match/upcoming-kickoff-block';
import { prepareHumanLive } from '@/lib/league/human-league-store';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ shape?: string | string[] }>;
};

function SquadError({ matchId, detail }: { matchId: string; detail?: string }) {
  return (
    <Panel title="Kadra niedostępna">
      <p style={{ margin: 0, color: 'var(--lf-color-text-muted)' }}>
        {detail ?? 'Nie można przygotować meczu — brak składu w bazie.'}{' '}
        <Link href={lineupEditorHref(matchId)} style={{ color: 'var(--lf-color-text-gold)' }}>
          Popraw skład
        </Link>
        . Wróć do{' '}
        <Link href="/squad" style={{ color: 'var(--lf-color-text-gold)' }}>
          kadry
        </Link>{' '}
        lub popraw XI przed meczem.
      </p>
      <EmergencyJuniorOffer />
    </Panel>
  );
}

export default async function PreMatchPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const shape = parseOurFormation((await searchParams).shape);

  if (id === FIRST_MATCH_ID) {
    const club = await getManagerClub();
    if (!club) redirect('/welcome');
    if (isFirstMatchCompleted(club)) redirect('/hub');
    try {
      const ourXi = await loadClubStartingXi(club);
      const supabase = await createClient();
      const build = await readClubBuild(supabase, club.id);
      return (
        <PreMatchView bundle={buildFirstPreMatchBundle(club, ourXi, build.levels)} firstMatch />
      );
    } catch (e) {
      if (e instanceof SquadUnavailableError) return <SquadError matchId={id} detail={e.message} />;
      throw e;
    }
  }

  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const dto = await getFixtureByIdForClub(club.id, id);
  if (!dto) notFound();

  if (dto.status === 'played') {
    const supabase = await createClient();
    const [clubFixtures, moodRow] = await Promise.all([
      listClubFixtures(club.id),
      supabase.from('clubs').select('fan_mood').eq('id', club.id).maybeSingle(),
    ]);
    const storedMood =
      moodRow.error || !moodRow.data
        ? null
        : typeof (moodRow.data as { fan_mood?: number }).fan_mood === 'number'
          ? (moodRow.data as { fan_mood: number }).fan_mood
          : null;
    const fanLine = resolvePlayedFixtureFanLine({
      fixtureId: dto.id,
      latestPlayedId: lastMoodFixture(clubFixtures)?.id ?? null,
      homeScore: dto.homeScore,
      awayScore: dto.awayScore,
      isHome: dto.isHome,
      storedMood,
    });
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-3)' }}>
        <h1
          className="font-[family-name:var(--font-ui)] font-semibold"
          style={{
            margin: 0,
            fontSize: 'var(--lf-type-h1)',
            color: 'var(--lf-color-text-primary)',
          }}
        >
          Mecz zakończony
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--lf-type-body)',
            color: 'var(--lf-color-text-muted)',
          }}
        >
          {dto.isHome ? club.name : dto.opponent.name}{' '}
          {dto.homeScore != null && dto.awayScore != null
            ? `${dto.homeScore}:${dto.awayScore}`
            : '—'}{' '}
          {dto.isHome ? dto.opponent.name : club.name}
        </p>
        {fanLine ? (
          <p
            style={{
              margin: 0,
              fontSize: 'var(--lf-type-body)',
              color: 'var(--lf-color-text-primary)',
            }}
            aria-label="Nastrój kibiców"
          >
            {fanLine}
          </p>
        ) : null}
        {dto.matchNote ? (
          <p
            style={{
              margin: 0,
              fontSize: 'var(--lf-type-body)',
              color: 'var(--lf-color-text-primary)',
            }}
          >
            {dto.matchNote}
          </p>
        ) : null}
        <Link
          href="/hub"
          style={{ color: 'var(--lf-color-text-gold)', fontSize: 'var(--lf-type-caption)' }}
        >
          ← Hub
        </Link>
      </div>
    );
  }

  if (dto.status !== 'upcoming') {
    redirect('/hub');
  }

  const blocked = await upcomingKickoffSentence(id);
  if (blocked) return <KickoffBlocked sentence={blocked} />;

  if (dto.competition !== 'human') {
    const open = await openMatchOf(club.id);
    if (open) return <OpenMatchNotice fixtureId={open} other={open !== dto.id} />;
  }

  try {
    const human = dto.competition === 'human' ? await prepareHumanLive(club, dto) : null;
    if (human?.block) return <KickoffBlocked sentence={human.block} />;
    const ourXi = human ? human.ourXi : await loadClubStartingXi(club);
    return (
      <PreMatchView
        bundle={buildLeaguePreMatchBundle(
          club,
          human?.fixture ?? dto,
          ourXi,
          human ? '4-4-2' : shape,
          human?.theirXi,
        )}
      />
    );
  } catch (e) {
    if (e instanceof SquadUnavailableError) return <SquadError matchId={id} detail={e.message} />;
    throw e;
  }
}
