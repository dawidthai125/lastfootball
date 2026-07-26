'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';

import { runTrainingSession } from '@/lib/training/actions';
import { TRAINING_ACTION_INITIAL } from '@/lib/training/action-types';
import type { TrainingDto, TrainingFocusId, TrainingIntensityId } from '@/lib/training/types';

import './training-decision.css';

function lockCopy(dto: TrainingDto): string {
  switch (dto.lockReason) {
    case 'not_unlocked':
      return `Trening odblokuje się po ${dto.playedRequired} rozegranych meczach ligowych (masz ${dto.playedCount}).`;
    case 'already_trained_today':
      return 'Dzisiejsza sesja już odbyta. Wróć jutro (dzień UTC).';
    case 'squad_unavailable':
      return 'Brak aktywnej kadry — trening niedostępny.';
    default:
      return '';
  }
}

/**
 * Training Experience — LFE-UI-EVOLUTION-01F.
 * Decision-first presentation; training action/DTO unchanged.
 */
export function TrainingView({ training }: { training: TrainingDto }) {
  const [focusId, setFocusId] = useState<TrainingFocusId>(training.defaults.focusId);
  const [intensityId, setIntensityId] = useState<TrainingIntensityId>(
    training.defaults.intensityId,
  );
  const [state, action, pending] = useActionState(runTrainingSession, TRAINING_ACTION_INITIAL);

  const r = training.readiness;
  const isRegen = focusId === 'regeneration';
  const lockMessage = !training.canTrain ? lockCopy(training) : '';
  const statusLabel = training.canTrain ? 'Sesja dostępna' : 'Sesja niedostępna';

  const hasFeedback =
    (state.ok && !state.skipped) || (state.ok && state.skipped) || Boolean(state.error);

  return (
    <div className="lf-tr">
      {/* M2 — Training Hero (D2 / D7: stays primary after submit) */}
      <header className="lf-tr__hero">
        <p className={training.canTrain ? 'lf-tr__status' : 'lf-tr__status lf-tr__status--locked'}>
          {statusLabel}
        </p>
        <h2 className="lf-tr__question">Jaki trening wykonujesz dzisiaj?</h2>
        <p className="lf-tr__meta">
          Rozegrane: {training.playedCount}/{training.playedRequired} · Dziś (UTC): {training.today}
        </p>
        {lockMessage ? <p className="lf-tr__lock-note">{lockMessage}</p> : null}
      </header>

      {/* M3 — Focus (primary decision) */}
      <section className="lf-tr__block" aria-labelledby="lf-tr-focus-title">
        <h3 id="lf-tr-focus-title" className="lf-tr__block-title">
          Fokus
        </h3>
        <div className="lf-tr__focus-grid" role="group" aria-label="Fokus zespołowy">
          {training.focuses.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFocusId(f.id)}
              className={focusId === f.id ? 'lf-tr__choice lf-tr__choice--active' : 'lf-tr__choice'}
              aria-pressed={focusId === f.id}
            >
              <span className="lf-tr__choice-label">{f.label}</span>
              <span className="lf-tr__choice-desc">{f.description}</span>
            </button>
          ))}
        </div>
      </section>

      {/* M3 — Intensity (supporting) */}
      <section className="lf-tr__block" aria-labelledby="lf-tr-intensity-title">
        <h3 id="lf-tr-intensity-title" className="lf-tr__block-title lf-tr__block-title--support">
          Intensywność
        </h3>
        {isRegen ? (
          <p className="lf-tr__regen-note">
            Przy regeneracji intensywność nie zmienia efektu — kadra odpoczywa.
          </p>
        ) : (
          <div className="lf-tr__intensity-row" role="group" aria-label="Intensywność">
            {training.intensities.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => setIntensityId(i.id)}
                className={
                  intensityId === i.id
                    ? 'lf-tr__choice lf-tr__choice--intensity lf-tr__choice--active'
                    : 'lf-tr__choice lf-tr__choice--intensity'
                }
                aria-pressed={intensityId === i.id}
              >
                <span className="lf-tr__choice-label">{i.label}</span>
                <span className="lf-tr__choice-desc">{i.description}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* M3 — Primary CTA (D1); D5: same action / hidden / disabled */}
      <form action={action} className="lf-tr__cta-wrap">
        <input type="hidden" name="focusId" value={focusId} />
        <input type="hidden" name="intensityId" value={intensityId} />
        <button type="submit" className="lf-tr__primary" disabled={!training.canTrain || pending}>
          {pending ? 'Trening…' : 'Przeprowadź trening'}
        </button>
        <Link href="/squad" className="lf-tr__secondary">
          Skład
        </Link>
      </form>

      {/* M4 — Readiness under CTA (D4 / D6) */}
      <section className="lf-tr__readiness" aria-labelledby="lf-tr-readiness-label">
        <p id="lf-tr-readiness-label" className="lf-tr__readiness-label">
          Gotowość kadry
        </p>
        <p className="lf-tr__readiness-line">
          Gotowi <strong>{r.ready}</strong>
          {' · '}
          Zmęczeni <strong>{r.tired}</strong>
          {' · '}
          Kontuzje <strong>{r.injured}</strong>
          {' · '}
          Zawieszeni <strong>{r.suspended}</strong>
          {' · '}
          Aktywni <strong>{r.active}</strong>
        </p>
      </section>

      {/* M4 — Feedback below readiness (D7: never replaces Hero) */}
      {hasFeedback ? (
        <div className="lf-tr__feedback" aria-live="polite">
          {state.ok && !state.skipped ? (
            <p className="lf-tr__feedback-msg lf-tr__feedback-msg--ok">
              Sesja zapisana. Statusy kadry zaktualizowane — sprawdź{' '}
              <Link href="/squad">Skład</Link>.
            </p>
          ) : null}
          {state.ok && state.skipped ? (
            <p className="lf-tr__feedback-msg lf-tr__feedback-msg--muted">
              Sesja na dziś była już zapisana.
            </p>
          ) : null}
          {state.error ? (
            <p className="lf-tr__feedback-msg lf-tr__feedback-msg--error" role="alert">
              {state.error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
