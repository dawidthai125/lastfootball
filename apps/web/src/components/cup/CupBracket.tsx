import { Panel } from '@/components/ui/Panel';
import type { CupSide, CupTieDto, NationalCupDto } from '@/lib/cup';

/**
 * Puchar Krajowy on the league screen (same unlock as Liga).
 * Does not write a result for the manager's tie.
 */
export function CupBracket({ cup }: { cup: NationalCupDto }) {
  return (
    <Panel
      className="mt-3"
      flush
      title="Puchar Krajowy"
      action={cup.editionOpen ? cup.seasonLabel : `po kolejce ${cup.unlockAfterMatchday}`}
    >
      <div className="p-2.5" data-lf-impl="LFE-CUP-01">
        {cup.editionOpen ? <OpenBracket cup={cup} /> : <ClosedBracket cup={cup} />}
      </div>
    </Panel>
  );
}

function ClosedBracket({ cup }: { cup: NationalCupDto }) {
  return (
    <div>
      <p className="text-[13px] text-[var(--lf-text)]">
        Losowanie drabinki po {cup.unlockAfterMatchday}. kolejce ligi. Rozegrane kolejki:{' '}
        {cup.playedLeagueMatchdays}/{cup.unlockAfterMatchday}. W pucharze gra cała liga i 4 gości (
        {cup.guestOriginLabel}). Puchar nie zastępuje ligi.
      </p>
      <ul className="mt-2 flex flex-wrap gap-1" aria-label="Zgłoszone drużyny">
        {cup.qualified.map((club) => (
          <li
            key={club.id}
            className={
              club.isPlayer
                ? 'bg-[var(--lf-gold-soft)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--lf-gold)]'
                : 'bg-[var(--lf-inset)] px-1.5 py-0.5 text-[11px] text-[var(--lf-muted)]'
            }
          >
            {club.shortName}
          </li>
        ))}
      </ul>
    </div>
  );
}

function OpenBracket({ cup }: { cup: NationalCupDto }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-[var(--lf-text)]">
        Jedna drabinka, jeden mecz. Twoja para czeka na prawdziwy mecz. Pary bez Ciebie są już
        domknięte. Goście: {cup.guestOriginLabel}.
      </p>
      {cup.rounds.map((round) => (
        <section key={round.round} aria-label={round.label} data-cup-round={round.round}>
          <h3 className="font-[family-name:var(--font-ui)] text-[10px] font-semibold tracking-wide text-[var(--lf-faint)] uppercase">
            {round.label}
          </h3>
          <ul className="mt-1 flex flex-col gap-1">
            {round.ties.map((tie) => (
              <li
                key={tie.id}
                data-cup-status={tie.status}
                className={[
                  'grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-1.5 py-1 text-[12px]',
                  tie.onPlayerPath ? 'bg-[var(--lf-gold-soft)]' : 'bg-[var(--lf-inset)]',
                ].join(' ')}
              >
                <span className={sideClass(tie.home)}>{sideLabel(tie.home)}</span>
                <span className="text-center text-[11px] text-[var(--lf-muted)] tabular-nums">
                  {scoreText(tie)}
                  {hostHint(tie) ? (
                    <span className="mt-0.5 block text-[10px] tracking-wide uppercase">
                      {hostHint(tie)}
                    </span>
                  ) : null}
                </span>
                <span className={`text-right ${sideClass(tie.away)}`}>{sideLabel(tie.away)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function sideLabel(side: CupSide): string {
  if (side.kind === 'path') return 'Twoja ścieżka';
  if (side.kind === 'tbd') return 'Do wyłonienia';
  return side.club.origin === 'guest' ? `${side.club.name} · gość` : side.club.name;
}

function sideClass(side: CupSide): string {
  if (side.kind === 'club' && side.club.isPlayer) return 'font-semibold text-[var(--lf-gold)]';
  return 'text-[var(--lf-text)]';
}

function scoreText(tie: CupTieDto): string {
  if (tie.status === 'played' && tie.homeScore != null && tie.awayScore != null) {
    const extra = tie.decidedBy === 'extra' ? ' po dogrywce' : '';
    return `${tie.homeScore}:${tie.awayScore}${extra}`;
  }
  if (tie.status === 'awaiting_player') return 'do rozegrania';
  if (tie.onPlayerPath) return 'po Twoim meczu';
  return '—';
}

function hostHint(tie: CupTieDto): string | null {
  if (tie.status !== 'awaiting_player' || tie.hostClubId == null) return null;
  const home = tie.home.kind === 'club' ? tie.home.club : null;
  const away = tie.away.kind === 'club' ? tie.away.club : null;
  const player = home?.isPlayer ? home : away?.isPlayer ? away : null;
  if (!player) return null;
  return tie.hostClubId === player.id ? 'u siebie' : 'wyjazd';
}
