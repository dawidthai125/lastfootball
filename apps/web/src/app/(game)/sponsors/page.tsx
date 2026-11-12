import { redirect } from 'next/navigation';

import { SponsorsView } from '@/components/sponsors/SponsorsView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { ensureClubFixtures } from '@/lib/fixtures';
import { resolveLeagueTable } from '@/lib/league/resolve-league-table';
import { ensureClubSponsorContract } from '@/lib/sponsors/get-contract';
import { resolveClubSponsors } from '@/lib/sponsors';
import { sponsorFromCrowd } from '@/lib/sponsors/crowd';

/**
 * Sponsors — fed only by resolveClubSponsors() (LFE-SPONSORS-01 · D96).
 */
export default async function SponsorsPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const contract = await ensureClubSponsorContract(club.id, club.seasonNumber);
  if (!contract) {
    return (
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-xl text-[var(--lf-color-text-primary)]">
          Sponsorzy
        </h1>
        <p className="mt-2 text-[13px] text-[var(--lf-muted)]">
          Nie udało się wczytać kontraktu sponsorskiego. Spróbuj ponownie później.
        </p>
      </div>
    );
  }

  const fixtures = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
  const table = resolveLeagueTable(club, fixtures);
  const playerRow = table.rows.find((r) => r.isPlayer);
  const sponsors = resolveClubSponsors({
    contract,
    seasonPhase: club.seasonPhase,
    playerPosition: playerRow?.position ?? null,
    tableSize: table.rows.length,
    leaguePlayed: playerRow?.played ?? 0,
  });

  const lastHome = fixtures
    .filter(
      (fixture) =>
        fixture.competition === 'league' &&
        fixture.isHome &&
        fixture.status === 'played' &&
        fixture.homeScore != null &&
        fixture.awayScore != null,
    )
    .sort((a, b) => (b.playedAt ?? '').localeCompare(a.playedAt ?? ''))[0];
  const attendance =
    lastHome == null || lastHome.homeScore == null || lastHome.awayScore == null
      ? 'unknown'
      : lastHome.homeScore > lastHome.awayScore
        ? 'lively'
        : lastHome.homeScore < lastHome.awayScore
          ? 'quiet'
          : 'steady';
  const crowdQuote = sponsorFromCrowd({ attendance, leagueTier: club.leagueTier });

  return <SponsorsView sponsors={sponsors} crowdQuote={crowdQuote} />;
}
