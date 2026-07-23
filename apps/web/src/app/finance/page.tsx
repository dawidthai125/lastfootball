import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { Panel } from '@/components/ui/Panel';
import { StatBlock } from '@/components/ui/StatBlock';
import { Table } from '@/components/ui/Table';
import { dashboardMock, formatMoney } from '@/data/mock';

const ledger = [
  { id: '1', day: 41, desc: 'Bilety — liga', amount: 42_500 },
  { id: '2', day: 40, desc: 'Płace tygodniowe', amount: -84_200 },
  { id: '3', day: 39, desc: 'Sponsor — rata', amount: 17_500 },
  { id: '4', day: 38, desc: 'Utrzymanie stadionu', amount: -6_200 },
];

export default function FinancePage() {
  const f = dashboardMock.financeSnap;

  return (
    <PlaceholderPage title="Finanse" subtitle="Jedna kasa · envelope budżetowe">
      <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <StatBlock label="Saldo" value={formatMoney(f.balance)} tone="ok" />
        <StatBlock label="Płace / tydz." value={formatMoney(f.weeklyWage)} tone="warn" />
        <StatBlock label="Ostatnia bramka" value={formatMoney(f.lastMatchGate)} />
        <StatBlock label="Prognoza 4 tyg." value={formatMoney(f.balance - f.weeklyWage * 4)} />
      </div>
      <Panel title="Ostatnie operacje" flush>
        <Table
          rowKey={(r) => r.id}
          rows={ledger}
          columns={[
            {
              key: 'day',
              header: 'Dzień',
              render: (r) => <span className="tabular-nums text-[var(--lf-faint)]">{r.day}</span>,
            },
            { key: 'desc', header: 'Opis', render: (r) => r.desc },
            {
              key: 'amount',
              header: 'Kwota',
              align: 'right',
              render: (r) => (
                <span
                  className={[
                    'tabular-nums font-medium',
                    r.amount >= 0 ? 'text-[var(--lf-ok)]' : 'text-[var(--lf-danger)]',
                  ].join(' ')}
                >
                  {r.amount >= 0 ? '+' : ''}
                  {formatMoney(r.amount)}
                </span>
              ),
            },
          ]}
        />
      </Panel>
    </PlaceholderPage>
  );
}
