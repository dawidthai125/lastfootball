import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { Panel } from '@/components/ui/Panel';
import { Table } from '@/components/ui/Table';

const ranks = [
  { pos: 1, club: 'Victoria Harbor', rating: 1840, self: false },
  { pos: 2, club: 'Atletyk Centrum', rating: 1792, self: false },
  { pos: 3, club: 'Orzeł Grodzisk', rating: 1710, self: false },
  { pos: 12, club: 'FC Lastovia', rating: 1428, self: true },
];

export default function RankingsPage() {
  return (
    <PlaceholderPage title="Rankingi" subtitle="Siła klubów i reputacja serwera">
      <Panel title="Ranking siły · EU-1" flush>
        <Table
          rowKey={(r) => String(r.pos)}
          rows={ranks}
          highlight={(r) => r.self}
          columns={[
            {
              key: 'pos',
              header: '#',
              render: (r) => <span className="tabular-nums text-[var(--lf-faint)]">{r.pos}</span>,
            },
            {
              key: 'club',
              header: 'Klub',
              render: (r) => (
                <span className={r.self ? 'font-semibold text-[var(--lf-gold)]' : undefined}>
                  {r.club}
                </span>
              ),
            },
            {
              key: 'rating',
              header: 'Rating',
              align: 'right',
              render: (r) => <span className="tabular-nums">{r.rating}</span>,
            },
          ]}
        />
      </Panel>
    </PlaceholderPage>
  );
}
