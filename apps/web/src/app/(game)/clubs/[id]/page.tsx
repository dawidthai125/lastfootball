import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { ClubCrest } from '@/components/assets';
import { ReportClubForm } from '@/components/rivals/ReportClubForm';
import { RivalChallengeForm } from '@/components/rivals/RivalChallengeForm';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Table } from '@/components/ui/Table';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { loadPublicClub, type PublicClub } from '@/lib/club/load-public-club';
import { resolveLeagueTierLabel } from '@/lib/league/league-tier';
import { loadPlayerRanking } from '@/lib/ranking/load-player-ranking';

type PageProps = { params: Promise<{ id: string }> };

const NOTE = 'm-0 p-2.5 text-[12px] text-[var(--lf-muted)]';
const COMPETITION: Readonly<Record<string, string>> = {
  league: 'Liga',
  cup: 'Puchar',
  human: 'Liga ludzi',
};

/** Profile of another player's club (D152). */
export default async function PublicClubPage({ params }: PageProps) {
  const { id } = await params;
  const mine = await getManagerClub();
  if (!mine) redirect('/welcome');

  const [club, ranking] = await Promise.all([loadPublicClub(id), loadPlayerRanking()]);
  if (club === null) notFound();
  if (club === 'error') {
    return <Panel title="Klub">Nie udało się wczytać klubu. Odśwież stronę.</Panel>;
  }
  const place = ranking?.find((row) => row.clubId === club.id)?.position ?? null;
  const r = club.records;

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <ClubCrest
          shortName={club.shortName}
          clubName={club.name}
          crestTemplateId={club.crestTemplateId}
          accentColor={club.primaryColor}
          size="lg"
        />
        <SectionHeader
          title={club.name}
          subtitle={[
            resolveLeagueTierLabel(club.leagueTier),
            `sezon ${club.season}`,
            place ? `${place}. w rankingu graczy` : null,
            `gra od ${club.since}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        />
      </div>

      <Panel title="Bilans">
        <p className="m-0">
          {r.played === 0
            ? 'Ten klub nie rozegrał jeszcze meczu o stawkę.'
            : `Mecze ${r.played} · wygrane ${r.won} · remisy ${r.drawn} · porażki ${r.lost} · gole ${r.goalsFor}:${r.goalsAgainst}`}
        </p>
        {r.biggestWin ? (
          <p className="m-0 mt-1 text-[12px] text-[var(--lf-muted)]">
            Najwyższa wygrana: {r.biggestWin.ours}:{r.biggestWin.theirs}, {r.biggestWin.opponent}.
            Najdłuższa seria wygranych: {r.winStreak}.
          </p>
        ) : null}
      </Panel>

      <Panel title="Ostatnie mecze" flush>
        {club.last.length === 0 ? (
          <p className={NOTE}>Brak meczów.</p>
        ) : (
          <Table<PublicClub['last'][number]>
            rowKey={(m) => m.playedAt + m.opponent}
            rows={[...club.last]}
            columns={[
              { key: 'comp', header: 'Rozgrywki', render: (m) => COMPETITION[m.competition] ?? '' },
              { key: 'opp', header: 'Rywal', render: (m) => m.opponent },
              {
                key: 'score',
                header: 'Wynik',
                align: 'right',
                render: (m) => (
                  <span className="tabular-nums">
                    {m.ours}:{m.theirs}
                  </span>
                ),
              },
            ]}
          />
        )}
      </Panel>

      <Panel title="Trofea">
        {club.trophies.length === 0 ? (
          <p className="m-0">Gablota jest jeszcze pusta.</p>
        ) : (
          <ul className="m-0 pl-4">
            {club.trophies.map((t) => (
              <li key={t.id}>
                {t.title} <span className="text-[var(--lf-muted)]">({t.detail})</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Pierwszy skład" flush>
        {club.starters.length === 0 ? (
          <p className={NOTE}>Skład nie jest ustawiony.</p>
        ) : (
          <Table<PublicClub['starters'][number]>
            rowKey={(p) => p.id}
            rows={[...club.starters]}
            columns={[
              { key: 'no', header: '#', render: (p) => p.number },
              {
                key: 'name',
                header: 'Zawodnik',
                render: (p) => p.name + (p.captain ? ' (K)' : ''),
              },
              { key: 'pos', header: 'Pozycja', render: (p) => p.pos },
              { key: 'age', header: 'Wiek', align: 'right', render: (p) => p.age },
            ]}
          />
        )}
      </Panel>

      {club.id === mine.id ? (
        <p className="m-0 text-[12px] text-[var(--lf-muted)]">
          Tak widzą Twój klub inni gracze. <Link href="/club">Wróć do klubu</Link>
        </p>
      ) : (
        <Panel title="Rywalizacja">
          <div className="flex flex-wrap items-start gap-3">
            <RivalChallengeForm
              rivalId={club.id}
              rivalName={club.name}
              rivalShort={club.shortName}
            />
            <ReportClubForm clubId={club.id} />
          </div>
        </Panel>
      )}
    </div>
  );
}
