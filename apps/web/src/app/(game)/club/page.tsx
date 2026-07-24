import { redirect } from 'next/navigation';

import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { Panel } from '@/components/ui/Panel';
import { StatBlock } from '@/components/ui/StatBlock';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { STARTER_PACKAGE } from '@/lib/club/types';

/** Club identity page — Club DTO + starter package (no mid-season mock). */
export default async function ClubPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  return (
    <PlaceholderPage title="Klub" subtitle={`${club.name} · tożsamość i struktura startowa`}>
      <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <StatBlock label="Nazwa" value={club.name} tone="gold" />
        <StatBlock label="Skrót" value={club.shortName} />
        <StatBlock label="Liga" value={STARTER_PACKAGE.league} />
        <StatBlock label="Stadion" value={STARTER_PACKAGE.stadiumLabel(club.name)} />
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <Panel title="Personel">
          <ul className="space-y-1 text-[12px]">
            <li className="flex justify-between border-b border-[var(--lf-border)]/50 py-1">
              <span>Trener</span>
              <span className="text-[var(--lf-muted)]">{STARTER_PACKAGE.coach}</span>
            </li>
            <li className="flex justify-between border-b border-[var(--lf-border)]/50 py-1">
              <span>Asystent</span>
              <span className="text-[var(--lf-muted)]">— odblokuje się wkrótce</span>
            </li>
            <li className="flex justify-between py-1">
              <span>Skaut</span>
              <span className="text-[var(--lf-muted)]">— odblokuje się wkrótce</span>
            </li>
          </ul>
        </Panel>
        <Panel title="Infrastruktura">
          <p className="text-[12px] text-[var(--lf-muted)]">
            {STARTER_PACKAGE.stadiumLabel(club.name)} · {STARTER_PACKAGE.stadiumCapacity}. Głębsze
            obiekty — wkrótce.
          </p>
        </Panel>
        <Panel title="Tożsamość">
          <p className="text-[12px] text-[var(--lf-muted)]">
            Herb i barwy pochodzą z kreacji klubu. Historia klubu — w przygotowaniu.
          </p>
        </Panel>
      </div>
    </PlaceholderPage>
  );
}
