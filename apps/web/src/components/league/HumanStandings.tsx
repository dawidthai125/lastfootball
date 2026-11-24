import Link from 'next/link';

import { Table } from '@/components/ui/Table';
import type { HumanTableRow } from '@/lib/league/human-table';

type Row = HumanTableRow & { readonly position: number };

const num = (value: number | string) => <span className="tabular-nums">{value}</span>;

/** Standings of the human league (D138). */
export function HumanStandings({
  rows,
  clubId,
}: {
  readonly rows: readonly HumanTableRow[];
  readonly clubId: string;
}) {
  return (
    <Table<Row>
      rowKey={(r) => r.id}
      rows={rows.map((row, index) => ({ ...row, position: index + 1 }))}
      highlight={(r) => r.id === clubId}
      columns={[
        { key: 'pos', header: '#', render: (r) => num(r.position) },
        {
          key: 'club',
          header: 'Klub',
          render: (r) => (
            <span className={r.id === clubId ? 'font-semibold text-[var(--lf-gold)]' : undefined}>
              {r.isBot ? r.name : <Link href={`/clubs/${r.id}`}>{r.name}</Link>}
              {r.isBot ? ' · bot' : ''}
              {r.id === clubId ? ' · Ty' : ''}
            </span>
          ),
        },
        { key: 'played', header: 'M', align: 'right', render: (r) => num(r.played) },
        { key: 'won', header: 'Z', align: 'right', render: (r) => num(r.won) },
        { key: 'drawn', header: 'R', align: 'right', render: (r) => num(r.drawn) },
        { key: 'lost', header: 'P', align: 'right', render: (r) => num(r.lost) },
        {
          key: 'goals',
          header: '+/−',
          align: 'right',
          render: (r) => {
            const diff = r.goalsFor - r.goalsAgainst;
            return num(diff > 0 ? `+${diff}` : diff);
          },
        },
        { key: 'points', header: 'Pkt', align: 'right', render: (r) => num(r.points) },
      ]}
    />
  );
}
