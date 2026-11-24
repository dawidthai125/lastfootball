import { notFound, redirect } from 'next/navigation';

import { KickoffBlocked } from '@/components/match/KickoffBlocked';
import { LiveMatchFoundation } from '@/components/match/LiveMatchFoundation';
import { LiveMatchShell } from '@/components/match/LiveMatchShell';
import { EmptyState, LocationHero } from '@/components/ui';
import { readClubBuild } from '@/lib/club/read-build';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { createClient } from '@/lib/supabase/server';
import { buildFirstLiveBundle } from '@/lib/first-match/bundles';
import { FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { buildLeagueLiveBundle, getFixtureByIdForClub } from '@/lib/fixtures';
import { matchPrePath } from '@/lib/match/match-path';
import { lineupEditorHref } from '@/lib/match/xi-block-path';
import { parseOurFormation } from '@/lib/match/our-formation';
import { previewMatchDevelopment } from '@/lib/squad/apply-match-development';
import { listClubPlayers } from '@/lib/squad/get-players';
import { loadRivalSquad } from '@/lib/rivals/squad';
import { resolveMatchBench, resolveStartingXi, SquadUnavailableError } from '@/lib/squad';
import { prepareHumanLive } from '@/lib/league/human-league-store';
import { resolveOpponentXi } from '@/lib/fixtures/create-session';
import { storeKickoff } from '@/lib/match/kickoff-store';
import { lineupProblem } from '@/lib/squad/lineup-problem';
import { upcomingKickoffSentence } from '@/lib/match/upcoming-kickoff-block';
import { UI_COPY } from '@/lib/ui/copy';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ shape?: string | string[] }>;
};

function SquadError({ matchId, detail }: { matchId: string; detail?: string }) {
  return (
    <div data-lf-impl="LFE-UI-IMPL-06" data-mch="SCR-MCH-04">
      <LocationHero waId="HERO-003" src="/assets/world-art/hero-003-pitch-night.png" priority />
      <EmptyState
        waId="EMP-002"
        illustrationSrc="/assets/world-art/emp-002-empty-locker.png"
        title="Kadra niedostępna"
        body={detail ?? 'Nie można rozpocząć meczu — brak składu. Wróć do przedmeczu i ustaw XI.'}
        links={[
          { href: lineupEditorHref(matchId), label: 'Popraw skład' },
          { href: matchPrePath(matchId), label: UI_COPY.backToPrematch },
          { href: '/squad', label: UI_COPY.squadNav },
        ]}
      />
    </div>
  );
}

export default async function LiveMatchPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sentence = await upcomingKickoffSentence(id);
  if (sentence) return <KickoffBlocked sentence={sentence} />;
  const ourFormation = parseOurFormation((await searchParams).shape);

  if (id === FIRST_MATCH_ID) {
    const club = await getManagerClub();
    if (!club) redirect('/welcome');
    if (isFirstMatchCompleted(club)) redirect('/hub');
    try {
      const players = await listClubPlayers(club.id);
      const ourXi = resolveStartingXi(players);
      const ourBench = resolveMatchBench(players);
      const developmentNames = previewMatchDevelopment(players).skillUpNames;
      const supabase = await createClient();
      const build = await readClubBuild(supabase, club.id);
      const moodRow = await supabase
        .from('clubs')
        .select('fan_mood')
        .eq('id', club.id)
        .maybeSingle();
      const fanMoodBefore =
        moodRow.error || !moodRow.data
          ? 60
          : typeof (moodRow.data as { fan_mood?: number }).fan_mood === 'number'
            ? (moodRow.data as { fan_mood: number }).fan_mood
            : 60;
      return (
        <LiveMatchFoundation
          bundle={buildFirstLiveBundle(club, build.levels)}
          club={club}
          firstMatch
          ourXi={ourXi}
          ourBench={ourBench}
          developmentNames={developmentNames}
          fanMoodBefore={fanMoodBefore}
        />
      );
    } catch (e) {
      if (e instanceof SquadUnavailableError) {
        return <SquadError matchId={id} detail={e.message} />;
      }
      throw e;
    }
  }

  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const dto = await getFixtureByIdForClub(club.id, id);
  if (!dto) notFound();
  if (dto.status === 'played') {
    return <LiveMatchShell playedHref={`/match/${id}`}>{null}</LiveMatchShell>;
  }
  if (dto.status !== 'upcoming') redirect('/hub');

  try {
    const players = await listClubPlayers(club.id);
    const human = dto.competition === 'human' ? await prepareHumanLive(club, dto) : null;
    if (human?.block) {
      return <SquadError matchId={id} detail={human.block} />;
    }
    const problem = human ? null : lineupProblem(club.id, players);
    if (problem) return <SquadError matchId={id} detail={problem} />;
    const ourXi = human ? human.ourXi : resolveStartingXi(players);
    const ourBench = human ? [] : resolveMatchBench(players);
    const developmentNames = previewMatchDevelopment(players).skillUpNames;
    const rival = dto.competition === 'challenge' ? await loadRivalSquad(dto.opponentClubId) : null;
    if (dto.competition === 'challenge' && !rival) {
      return <SquadError matchId={id} detail="Rywal nie ma pełnej jedenastki." />;
    }
    const supabase = await createClient();
    const moodRow = await supabase.from('clubs').select('fan_mood').eq('id', club.id).maybeSingle();
    const fanMoodBefore =
      moodRow.error || !moodRow.data
        ? 60
        : typeof (moodRow.data as { fan_mood?: number }).fan_mood === 'number'
          ? (moodRow.data as { fan_mood: number }).fan_mood
          : 60;
    if (!human) {
      await storeKickoff({
        club,
        fixture: dto,
        ourXi,
        ourBench,
        formation: ourFormation,
        theirXi: rival?.xi ?? resolveOpponentXi(club, dto),
      });
    }
    return (
      <LiveMatchShell playedHref={`/match/${id}`}>
        <LiveMatchFoundation
          bundle={buildLeagueLiveBundle(club, human?.fixture ?? dto)}
          club={club}
          leagueFixture={human?.fixture ?? dto}
          ourXi={ourXi}
          ourBench={ourBench}
          ourFormation={ourFormation}
          theirXi={human?.theirXi ?? rival?.xi ?? null}
          developmentNames={developmentNames}
          fanMoodBefore={fanMoodBefore}
        />
      </LiveMatchShell>
    );
  } catch (e) {
    if (e instanceof SquadUnavailableError) {
      return <SquadError matchId={id} detail={e.message} />;
    }
    throw e;
  }
}
