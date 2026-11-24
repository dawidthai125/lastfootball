import Link from 'next/link';
import { redirect } from 'next/navigation';

import { InvitePanel } from '@/components/rivals/InvitePanel';
import { RivalChallengeForm } from '@/components/rivals/RivalChallengeForm';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { env } from '@/config/env';
import { invitePath } from '@/lib/invites/code';
import { loadInvite } from '@/lib/invites/store';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { listRivalChallenges, listRivalClubs } from '@/lib/rivals/actions';

export default async function RivalsPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const [rivals, challenges] = await Promise.all([listRivalClubs(), listRivalChallenges(club.id)]);

  const mine = await loadInvite(club.id);
  const invite = mine
    ? {
        link: `${env.appUrl ?? 'https://www.lastfootball.pl'}${invitePath(mine.code)}`,
        used: mine.used,
      }
    : null;

  return (
    <div>
      <SectionHeader
        title="Rywalizacja"
        subtitle="Wyzwanie jest asynchroniczne: grasz obie kadry, rywal dostaje wynik. Jedno dziennie, bez nagród i pensji, nie zajmuje dnia ligi. Energia, kontuzje i kartki liczą się jak w meczu."
      />
      <Panel title="Kluby">
        {rivals.length === 0 ? (
          <p style={{ margin: 0 }}>Nie ma jeszcze innego klubu do wyzwania.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {rivals.map((rival) => (
              <li key={rival.id} style={{ marginBottom: '0.4rem' }}>
                <RivalChallengeForm
                  rivalId={rival.id}
                  rivalName={rival.name}
                  rivalShort={rival.shortName}
                />
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
      {invite ? <InvitePanel link={invite.link} used={invite.used} /> : null}
    </div>
  );
}
