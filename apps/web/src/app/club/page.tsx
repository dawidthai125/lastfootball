import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { Panel } from '@/components/ui/Panel';
import { StatBlock } from '@/components/ui/StatBlock';
import { dashboardMock } from '@/data/mock';

export default function ClubPage() {
  const c = dashboardMock.club;

  return (
    <PlaceholderPage title="Klub" subtitle={`${c.name} · zarządzanie strukturą i personelem`}>
      <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <StatBlock label="Nazwa" value={c.name} tone="gold" />
        <StatBlock label="Liga" value={c.division} />
        <StatBlock label="Miejsce" value={`${c.place}.`} />
        <StatBlock label="Morale" value={`${c.morale}%`} tone="ok" />
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <Panel title="Personel">
          <ul className="space-y-1 text-[12px]">
            <li className="flex justify-between border-b border-[var(--lf-border)]/50 py-1">
              <span>Trener</span>
              <span className="text-[var(--lf-muted)]">— wolny slot</span>
            </li>
            <li className="flex justify-between border-b border-[var(--lf-border)]/50 py-1">
              <span>Asystent</span>
              <span className="text-[var(--lf-muted)]">— wolny slot</span>
            </li>
            <li className="flex justify-between py-1">
              <span>Skaut</span>
              <span className="text-[var(--lf-muted)]">— wolny slot</span>
            </li>
          </ul>
        </Panel>
        <Panel title="Infrastruktura">
          <p className="text-[12px] text-[var(--lf-muted)]">
            Stadion, akademia i obiekty treningowe — szczegóły w osobnych sekcjach.
          </p>
        </Panel>
        <Panel title="Tożsamość">
          <p className="text-[12px] text-[var(--lf-muted)]">
            Herb, barwy i historia klubu — w przygotowaniu (GDD §6).
          </p>
        </Panel>
      </div>
    </PlaceholderPage>
  );
}
