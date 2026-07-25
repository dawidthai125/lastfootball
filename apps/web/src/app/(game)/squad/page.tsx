import { redirect } from 'next/navigation';

import { Panel } from '@/components/ui/Panel';
import { SquadView } from '@/components/squad/SquadView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { resolveClubSquad, SquadUnavailableError } from '@/lib/squad';
import { listClubPlayers } from '@/lib/squad/get-players';

export default async function SquadPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const rows = await listClubPlayers(club.id);
  try {
    const squad = resolveClubSquad(club, rows);
    return <SquadView players={squad.players} />;
  } catch (e) {
    if (e instanceof SquadUnavailableError) {
      return (
        <Panel title="Kadra niedostępna">
          <p style={{ margin: 0, color: 'var(--lf-color-text-muted)' }}>
            Nie znaleziono zawodników klubu w bazie. Odśwież stronę lub skontaktuj się z supportem —
            skład nie jest generowany ponownie w runtime.
          </p>
        </Panel>
      );
    }
    throw e;
  }
}
