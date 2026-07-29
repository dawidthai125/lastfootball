import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

import { MatchXiView } from '@/components/match/MatchXiView';
import { EmptyState, LocationHero } from '@/components/ui';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { getFixtureByIdForClub } from '@/lib/fixtures';
import { resolveClubSquad, SquadUnavailableError } from '@/lib/squad';
import { listClubPlayers } from '@/lib/squad/get-players';
import { matchPrePath } from '@/lib/match/match-path';

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * SCR-SQD-04 — Match XI editor (Match Path only).
 */
export default async function MatchXiPage({ params }: PageProps) {
  const { id } = await params;
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  if (id === FIRST_MATCH_ID) {
    if (isFirstMatchCompleted(club)) redirect('/hub');
  } else {
    const dto = await getFixtureByIdForClub(club.id, id);
    if (!dto) notFound();
    if (dto.status === 'played') redirect(matchPrePath(id));
  }

  const rows = await listClubPlayers(club.id);
  try {
    const squad = resolveClubSquad(club, rows);
    return <MatchXiView matchId={id} players={squad.players} />;
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
            body="Nie można ustawić XI — kadra jest niedostępna. Wróć do checklisty przedmeczowej."
            links={[{ href: matchPrePath(id), label: 'Checklist' }]}
          />
          <p style={{ marginTop: 'var(--lf-space-3)' }}>
            <Link href={matchPrePath(id)} style={{ color: 'var(--lf-color-text-gold)' }}>
              Wróć
            </Link>
          </p>
        </div>
      );
    }
    throw e;
  }
}
