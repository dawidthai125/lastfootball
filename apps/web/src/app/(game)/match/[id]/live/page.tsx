import { notFound, redirect } from 'next/navigation';

import { LiveMatchFoundation } from '@/components/match/LiveMatchFoundation';
import { EmptyState, LocationHero } from '@/components/ui';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { buildFirstLiveBundle } from '@/lib/first-match/bundles';
import { FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { buildLeagueLiveBundle, getFixtureByIdForClub } from '@/lib/fixtures';
import { matchPrePath } from '@/lib/match/match-path';
import { loadClubStartingXi, SquadUnavailableError } from '@/lib/squad/load-starting-xi';
import { UI_COPY } from '@/lib/ui/copy';

type PageProps = {
  params: Promise<{ id: string }>;
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

export default async function LiveMatchPage({ params }: PageProps) {
  const { id } = await params;

  if (id === FIRST_MATCH_ID) {
    const club = await getManagerClub();
    if (!club) redirect('/welcome');
    if (isFirstMatchCompleted(club)) redirect('/hub');
    try {
      const ourXi = await loadClubStartingXi(club);
      return (
        <LiveMatchFoundation
          bundle={buildFirstLiveBundle(club)}
          club={club}
          firstMatch
          ourXi={ourXi}
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
    const ourXi = await loadClubStartingXi(club);
    return (
      <LiveMatchFoundation
        bundle={buildLeagueLiveBundle(club, dto)}
        club={club}
        leagueFixture={dto}
        ourXi={ourXi}
      />
    );
  } catch (e) {
    if (e instanceof SquadUnavailableError) {
      return <SquadError matchId={id} detail={e.message} />;
    }
    throw e;
  }
}
