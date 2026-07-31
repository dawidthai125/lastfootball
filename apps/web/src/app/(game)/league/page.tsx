import { redirect } from 'next/navigation';

import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Table } from '@/components/ui/Table';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { ensureClubFixtures } from '@/lib/fixtures';
import { resolveLeagueTable } from '@/lib/league';
import type { LeagueTableRowDto } from '@/lib/league';

/**
 * League table — fed only by resolveLeagueTable() (LFE-LEAGUE-02).
 */
export default async function LeaguePage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const fixtures = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
  const table = resolveLeagueTable(club, fixtures);

  return (
    <div>
      <SectionHeader title="Liga" subtitle={`${table.leagueLabel} · ${table.seasonLabel}`} />
      <Panel title="Tabela" flush>
        <Table
          rowKey={(r) => r.clubId}
          rows={[...table.rows]}
          highlight={(r) => r.isPlayer}
          columns={[
            {
              key: 'pos',
              header: '#',
              render: (r: LeagueTableRowDto) => (
                <span className="text-[var(--lf-faint)] tabular-nums">{r.position}</span>
              ),
            },
            {
              key: 'club',
              header: 'Klub',
              render: (r: LeagueTableRowDto) => (
                <span className={r.isPlayer ? 'font-semibold text-[var(--lf-gold)]' : undefined}>
                  {r.name}
                </span>
              ),
            },
            {
              key: 'played',
              header: 'M',
              align: 'right',
              render: (r: LeagueTableRowDto) => <span className="tabular-nums">{r.played}</span>,
            },
            {
              key: 'gd',
              header: '+/−',
              align: 'right',
              render: (r: LeagueTableRowDto) => (
                <span className="tabular-nums">
                  {r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}
                </span>
              ),
            },
            {
              key: 'pts',
              header: 'Pkt',
              align: 'right',
              render: (r: LeagueTableRowDto) => (
                <span className="font-semibold tabular-nums">{r.points}</span>
              ),
            },
          ]}
        />
      </Panel>
    </div>
  );
}
