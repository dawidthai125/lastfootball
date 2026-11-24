import type { ClubMatch, ClubRecords } from '@/lib/stats/records';
import type { PlayerLine } from '@/lib/stats/totals';
import type { TrophyDto } from '@/lib/stats/trophies';

const KIND_LABEL: Readonly<Record<TrophyDto['kind'], string>> = {
  league: 'Mistrzostwo',
  cup: 'Puchar',
  cup_final: 'Puchar',
  promotion: 'Awans',
  human: 'Liga ludzi',
};

function matchLine(match: ClubMatch): string {
  return `${match.ours}:${match.theirs} · ${match.opponent} · sezon ${match.season}`;
}

/** First of a list sorted by `value`, or nothing when nobody has any. */
function leader(
  players: readonly PlayerLine[],
  value: (p: PlayerLine) => number,
): PlayerLine | null {
  const best = [...players].sort((a, b) => value(b) - value(a))[0];
  return best && value(best) > 0 ? best : null;
}

/** Trophies and records (D143). Null = that read failed. */
export function TrophyCabinet({
  trophies,
  records,
  players,
  bestMatch,
}: {
  readonly trophies: readonly TrophyDto[] | null;
  readonly records: ClubRecords | null;
  readonly players: readonly PlayerLine[] | null;
  readonly bestMatch: { readonly name: string; readonly goals: number } | null;
}) {
  const rows: [string, string][] = [];
  if (records && records.played > 0) {
    rows.push([
      'Bilans',
      `${records.won} wygr., ${records.drawn} rem., ${records.lost} przegr. · bramki ${records.goalsFor}:${records.goalsAgainst}`,
    ]);
    if (records.biggestWin) rows.push(['Najwyższe zwycięstwo', matchLine(records.biggestWin)]);
    if (records.biggestLoss) rows.push(['Najwyższa porażka', matchLine(records.biggestLoss)]);
    if (records.wildest) rows.push(['Najwięcej goli w meczu', matchLine(records.wildest)]);
    if (records.winStreak > 1) rows.push(['Najdłuższa seria zwycięstw', String(records.winStreak)]);
    if (records.unbeatenStreak > 1) {
      rows.push(['Najdłużej bez porażki', String(records.unbeatenStreak)]);
    }
  }
  const scorer = players && leader(players, (p) => p.goals);
  const helper = players && leader(players, (p) => p.assists);
  const veteran = players && leader(players, (p) => p.matches);
  if (scorer) rows.push(['Najlepszy strzelec', `${scorer.name} · ${scorer.goals}`]);
  if (helper) rows.push(['Najwięcej asyst', `${helper.name} · ${helper.assists}`]);
  if (veteran) rows.push(['Najwięcej meczów', `${veteran.name} · ${veteran.matches}`]);
  if (bestMatch)
    rows.push(['Najwięcej goli zawodnika w meczu', `${bestMatch.name} · ${bestMatch.goals}`]);

  return (
    <>
      <section aria-label="Trofea">
        <h2 className="lf-ach__section">Trofea</h2>
        {!trophies ? (
          <p className="lf-ach__hint">Nie udało się wczytać trofeów. Odśwież stronę.</p>
        ) : trophies.length === 0 ? (
          <p className="lf-ach__hint">
            Gablota jest pusta. Trafią tu mistrzostwa, awanse, puchary i podium Ligi ludzi.
          </p>
        ) : (
          <ul className="lf-ach__list">
            {trophies.map((t) => (
              <li key={t.id} className="lf-ach__item" data-trophy={t.kind}>
                <span className="lf-ach__category">{KIND_LABEL[t.kind]}</span>
                <h3 className="lf-ach__item-title">{t.title}</h3>
                <p className="lf-ach__item-detail">{t.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-label="Rekordy">
        <h2 className="lf-ach__section">Rekordy</h2>
        {!records || !players ? (
          <p className="lf-ach__hint">Nie udało się wczytać rekordów. Odśwież stronę.</p>
        ) : rows.length === 0 ? (
          <p className="lf-ach__hint">Rekordy pojawią się po pierwszym meczu ligowym.</p>
        ) : (
          <dl className="lf-ach__records">
            {rows.map(([label, value]) => (
              <div key={label} className="lf-ach__record">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </>
  );
}
