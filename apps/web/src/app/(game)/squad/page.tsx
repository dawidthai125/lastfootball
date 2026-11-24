import { redirect } from 'next/navigation';

import { EmptyState, LocationHero } from '@/components/ui';
import { EmergencyJunior } from '@/components/squad/EmergencyJunior';
import { SquadView } from '@/components/squad/SquadView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { emergencyNeed } from '@/lib/squad/emergency-junior';
import { resolveClubSquad, SquadUnavailableError } from '@/lib/squad';
import { listClubPlayers } from '@/lib/squad/get-players';

export default async function SquadPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const rows = await listClubPlayers(club.id);
  try {
    const squad = resolveClubSquad(club, rows);
    const need = emergencyNeed(squad.players, utcDateString());
    return (
      <>
        {need ? <EmergencyJunior need={need} /> : null}
        <SquadView players={squad.players} />
      </>
    );
  } catch (e) {
    if (e instanceof SquadUnavailableError) {
      return (
        <div data-lf-impl="LFE-UI-IMPL-03">
          <LocationHero
            waId="HERO-004"
            src="/assets/world-art/hero-004-locker-night.png"
            priority
          />
          <EmptyState
            waId="EMP-002"
            illustrationSrc="/assets/world-art/emp-002-empty-locker.png"
            title="Kadra niedostępna"
            body="Nie znaleziono zawodników klubu. Odśwież stronę albo wróć na Hub."
            links={[
              { href: '/hub', label: 'Hub' },
              { href: '/training', label: 'Trening' },
            ]}
          />
        </div>
      );
    }
    throw e;
  }
}
