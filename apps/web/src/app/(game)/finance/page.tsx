import { redirect } from 'next/navigation';

import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatBlock } from '@/components/ui/StatBlock';
import { Table } from '@/components/ui/Table';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { formatMoney, resolveClubFinance, type FinanceMovementDto } from '@/lib/finance';
import { listClubFinanceMovements } from '@/lib/finance/get-movements';

/**
 * Club finances — fed only by resolveClubFinance() (LFE-ECONOMY-01).
 */
export default async function FinancePage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const movements = await listClubFinanceMovements(club.id);
  const finance = resolveClubFinance(club, movements);

  return (
    <div>
      <SectionHeader title="Finanse" subtitle={`Jedna kasa · ${finance.currency}`} />
      <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-2">
        <StatBlock label="Saldo" value={finance.cashLabel} tone="ok" />
        <StatBlock
          label="Ostatnia operacja"
          value={
            finance.lastMovement
              ? `${finance.lastMovement.amount >= 0 ? '+' : ''}${formatMoney(finance.lastMovement.amount)}`
              : '—'
          }
        />
      </div>
      <Panel title="Ostatnie operacje" flush>
        <Table
          rowKey={(r) => r.id}
          rows={[...finance.recentMovements]}
          columns={[
            {
              key: 'when',
              header: 'Kiedy',
              render: (r: FinanceMovementDto) => (
                <span className="text-[var(--lf-faint)] tabular-nums">
                  {r.createdAt.slice(0, 10)}
                </span>
              ),
            },
            {
              key: 'desc',
              header: 'Opis',
              render: (r: FinanceMovementDto) => r.label,
            },
            {
              key: 'amount',
              header: 'Kwota',
              align: 'right',
              render: (r: FinanceMovementDto) => (
                <span
                  className={[
                    'font-medium tabular-nums',
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
    </div>
  );
}
