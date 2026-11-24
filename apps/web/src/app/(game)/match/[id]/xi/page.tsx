import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

import { OpenMatchNotice } from '@/components/match/OpenMatchNotice';
import { openMatchOf } from '@/lib/match/kickoff-store';
import { KickoffBlocked } from '@/components/match/KickoffBlocked';
import { MatchXiView } from '@/components/match/MatchXiView';
import { EmptyState, LocationHero } from '@/components/ui';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { getFixtureByIdForClub } from '@/lib/fixtures';
import { resolveClubSquad, SquadUnavailableError } from '@/lib/squad';
import { listClubPlayers } from '@/lib/squad/get-players';
import { matchPrePath } from '@/lib/match/match-path';
import { parseOurFormation } from '@/lib/match/our-formation';
import { upcomingKickoffSentence } from '@/lib/match/upcoming-kickoff-block';
import { UI_COPY } from '@/lib/ui/copy';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ shape?: string | string[] }>;
};

/**
 * SCR-SQD-04 — Match XI editor (Match Path only).
 */
export default async function MatchXiPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const shape = parseOurFormation((await searchParams).shape);
  const sentence = await upcomingKickoffSentence(id);
  if (sentence) return <KickoffBlocked sentence={sentence} />;
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  if (id === FIRST_MATCH_ID) {
    if (isFirstMatchCompleted(club)) redirect('/hub');
  } else {
    const dto = await getFixtureByIdForClub(club.id, id);
    if (!dto) notFound();
    if (dto.status === 'played') redirect(matchPrePath(id));
    if (dto.competition !== 'human' && (await openMatchOf(club.id)) === dto.id) {
      return <OpenMatchNotice fixtureId={dto.id} />;
    }
  }

  const rows = await listClubPlayers(club.id);
  try {
    const squad = resolveClubSquad(club, rows);
    return <MatchXiView matchId={id} players={squad.players} shape={shape} />;
  } catch (e) {
    if (e instanceof SquadUnavailableError) {
      return (
        <div data-lf-impl="LFE-UI-IMPL-05">
          <LocationHero
            waId="HERO-004"
            src="/assets/world-art/hero-004-locker-night.png"
            priority
          />
          <EmptyState
            waId="EMP-002"
            illustrationSrc="/assets/world-art/emp-002-empty-locker.png"
            title="Brak kadry do składu"
            body="Nie można ustawić XI — kadra jest niedostępna. Wróć do przedmeczu."
            links={[{ href: matchPrePath(id), label: UI_COPY.backToPrematch }]}
          />
          <p style={{ marginTop: 'var(--lf-space-3)' }}>
            <Link href={matchPrePath(id)} style={{ color: 'var(--lf-color-text-gold)' }}>
              {UI_COPY.backToPrematch}
            </Link>
          </p>
        </div>
      );
    }
    throw e;
  }
}
