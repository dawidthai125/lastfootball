import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Table } from '@/components/ui/Table';
import { dashboardMock } from '@/data/mock';

const fullTable = [
  ...dashboardMock.standingsPreview,
  { pos: 6, club: 'Stal Portowa', pts: 18, gd: -1, self: false },
  { pos: 7, club: 'Górnik Wschód', pts: 16, gd: -4, self: false },
  { pos: 8, club: 'Lechia Południe', pts: 14, gd: -6, self: false },
];

export default function LeaguePage() {
  return (
    <div>
      <SectionHeader
        title="Liga"
        subtitle={dashboardMock.club.division}
      />
      <Panel title="Tabela" flush>
        <Table
          rowKey={(r) => String(r.pos)}
          rows={fullTable}
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
              key: 'gd',
              header: '+/−',
              align: 'right',
              render: (r) => (
                <span className="tabular-nums">{r.gd > 0 ? `+${r.gd}` : r.gd}</span>
              ),
            },
            {
              key: 'pts',
              header: 'Pkt',
              align: 'right',
              render: (r) => <span className="font-semibold tabular-nums">{r.pts}</span>,
            },
          ]}
        />
      </Panel>
    </div>
  );
}
