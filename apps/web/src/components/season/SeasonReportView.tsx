import type { DeparturePreview } from '@/lib/season/departure';
import type { SeasonReportDto } from '@/lib/season/types';
import { UI_COPY } from '@/lib/ui/copy';

import './season-report.css';

/**
 * Season report — Information Thin · read-only (D81 · D84 · D86 · D91).
 * Facts only from resolveSeasonReport; no mutations, no Fake Production.
 * Promotion outcome = derived label only (persist at Confirm · D90).
 * Optional departure = foreshadow of Confirm N+1 (resolveDeparturePreview).
 */
export function SeasonReportView({
  report,
  departure = null,
}: {
  report: SeasonReportDto;
  departure?: DeparturePreview | null;
}) {
  return (
    <section
      className="lf-season-report"
      data-lf-impl="LFE-PROMOTION-01"
      aria-label={UI_COPY.seasonReportTitle}
    >
      <header className="lf-season-report__header">
        <p className="lf-season-report__eyebrow">{UI_COPY.seasonReportEyebrow}</p>
        <h2 className="lf-season-report__title">{UI_COPY.seasonReportTitle}</h2>
        <p className="lf-season-report__subtitle">
          {report.seasonLabel} · {report.leagueLabel}
        </p>
        <p className="lf-season-report__hint">{UI_COPY.seasonReportSubtitle}</p>
      </header>

      <dl className="lf-season-report__facts">
        <div>
          <dt>{UI_COPY.seasonReportPosition}</dt>
          <dd>
            {report.position} / {report.tableSize}
          </dd>
        </div>
        <div>
          <dt>{UI_COPY.seasonReportRecord}</dt>
          <dd>
            {report.won}W · {report.drawn}R · {report.lost}P
          </dd>
        </div>
        <div>
          <dt>{UI_COPY.seasonReportPoints}</dt>
          <dd>{report.points}</dd>
        </div>
        <div>
          <dt>{UI_COPY.seasonReportZone}</dt>
          <dd>{report.zoneLabel}</dd>
        </div>
        <div>
          <dt>{UI_COPY.seasonReportOutcome}</dt>
          <dd>{report.promotionLabel}</dd>
        </div>
      </dl>

      {report.highlights.length > 0 ? (
        <ul className="lf-season-report__highlights" aria-label={UI_COPY.seasonReportHighlights}>
          {report.highlights.map((h) => (
            <li key={h.id}>{h.label}</li>
          ))}
        </ul>
      ) : null}

      {departure ? (
        <div className="lf-season-report__departure" data-season-departure="">
          <h3 className="lf-season-report__departure-title">Kadra przy starcie N+1</h3>
          <p className="lf-season-report__departure-body">{departure.summary}</p>
        </div>
      ) : null}

      <p className="lf-season-report__confirm-hint">{UI_COPY.seasonReportConfirmHint}</p>
    </section>
  );
}