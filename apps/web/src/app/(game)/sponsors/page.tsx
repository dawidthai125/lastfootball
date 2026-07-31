import { redirect } from 'next/navigation';

import { SponsorsView } from '@/components/sponsors/SponsorsView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { ensureClubFixtures } from '@/lib/fixtures';
import { resolveLeagueTable } from '@/lib/league/resolve-league-table';
import { ensureClubSponsorContract } from '@/lib/sponsors/get-contract';
import { resolveClubSponsors } from '@/lib/sponsors';

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
  const sponsors = resolveClubSponsors({
    contract,
    seasonPhase: club.seasonPhase,
    playerPosition: table.rows.find((r) => r.isPlayer)?.position ?? null,
    tableSize: table.rows.length,
  });

  return <SponsorsView sponsors={sponsors} />;
}
