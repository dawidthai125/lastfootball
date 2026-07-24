import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatBlock } from '@/components/ui/StatBlock';

export default function StadiumPage() {
  return (
    <PlaceholderPage title="Stadion" subtitle="Pojemność, komfort i przychody z biletów">
      <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <StatBlock label="Pojemność" value="8 400" />
        <StatBlock label="Frekwencja śr." value="72%" tone="ok" />
        <StatBlock label="Poziom" value="2" tone="gold" />
        <StatBlock label="Bilety / mecz" value="42 500 €" />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <Panel title="Ulepszenia">
          <div className="space-y-2">
            <ProgressBar label="Trybuny" value={2} max={5} tone="gold" />
            <ProgressBar label="Oświetlenie" value={1} max={5} tone="info" />
            <ProgressBar label="Zaplecze" value={2} max={5} tone="ok" />
          </div>
        </Panel>
        <Panel title="Następna inwestycja">
          <p className="text-[12px] text-[var(--lf-muted)]">
            Rozbudowa sektora gości — koszt szacunkowy 450 000 €. Mechanika wg GDD §13.
          </p>
        </Panel>
      </div>
    </PlaceholderPage>
  );
}
