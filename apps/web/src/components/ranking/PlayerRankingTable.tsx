import Link from 'next/link';

import { Table } from '@/components/ui/Table';
import { resolveLeagueTierLabel } from '@/lib/league/league-tier';
import { PLAYER_RANKING_SIZE, type PlayerRankingRow } from '@/lib/ranking/player-ranking';

const num = (value: number | string) => <span className="tabular-nums">{value}</span>;

/** Clubs led by people. Own club below the cut is added at the end. */
export function PlayerRankingTable({
  rows,
  clubId,
}: {
  readonly rows: readonly PlayerRankingRow[];
  readonly clubId: string;
}) {
  const top = rows.slice(0, PLAYER_RANKING_SIZE);
  const own = rows.find((r) => r.clubId === clubId);
  const shown = own && !top.includes(own) ? [...top, own] : top;
  return (
    <Table<PlayerRankingRow>
      rowKey={(r) => r.clubId}
      rows={shown}
      highlight={(r) => r.clubId === clubId}
      columns={[
        { key: 'pos', header: '#', render: (r) => num(r.position) },
        {
          key: 'club',
          header: 'Klub',
          render: (r) => (
            <Link href={`/clubs/${r.clubId}`}>
              {r.name}
              {r.clubId === clubId ? ' · Ty' : ''}
            </Link>
          ),
        },
        { key: 'tier', header: 'Liga', render: (r) => resolveLeagueTierLabel(r.leagueTier) },
        { key: 'played', header: 'M', align: 'right', render: (r) => num(r.played) },
        { key: 'won', header: 'Z', align: 'right', render: (r) => num(r.won) },
        { key: 'drawn', header: 'R', align: 'right', render: (r) => num(r.drawn) },
        { key: 'lost', header: 'P', align: 'right', render: (r) => num(r.lost) },
        { key: 'points', header: 'Pkt', align: 'right', render: (r) => num(r.points) },
      ]}
    />
  );
}
