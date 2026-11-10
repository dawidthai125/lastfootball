import type { ClubRankingDto, RankingBand } from '@/lib/ranking';
import { UI_COPY } from '@/lib/ui/copy';

import './ranking.css';

function bandLabel(band: RankingBand): string {
  switch (band) {
    case 'upper':
      return UI_COPY.rankingBandUpper;
    case 'mid':
      return UI_COPY.rankingBandMid;
    case 'lower':
      return UI_COPY.rankingBandLower;
    default:
      return band;
  }
}

/**
 * Seasonal club ranking — LFE-RANKING-01 Information Thin.
 * Own surface: position · club · band. No points / WDL / goals / ELO.
 */
export function RankingView({ ranking }: { ranking: ClubRankingDto }) {
  const { rows, seasonLabel, contextLabel, playerPosition } = ranking;

  return (
    <div className="lf-rank" data-lf-impl="LFE-RANKING-01">
      <header className="lf-rank__header">
        <p className="lf-rank__eyebrow">{UI_COPY.rankingEyebrow}</p>
        <h1 className="lf-rank__title">{UI_COPY.rankingTitle}</h1>
        <p className="lf-rank__subtitle">{UI_COPY.rankingSubtitle}</p>
        <p className="lf-rank__context">
          {contextLabel} · {seasonLabel}
          {playerPosition != null ? (
            <>
              {' '}
              · {UI_COPY.rankingPlayerPositionPrefix} {playerPosition}
            </>
          ) : null}
        </p>
      </header>

      <ol className="lf-rank__list" aria-label={UI_COPY.rankingTitle}>
        {rows.map((r) => (
          <li
            key={r.clubId}
            className={`lf-rank__item${r.isPlayer ? 'lf-rank__item--self' : ''}`}
            data-rank-pos={r.position}
            data-rank-band={r.band}
          >
            <span className="lf-rank__pos" aria-hidden="true">
              {r.position}
            </span>
            <div className="lf-rank__body">
              <span className={`lf-rank__name${r.isPlayer ? 'lf-rank__name--self' : ''}`}>
                {r.name}
              </span>
              <span className="lf-rank__band">{bandLabel(r.band)}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
