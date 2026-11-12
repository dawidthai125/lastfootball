import { notFound, redirect } from 'next/navigation';

import { LiveMatchFoundation } from '@/components/match/LiveMatchFoundation';
import { EmptyState, LocationHero } from '@/components/ui';
import { readClubBuild } from '@/lib/club/read-build';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { createClient } from '@/lib/supabase/server';
import { buildFirstLiveBundle } from '@/lib/first-match/bundles';
import { FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { buildLeagueLiveBundle, getFixtureByIdForClub } from '@/lib/fixtures';
import { matchPrePath } from '@/lib/match/match-path';
import { parseOurFormation } from '@/lib/match/our-formation';
import { previewMatchDevelopment } from '@/lib/squad/apply-match-development';
import { listClubPlayers } from '@/lib/squad/get-players';
import { loadRivalSquad } from '@/lib/rivals/squad';
import { resolveMatchBench, resolveStartingXi, SquadUnavailableError } from '@/lib/squad';
import { prepareHumanLive } from '@/lib/league/human-league-store';
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
          { href: matchPrePath(matchId), label: UI_COPY.backToPrematch },
          { href: '/squad', label: UI_COPY.squadNav },
        ]}
      />
    </div>
  );
}

export default async function LiveMatchPage({ params, searchParams }: PageProps) {
  const { id } = await params;
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
      return (
        <LiveMatchFoundation
          bundle={buildFirstLiveBundle(club, build.levels)}
          club={club}
          firstMatch
          ourXi={ourXi}
          ourBench={ourBench}
          developmentNames={developmentNames}
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
  if (dto.status === 'played') redirect('/hub');
  if (dto.status !== 'upcoming') redirect('/hub');

  try {
    const players = await listClubPlayers(club.id);
    const human = dto.competition === 'human' ? await prepareHumanLive(club, dto) : null;
    if (human?.block) {
      return <SquadError matchId={id} detail={human.block} />;
    }
    const ourXi = human ? human.ourXi : resolveStartingXi(players);
    const ourBench = human ? [] : resolveMatchBench(players);
    const developmentNames = previewMatchDevelopment(players).skillUpNames;
    const rival = dto.competition === 'challenge' ? await loadRivalSquad(dto.opponentClubId) : null;
    if (dto.competition === 'challenge' && !rival) {
      return <SquadError matchId={id} detail="Rywal nie ma pełnej jedenastki." />;
    }
    return (
      <LiveMatchFoundation
        bundle={buildLeagueLiveBundle(club, dto)}
        club={club}
        leagueFixture={human?.fixture ?? dto}
        ourXi={ourXi}
        ourBench={ourBench}
        ourFormation={ourFormation}
        theirXi={human?.theirXi ?? rival?.xi ?? null}
        developmentNames={developmentNames}
      />
    );
  } catch (e) {
    if (e instanceof SquadUnavailableError) {
      return <SquadError matchId={id} detail={e.message} />;
    }
    throw e;
  }
}
