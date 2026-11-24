import { Table } from '@/components/ui/Table';
import type { ScorerRow } from '@/lib/stats/scorers';

type Row = ScorerRow & { readonly position: number };

const num = (value: number) => <span className="tabular-nums">{value}</span>;

/** Top of a scorer list, and the best of your players when none of them is in it. */
export function ScorerTable({
  rows,
  limit = 10,
}: {
  readonly rows: readonly ScorerRow[];
  readonly limit?: number;
}) {
  const all: Row[] = rows
    .filter((row) => row.goals > 0)
    .map((row, index) => ({ ...row, position: index + 1 }));
  const top = all.slice(0, limit);
  const mine = all.find((row) => row.yours);
  const shown = mine && mine.position > limit ? [...top, mine] : top;
  if (shown.length === 0) {
    return (
      <p className="m-0 p-2.5 text-[12px] text-[var(--lf-muted)]">Nikt jeszcze nie strzelił.</p>
    );
  }
  return (
    <Table<Row>
      rowKey={(r) => `${r.teamId}|${r.playerId}`}
      rows={shown}
      highlight={(r) => r.yours}
      columns={[
        { key: 'pos', header: '#', render: (r) => num(r.position) },
        {
          key: 'name',
          header: 'Zawodnik',
          render: (r) => (
            <span className={r.yours ? 'font-semibold text-[var(--lf-gold)]' : undefined}>
              {r.name}
            </span>
          ),
        },
        { key: 'team', header: 'Klub', render: (r) => r.teamName },
        { key: 'goals', header: 'Gole', align: 'right', render: (r) => num(r.goals) },
        { key: 'assists', header: 'Asysty', align: 'right', render: (r) => num(r.assists) },
      ]}
    />
  );
}
