import { redirect } from 'next/navigation';

import { RankingView } from '@/components/ranking/RankingView';
import { PlayerRankingTable } from '@/components/ranking/PlayerRankingTable';
import { Panel } from '@/components/ui/Panel';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { ensureClubFixtures } from '@/lib/fixtures';
import { resolveLeagueTable } from '@/lib/league';
import { resolveClubRanking } from '@/lib/ranking';
import { loadPlayerRanking } from '@/lib/ranking/load-player-ranking';
import { PLAYER_RANKING_DAYS } from '@/lib/ranking/player-ranking';

const NOTE = 'm-0 p-2.5 text-[12px] text-[var(--lf-muted)]';

/**
 * Seasonal club ranking — fed by resolveLeagueTable → resolveClubRanking (LFE-RANKING-01).
 * Own Information Thin surface; not league standings columns.
 */
export default async function RankingsPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const fixtures = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
  const table = resolveLeagueTable(club, fixtures);
  const ranking = resolveClubRanking({ table });

  const players = await loadPlayerRanking();

  return (
    <div className="grid gap-4">
      <Panel title="Ranking graczy" flush>
        {!players ? (
          <p className={NOTE}>Nie udało się wczytać rankingu. Odśwież stronę.</p>
        ) : players.length === 0 ? (
          <p className={NOTE}>Nikt nie rozegrał jeszcze meczu o stawkę w tym okresie.</p>
        ) : (
          <PlayerRankingTable rows={players} clubId={club.id} />
        )}
        <p className={NOTE}>
          Ostatnie {PLAYER_RANKING_DAYS} dni. Liga: 3 pkt za wygraną, 1 za remis, w wyższej lidze
          więcej. Puchar: 4 za wygraną. Liga ludzi: 6 za wygraną, 2 za remis. Wyzwania się nie
          liczą.
        </p>
      </Panel>
      <RankingView ranking={ranking} />
    </div>
  );
}
