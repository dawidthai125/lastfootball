import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ScorerTable } from '@/components/stats/ScorerTable';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Table } from '@/components/ui/Table';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { listClubFixtures } from '@/lib/fixtures';
import { loadHumanScorers } from '@/lib/league/human-league-store';
import { resolveLeagueTierLabel } from '@/lib/league/league-tier';
import { formatSeasonLabel } from '@/lib/season/types';
import { resolveLeagueScorers } from '@/lib/stats/scorers';
import { loadPlayerTotals, loadStoredLines } from '@/lib/stats/store';
import { sumByPlayer, type PlayerLine } from '@/lib/stats/totals';

const num = (value: number) => <span className="tabular-nums">{value}</span>;
const NOTE = 'm-0 p-2.5 text-[12px] text-[var(--lf-muted)]';

/** Goals and assists of the season (D143): own squad, league scorers, human league scorers. */
export default async function StatsPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const fixtures = await listClubFixtures(club.id);
  const league = fixtures.filter((f) => f.competition === 'league' && f.status === 'played');
  const [totals, stored, human] = await Promise.all([
    loadPlayerTotals(club.id, { season: club.seasonNumber }),
    loadStoredLines(
      club.id,
      league.map((f) => f.id),
    ),
    loadHumanScorers(club.id).catch(() => null),
  ]);
  const squad = totals ? sumByPlayer(totals) : null;
  const counted = new Set(stored?.map((line) => line.matchId));
  const missing = stored ? league.filter((f) => !counted.has(f.id)).length : 0;

  return (
    <div className="grid gap-3">
      <SectionHeader
        title="Statystyki"
        subtitle={`${resolveLeagueTierLabel(club.leagueTier)} · ${formatSeasonLabel(club.seasonNumber)}`}
      />
      <Panel title="Twoi zawodnicy" flush>
        {!squad ? (
          <p className={NOTE}>Nie udało się wczytać statystyk. Odśwież stronę.</p>
        ) : squad.length === 0 ? (
          <p className={NOTE}>Gole i asysty pojawią się po najbliższym meczu.</p>
        ) : (
          <Table<PlayerLine>
            rowKey={(r) => r.playerId}
            rows={[...squad]}
            columns={[
              {
                key: 'name',
                header: 'Zawodnik',
                render: (r) => <Link href={`/players/${r.playerId}`}>{r.name}</Link>,
              },
              { key: 'matches', header: 'Mecze', align: 'right', render: (r) => num(r.matches) },
              { key: 'goals', header: 'Gole', align: 'right', render: (r) => num(r.goals) },
              {
                key: 'league',
                header: 'W lidze',
                align: 'right',
                render: (r) => num(r.leagueGoals),
              },
              { key: 'assists', header: 'Asysty', align: 'right', render: (r) => num(r.assists) },
            ]}
          />
        )}
        <p className={NOTE}>
          Liga, puchar i Liga ludzi. Wyzwania towarzyskie się nie liczą.
          {missing > 0 ? ` Mecze ligowe sprzed zapisu strzelców: ${missing}.` : ''}
        </p>
      </Panel>
      <Panel title="Król strzelców ligi" flush>
        {stored ? (
          <ScorerTable rows={resolveLeagueScorers(club, fixtures, stored)} />
        ) : (
          <p className={NOTE}>Nie udało się wczytać strzelców. Odśwież stronę.</p>
        )}
      </Panel>
      {human ? (
        <Panel title="Król strzelców Ligi ludzi" flush>
          <ScorerTable rows={human} />
        </Panel>
      ) : null}
    </div>
  );
}
