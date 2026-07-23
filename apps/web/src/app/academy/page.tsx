import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { Panel } from '@/components/ui/Panel';
import { StatBlock } from '@/components/ui/StatBlock';
import { Table } from '@/components/ui/Table';

const youth = [
  { id: '1', name: 'J. Kowalik', pos: 'PO', age: 17, pot: 78 },
  { id: '2', name: 'M. Sowa', pos: 'OB', age: 16, pot: 71 },
  { id: '3', name: 'R. Biały', pos: 'N', age: 18, pot: 74 },
];

export default function AcademyPage() {
  return (
    <PlaceholderPage title="Akademia" subtitle="Młodzież i rozwój talentów">
      <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <StatBlock label="Poziom akademii" value="2" tone="gold" />
        <StatBlock label="Zawodnicy U19" value="14" />
        <StatBlock label="Promocje (sezon)" value="1" />
        <StatBlock label="Budżet roczny" value="85 000 €" />
      </div>
      <Panel title="Perspektywy" flush>
        <Table
          rowKey={(r) => r.id}
          rows={youth}
          columns={[
            { key: 'name', header: 'Zawodnik', render: (r) => r.name },
            { key: 'pos', header: 'Poz.', render: (r) => r.pos },
            {
              key: 'age',
              header: 'Wiek',
              align: 'right',
              render: (r) => <span className="tabular-nums">{r.age}</span>,
            },
            {
              key: 'pot',
              header: 'Potencjał',
              align: 'right',
              render: (r) => <span className="text-[var(--lf-gold)] tabular-nums">{r.pot}</span>,
            },
          ]}
        />
      </Panel>
    </PlaceholderPage>
  );
}
