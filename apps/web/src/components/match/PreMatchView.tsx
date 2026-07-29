import Link from 'next/link';

import { AtmosphereLayer } from '@/components/assets';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CrestMonogram, FormPills } from '@/components/match/CrestMonogram';
import type { PreMatchBundle } from '@/data/fixtures';
import { FIRST_MATCH_PATHS } from '@/lib/first-match/constants';
import { matchLivePath, matchTunnelPath, matchVsPath } from '@/lib/match/match-path';

import './prematch-kickoff.css';
import './match-path.css';

/**
 * HF-MCH-03 Pre-match checklist + kick-off context (LFE-UI-IMPL-02).
 */
export function PreMatchView({
  bundle,
  firstMatch = false,
}: {
  bundle: PreMatchBundle;
  firstMatch?: boolean;
}) {
  const { fixture } = bundle;
  const home = fixture.home ? bundle.ourTeam : bundle.theirTeam;
  const away = fixture.home ? bundle.theirTeam : bundle.ourTeam;
  const whenLabel = [
    fixture.dateLabel ?? fixture.whenLabel,
    fixture.kickoff ? fixture.kickoff : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const tacticPreview = bundle.tactics.slice(0, 3);
  const checklistReady = bundle.ourLineup.length >= 11;

  return (
    <div className="lf-ko" data-lf-impl="LFE-UI-IMPL-02" data-mch="SCR-MCH-03">
      <Breadcrumbs
        items={[
          { label: 'Tunel', href: matchTunnelPath(fixture.id) },
          { label: 'VS', href: matchVsPath(fixture.id) },
          { label: `vs ${fixture.opponent}` },
        ]}
      />

      <section className="lf-mp__decision" aria-label="Checklist przedmeczowa">
        <p className="lf-mp__eyebrow">Pre-match</p>
        <h1 className="lf-mp__title">Gotowi do meczu?</h1>
        <ul className="lf-mp__checklist">
          <li className="lf-mp__check">
            <span>Skład wyjściowy (XI)</span>
            <span
              className={
                checklistReady
                  ? 'lf-mp__check-status'
                  : 'lf-mp__check-status lf-mp__check-status--warn'
              }
            >
              {checklistReady ? 'OK' : 'Sprawdź'}
            </span>
          </li>
          <li className="lf-mp__check">
            <span>Taktyka</span>
            <span className="lf-mp__check-status">OK</span>
          </li>
          <li className="lf-mp__check">
            <span>Kick-off</span>
            <span className="lf-mp__check-status">OK</span>
          </li>
        </ul>
        <div className="lf-ko__cta-wrap">
          {checklistReady ? (
            <Link href={matchLivePath(fixture.id)} className="lf-mp__primary">
              {firstMatch ? 'Rozpocznij pierwszy mecz' : 'Start meczu'}
            </Link>
          ) : (
            <span className="lf-mp__primary lf-mp__primary--disabled" aria-disabled>
              Start meczu
            </span>
          )}
          <Link href="/squad" className="lf-mp__soft">
            Ustaw skład (Kadra)
          </Link>
        </div>
      </section>

      <AtmosphereLayer aria-label="Kick-Off" className="lf-ko__hero">
        <div className="lf-ko__hero-inner">
          <p className="lf-ko__eyebrow">{fixture.competitionLabel}</p>
          <div className="lf-ko__matchup">
            <div className="lf-ko__side">
              <CrestMonogram initials={home.shortName} label={home.name} />
              <FormPills form={home.form} />
            </div>
            <div className="lf-ko__vs-block">
              <p className="lf-ko__vs">VS</p>
              <p className="lf-ko__countdown tabular-nums">{bundle.countdown}</p>
            </div>
            <div className="lf-ko__side">
              <CrestMonogram initials={away.shortName} label={away.name} />
              <FormPills form={away.form} />
            </div>
          </div>
          <p className="lf-ko__when">{whenLabel}</p>
        </div>
      </AtmosphereLayer>

      <div className="lf-ko__summaries">
        <section className="lf-ko__section" aria-labelledby="lf-ko-xi-title">
          <h2 id="lf-ko-xi-title" className="lf-ko__section-title">
            Wyjściowa 11
          </h2>
          <p className="lf-ko__section-meta">{bundle.formation}</p>
          <ul className="lf-ko__xi">
            {bundle.ourLineup.map((r) => (
              <li key={`${r.number}-${r.name}`} className="lf-ko__xi-row">
                <span className="lf-ko__xi-num">{r.number}</span>
                <span className="lf-ko__xi-pos">{r.pos}</span>
                <span className="lf-ko__xi-name">
                  {r.id ? <Link href={`/players/${r.id}`}>{r.name}</Link> : r.name}
                  {r.captain ? <span className="lf-ko__xi-cap">C</span> : null}
                </span>
                <span className="lf-ko__xi-rating">{r.rating}</span>
              </li>
            ))}
          </ul>
          <p className="lf-ko__condition">
            Kondycja zespołu: {bundle.teamCondition.label} · {bundle.teamCondition.value}%
          </p>
        </section>

        <section className="lf-ko__section" aria-labelledby="lf-ko-tactics-title">
          <h2 id="lf-ko-tactics-title" className="lf-ko__section-title">
            Taktyka
          </h2>
          <p className="lf-ko__tactics-line">
            Styl gry: <strong>{bundle.styleLabel}</strong>
          </p>
          <ul className="lf-ko__tactics-list">
            {tacticPreview.map((t) => (
              <li key={t.id} className="lf-ko__tactic">
                <span>{t.label}</span>
                <span className="lf-ko__tactic-value">{t.value}</span>
              </li>
            ))}
          </ul>
          <div className="lf-ko__pitch" aria-label="Podgląd ustawienia">
            <div className="lf-ko__pitch-frame" aria-hidden />
            {bundle.pitchSlots.map((s) => (
              <span
                key={s.number}
                className="lf-ko__pitch-slot"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              >
                {s.number}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="lf-ko__context" aria-labelledby="lf-ko-context-title">
        <h2 id="lf-ko-context-title" className="lf-ko__context-title">
          Kontekst meczu
        </h2>
        <div className="lf-ko__context-block">
          <p className="lf-ko__context-label">Stadion</p>
          <p className="lf-ko__context-value">{fixture.stadium}</p>
        </div>
        <div className="lf-ko__context-block">
          <p className="lf-ko__context-label">Pogoda</p>
          <p className="lf-ko__context-value">
            {bundle.temperature} · {bundle.weatherDetail}
            {bundle.weatherNote ? ` — ${bundle.weatherNote}` : ''}
          </p>
        </div>
        {bundle.stakes.length > 0 ? (
          <div className="lf-ko__context-block">
            <p className="lf-ko__context-label">Stawka</p>
            <ul className="lf-ko__stakes">
              {bundle.stakes.map((s) => (
                <li key={s.id} className="lf-ko__stake">
                  <strong>{s.label}</strong>
                  {' · '}
                  {s.value}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {bundle.h2h.length > 0 ? (
          <div className="lf-ko__context-block">
            <p className="lf-ko__context-label">Ostatnie spotkania</p>
            <ul className="lf-ko__h2h">
              {bundle.h2h.map((h) => (
                <li key={`${h.score}-${h.when}`} className="lf-ko__h2h-item">
                  <span className="lf-ko__h2h-score">{h.score}</span>
                  {' · '}
                  {h.when}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {bundle.ticker ? <p className="lf-ko__ticker">{bundle.ticker}</p> : null}
        {firstMatch ? (
          <Link href={FIRST_MATCH_PATHS.intro} className="lf-mp__soft">
            Wstecz · intro
          </Link>
        ) : (
          <Link href="/matches" className="lf-mp__soft">
            Wróć do terminarza
          </Link>
        )}
      </section>
    </div>
  );
}
