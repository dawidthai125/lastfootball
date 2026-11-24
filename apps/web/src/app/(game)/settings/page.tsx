import { redirect } from 'next/navigation';

import { DeleteAccountForm } from '@/components/account/DeleteAccountForm';
import { CredentialForms } from '@/components/account/CredentialForms';
import { getAuthUser } from '@/lib/auth/session';
import { EmailConfirmSlot } from '@/components/auth/EmailConfirmSlot';
import { SignOutForm } from '@/components/auth/SignOutForm';
import { NotificationSettingsPanel } from '@/components/notifications/NotificationSettingsPanel';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { loadEmailGate } from '@/lib/auth/email-confirm';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { loadNotificationSettings } from '@/lib/notifications/settings';

/** Account settings. Replaces the settings placeholder. */
export default async function SettingsPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const email = (await getAuthUser())?.email ?? null;
  const [gate, notifications] = await Promise.all([
    loadEmailGate(club.ownerId),
    loadNotificationSettings(club.ownerId),
  ]);

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
        {email ? <CredentialForms email={email} /> : null}
        <div style={{ height: 'var(--lf-space-3)' }} />
        <SignOutForm>
          <Button type="submit" variant="danger">
            Wyloguj
          </Button>
        </SignOutForm>
      </Panel>
      <Panel title="Powiadomienia" className="mt-3">
        {notifications ? (
          <NotificationSettingsPanel settings={notifications} />
        ) : (
          <p style={{ margin: 0 }}>Powiadomienia są teraz niedostępne.</p>
        )}
      </Panel>
      <Panel title="Komentator" className="mt-3">
        <p style={{ margin: 0 }}>
          Głos jest z przeglądarki, język pl-PL. Czyta tylko nowe zdania po włączeniu. Starych zdań
          i podań nie czyta.
        </p>
      </Panel>
      <Panel title="Usunięcie konta" className="mt-3">
        <DeleteAccountForm clubName={club.name} />
      </Panel>
    </div>
  );
}
