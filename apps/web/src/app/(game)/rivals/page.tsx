import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { createRivalChallenge, listRivalChallenges, listRivalClubs } from '@/lib/rivals/actions';

export default async function RivalsPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const [rivals, challenges] = await Promise.all([listRivalClubs(), listRivalChallenges(club.id)]);

  return (
    <div>
      <SectionHeader
        title="Rywalizacja"
        subtitle="Wyzwanie jest asynchroniczne: grasz obie kadry, rywal dostaje wynik."
      />
      <Panel title="Kluby">
        {rivals.length === 0 ? (
          <p style={{ margin: 0 }}>Nie ma jeszcze innego klubu do wyzwania.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {rivals.map((rival) => (
              <li key={rival.id} style={{ marginBottom: '0.4rem' }}>
                <form action={createRivalChallenge}>
                  <input type="hidden" name="rivalId" value={rival.id} />
                  {rival.name} ({rival.shortName}) <button type="submit">Wyzwij</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Wyniki">
        {challenges.length === 0 ? (
          <p style={{ margin: 0 }}>Brak wyzwań.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {challenges.map((challenge) => (
              <li key={challenge.id}>
                {challenge.incoming ? 'Od' : 'Do'} {challenge.rivalName}
                {challenge.status === 'played' &&
                challenge.homeScore != null &&
                challenge.awayScore != null
                  ? ` · ${challenge.homeScore}:${challenge.awayScore}`
                  : ' · do rozegrania'}
                {!challenge.incoming && challenge.status === 'open' ? (
                  <>
                    {' '}
                    <Link href={`/match/${challenge.fixtureId}`}>Graj</Link>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
