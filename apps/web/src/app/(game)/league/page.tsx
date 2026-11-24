import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Table } from '@/components/ui/Table';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { ensureClubFixtures } from '@/lib/fixtures';
import { HumanStandings } from '@/components/league/HumanStandings';
import { CupBracket } from '@/components/cup/CupBracket';
import { ensurePlayerCupTie } from '@/lib/cup/ensure-cup-tie';
import { resolveNationalCup } from '@/lib/cup';
import { resolveLeagueTable } from '@/lib/league';
import type { LeagueTableRowDto } from '@/lib/league';
import { humanPrizeLine } from '@/lib/league/human-awards';
import { loadHumanLeagueCard } from '@/lib/league/human-league-store';
import { resolveSeasonGoalProgressLine } from '@/lib/season/season-goal';

/**
 * League table — fed only by resolveLeagueTable() (LFE-LEAGUE-02).
 */
export default async function LeaguePage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const seeded = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
  const fixtures = await ensurePlayerCupTie(club, seeded);
  const table = resolveLeagueTable(club, fixtures);
  const playerRow = table.rows.find((row) => row.isPlayer);
  const seasonGoalLine = resolveSeasonGoalProgressLine({
    position: playerRow?.position ?? null,
    tableSize: table.rows.length,
    playedCount: playerRow?.played ?? 0,
  });
  const human = await loadHumanLeagueCard(club).catch(() => null);
  const cup = resolveNationalCup(club, fixtures);
  const playable = cup.playerTie?.due
    ? fixtures.find(
        (f) =>
          f.competition === 'cup' &&
          f.matchday === cup.playerTie?.matchday &&
          f.status !== 'played',
      )
    : null;

  return (
    <div>
      <SectionHeader title="Liga" subtitle={`${table.leagueLabel} · ${table.seasonLabel}`} />
      <p
        data-season-goal="top-half"
        style={{
          margin: '0 0 var(--lf-space-3)',
          color: 'var(--lf-color-text-muted)',
          fontSize: 'var(--lf-type-body)',
        }}
      >
        {seasonGoalLine}
      </p>
      {human ? (
        <Panel title={`Liga ludzi ${human.leagueId} · Sezon ${human.season}`}>
          <p style={{ margin: '0 0 var(--lf-space-2)', color: 'var(--lf-color-text-muted)' }}>
            12 miejsc, wolne zajmują boty. Oba kluby oglądają ten sam mecz. Gdy przybywa klubów,
            kolejna liga otwiera się sama. Lig: {human.leagues}, klubów graczy: {human.clubs}.
          </p>
          {human.prizes.some((amount) => amount > 0) ? (
            <p style={{ margin: '0 0 var(--lf-space-2)', color: 'var(--lf-color-text-muted)' }}>
              {humanPrizeLine(human.prizes)}
            </p>
          ) : null}
          {human.lastSeason ? (
            <p style={{ margin: '0 0 var(--lf-space-2)', color: 'var(--lf-color-text-muted)' }}>
              Mistrz sezonu {human.lastSeason.season}: {human.lastSeason.champion}.
              {human.lastSeason.place ? ` Twoje miejsce: ${human.lastSeason.place}.` : ''}
            </p>
          ) : null}
          {human.opponentName ? (
            <p style={{ margin: '0 0 var(--lf-space-2)' }}>
              {human.round ? `Kolejka ${human.round}. ` : ''}
              Rywal: {human.opponentName}.
            </p>
          ) : null}
          {human.windowSentence ? (
            <p style={{ margin: '0 0 var(--lf-space-2)' }}>{human.windowSentence}</p>
          ) : null}
          {human.note ? (
            <p style={{ margin: '0 0 var(--lf-space-2)', color: 'var(--lf-color-text-muted)' }}>
              {human.note}
            </p>
          ) : null}
          {human.fixtureId ? (
            <p style={{ margin: '0 0 var(--lf-space-3)' }}>
              <Link
                href={`/match/${human.fixtureId}`}
                style={{ color: 'var(--lf-color-text-gold)' }}
              >
                {human.late ? 'Zagraj zaległy mecz' : 'Wejdź w mecz'}
              </Link>
            </p>
          ) : null}
          {human.standings.length > 0 ? (
            <HumanStandings rows={human.standings} clubId={club.id} />
          ) : (
            <ol style={{ margin: 0, paddingLeft: '1.2em' }}>
              {human.seats.map((seat) => (
                <li key={seat.slot} style={{ fontWeight: seat.yours ? 700 : 400 }}>
                  {seat.name}
                  {seat.kind === 'bot' ? ' · bot' : ''}
                  {seat.yours ? ' · Ty' : ''}
                </li>
              ))}
            </ol>
          )}
        </Panel>
      ) : null}
      <p style={{ margin: 'var(--lf-space-2) 0' }}>
        <Link href="/stats" style={{ color: 'var(--lf-color-text-gold)' }}>
          Strzelcy i statystyki
        </Link>
      </p>
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
              key: 'won',
              header: 'Z',
              align: 'right',
              render: (r: LeagueTableRowDto) => <span className="tabular-nums">{r.won}</span>,
            },
            {
              key: 'drawn',
              header: 'R',
              align: 'right',
              render: (r: LeagueTableRowDto) => <span className="tabular-nums">{r.drawn}</span>,
            },
            {
              key: 'lost',
              header: 'P',
              align: 'right',
              render: (r: LeagueTableRowDto) => <span className="tabular-nums">{r.lost}</span>,
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
      <CupBracket cup={cup} playFixtureId={playable?.id ?? null} />
    </div>
  );
}
