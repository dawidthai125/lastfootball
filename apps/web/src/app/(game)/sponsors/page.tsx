import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { Badge } from '@/components/ui/Badge';
import { Panel } from '@/components/ui/Panel';
import { StatBlock } from '@/components/ui/StatBlock';

export default function SponsorsPage() {
  return (
    <PlaceholderPage title="Sponsorzy" subtitle="Umowy sponsorskie i bonusy">
      <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        <StatBlock label="Sponsor główny" value="NordTech" tone="gold" />
        <StatBlock label="Wpływ / sezon" value="210 000 €" tone="ok" />
        <StatBlock label="Bonusy aktywne" value="2" />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <Panel title="Umowa aktywna" action={<Badge tone="ok">Aktywna</Badge>}>
          <dl className="space-y-1 text-[12px]">
            <div className="flex justify-between">
              <dt className="text-[var(--lf-muted)]">Partner</dt>
              <dd>NordTech</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--lf-muted)]">Do</dt>
              <dd>koniec sezonu 1</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--lf-muted)]">Cel: miejsca 1–6</dt>
              <dd className="text-[var(--lf-ok)]">w toku</dd>
            </div>
          </dl>
        </Panel>
        <Panel title="Oferty">
          <p className="text-[12px] text-[var(--lf-muted)]">
            Brak nowych ofert. Mechanika sponsorów — GDD §15.
          </p>
        </Panel>
      </div>
    </PlaceholderPage>
  );
}
