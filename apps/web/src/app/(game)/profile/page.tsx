import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { loadEmailGate } from '@/lib/auth/email-confirm';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { createClient } from '@/lib/supabase/server';

/** Manager account. Replaces the profile placeholder. */
export default async function ProfilePage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const gate = await loadEmailGate(club.ownerId);

  return (
    <div>
      <SectionHeader title="Profil" subtitle="Konto menedżera" />
      <Panel title="Menedżer">
        <p style={{ margin: '0 0 var(--lf-space-2)' }}>Email: {user?.email ?? 'brak adresu'}</p>
        <p style={{ margin: '0 0 var(--lf-space-2)' }}>
          {gate.confirmed ? 'Email potwierdzony.' : 'Email czeka na potwierdzenie.'}
        </p>
        <p style={{ margin: '0 0 var(--lf-space-2)' }}>
          Klub: {club.name} ({club.shortName})
        </p>
        <p style={{ margin: 0 }}>
          <Link href="/club" style={{ color: 'var(--lf-color-text-gold)' }}>
            Karta klubu
          </Link>
        </p>
      </Panel>
    </div>
  );
}
