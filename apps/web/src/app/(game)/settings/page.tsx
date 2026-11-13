import { redirect } from 'next/navigation';

import { EmailConfirmSlot } from '@/components/auth/EmailConfirmSlot';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { signOut } from '@/lib/auth/actions';
import { loadEmailGate } from '@/lib/auth/email-confirm';
import { getManagerClub } from '@/lib/club/get-manager-club';

/** Account settings. Replaces the settings placeholder. */
export default async function SettingsPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const gate = await loadEmailGate(club.ownerId);

  return (
    <div>
      <SectionHeader title="Ustawienia" subtitle="Konto i mecz" />
      <Panel title="Konto">
        {gate.confirmed ? (
          <p style={{ margin: '0 0 var(--lf-space-2)' }}>
            Email jest potwierdzony. Premia 10 000 EUR jest jednorazowa.
          </p>
        ) : (
          <EmailConfirmSlot userId={club.ownerId} variant="game" />
        )}
        <form action={signOut}>
          <Button type="submit" variant="danger">
            Wyloguj
          </Button>
        </form>
      </Panel>
      <Panel title="Komentator" className="mt-3">
        <p style={{ margin: 0 }}>
          Głos jest z przeglądarki, język pl-PL. Czyta tylko nowe zdania po włączeniu. Starych zdań
          i podań nie czyta.
        </p>
      </Panel>
    </div>
  );
}
