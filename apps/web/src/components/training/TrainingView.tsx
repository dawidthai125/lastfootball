'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';

import { LocationHero, SoftLockState, StateBanner } from '@/components/ui';
import { runTrainingSession } from '@/lib/training/actions';
import { hireClubCoach } from '@/lib/training/actions-coach';
import {
  hireClubAssistant,
  hireClubPhysio,
  runIndividualSession,
  savePressTone,
} from '@/lib/training/actions-depth';
import { savePressLine } from '@/lib/training/actions-press-line';
import { savePressShape } from '@/lib/training/actions-press-shape';
import { TRAINING_ACTION_INITIAL } from '@/lib/training/action-types';
import { COACH_GROUP_LABEL, COACH_GROUPS, COACH_THIN, type CoachGroup } from '@/lib/training/coach';
import { pressLineLabel, pressShapeLabel } from '@/lib/training/press-line';
import { kickoffPressing, kickoffTempo, kickoffWidth, STYLE_THIN } from '@/lib/training/style';
import type { TrainingDto, TrainingFocusId, TrainingIntensityId } from '@/lib/training/types';
import { formatMoney } from '@/lib/finance/format-money';
import { resolveNavLockLabel, resolveNavLockReason } from '@/lib/nav-lock-copy';
import { Button } from '@/components/ui';

import './training-decision.css';

function lockCopy(dto: TrainingDto): string {
  switch (dto.lockReason) {
    case 'not_unlocked':
      return resolveNavLockReason('training', dto.playedCount);
    case 'already_trained_today':
      return 'Dzisiejsza sesja już odbyta. Wróć jutro (dzień UTC).';
    case 'squad_unavailable':
      return 'Brak aktywnej kadry — trening niedostępny.';
    default:
      return 'Sesja treningowa jest teraz niedostępna.';
  }
}

function lockTitle(dto: TrainingDto): string {
  switch (dto.lockReason) {
    case 'not_unlocked':
      return resolveNavLockLabel('training', 'Trening', dto.playedCount);
    case 'already_trained_today':
      return 'Trening na dziś zakończony';
    case 'squad_unavailable':
      return 'Brak kadry do treningu';
    default:
      return 'Trening jeszcze niedostępny';
  }
}

/**
 * Training Experience — LFE-UI-IMPL-03 / HF-TRN-01 · HF-TRN-02 · LFE-TRAINING-02 feedback.
 * Decision-first; domain via resolveClubTraining + runTrainingSession.
 */
export function TrainingView({
  training,
  coachGroup = null,
  cash = 0,
  stylePressing = 0,
  styleTempo = 0,
  styleWidth = 0,
  physio = false,
  assistantGroup = null,
  players = [],
  pressFixtureId = null,
  pressDone = false,
  pressLine = 'mid',
  pressShape = 'flat',
}: {
  training: TrainingDto;
  coachGroup?: CoachGroup | null;
  cash?: number;
  stylePressing?: number;
  styleTempo?: number;
  styleWidth?: number;
  physio?: boolean;
  assistantGroup?: CoachGroup | null;
  players?: readonly { id: string; name: string; energy: number }[];
  pressFixtureId?: string | null;
  pressDone?: boolean;
  pressLine?: string;
  pressShape?: string;
}) {
  const [focusId, setFocusId] = useState<TrainingFocusId>(training.defaults.focusId);
  const [intensityId, setIntensityId] = useState<TrainingIntensityId>(
    training.defaults.intensityId,
  );
  const [state, action, pending] = useActionState(runTrainingSession, TRAINING_ACTION_INITIAL);
  const [coachState, coachAction, coachPending] = useActionState(
    hireClubCoach,
    TRAINING_ACTION_INITIAL,
  );
  const [physioState, physioAction, physioPending] = useActionState(
    hireClubPhysio,
    TRAINING_ACTION_INITIAL,
  );
  const [assistantState, assistantAction, assistantPending] = useActionState(
    hireClubAssistant,
    TRAINING_ACTION_INITIAL,
  );
  const [individualState, individualAction, individualPending] = useActionState(
    runIndividualSession,
    TRAINING_ACTION_INITIAL,
  );
  const [pressState, pressAction, pressPending] = useActionState(
    savePressTone,
    TRAINING_ACTION_INITIAL,
  );
  const [lineState, lineAction, linePending] = useActionState(
    savePressLine,
    TRAINING_ACTION_INITIAL,
  );
  const [shapeState, shapeAction, shapePending] = useActionState(
    savePressShape,
    TRAINING_ACTION_INITIAL,
  );

  if (!training.unlocked || training.lockReason === 'squad_unavailable') {
    return (
      <div className="lf-tr" data-lf-impl="LFE-UI-IMPL-03">
        <LocationHero waId="HERO-006" src="/assets/world-art/hero-006-training.png" priority />
        <SoftLockState
          waId="ILL-002"
          illustrationSrc="/assets/world-art/ill-002-softlock-training.png"
          title={lockTitle(training)}
          reason={lockCopy(training)}
          unlockHint={`Rozegrane: ${training.playedCount}/${training.playedRequired} · Dziś (UTC): ${training.today}`}
          secondaryHref="/squad"
          secondaryLabel="Kadra"
        />
      </div>
    );
  }

  const r = training.readiness;
  const isRegen = focusId === 'regeneration';
  const hasFeedback =
    (state.ok && !state.skipped) || (state.ok && state.skipped) || Boolean(state.error);

  return (
    <div className="lf-tr" data-lf-impl="LFE-UI-IMPL-03">
      <LocationHero waId="HERO-006" src="/assets/world-art/hero-006-training.png" priority />

      {training.moraleHint ? (
        <StateBanner tone="info">
          {training.moraleHint}{' '}
          <Link href="/messages" className="lf-tr__morale-link">
            Wiadomości
          </Link>
        </StateBanner>
      ) : null}

      <p className="lf-tr__meta">
        Pressing klubu: {stylePressing}/{STYLE_THIN.CAP}. Na meczu, który prowadzisz, startuje z{' '}
        {kickoffPressing(stylePressing)}. Taktyka normalna albo wysoka podnosi to o 1. Tempo klubu:{' '}
        {styleTempo}/{STYLE_THIN.CAP}, start z {kickoffTempo(styleTempo)}. Technika normalna albo
        wysoka podnosi tempo o 1. Szerokość klubu: {styleWidth}/{STYLE_THIN.CAP}, start z{' '}
        {kickoffWidth(styleWidth)}. Fizyczny normalny albo wysoki podnosi szerokość o 1. Te nawyki
        zostają na kolejne mecze.
      </p>

      <section className="lf-tr__block" aria-label="Trener">
        <h3 className="lf-tr__block-title">Trener</h3>
        <p className="lf-tr__meta">
          {coachGroup
            ? `Podnosi plon treningu w grupie: ${COACH_GROUP_LABEL[coachGroup]}.`
            : 'Brak trenera. Jeden trener podnosi tylko jedną grupę atrybutów.'}
        </p>
        {coachState.error ? (
          <p className="lf-tr__regen-note" role="alert">
            {coachState.error}
          </p>
        ) : null}
        <div className="lf-tr__focus-grid">
          {COACH_GROUPS.map((group) => (
            <form key={group} action={coachAction}>
              <input type="hidden" name="group" value={group} />
              <Button
                type="submit"
                variant={coachGroup === group ? 'primary' : 'default'}
                disabled={coachPending || (coachGroup !== group && cash < COACH_THIN.HIRE_FEE)}
              >
                {coachGroup === group
                  ? COACH_GROUP_LABEL[group]
                  : `${COACH_GROUP_LABEL[group]} · ${formatMoney(COACH_THIN.HIRE_FEE)}`}
              </Button>
            </form>
          ))}
        </div>
      </section>

      <section className="lf-tr__block" aria-label="Sztab">
        <h3 className="lf-tr__block-title">Sztab</h3>
        <p className="lf-tr__meta">
          {physio
            ? 'Fizjoterapeuta skraca kontuzję o jeden mecz.'
            : `Fizjoterapeuta · ${formatMoney(COACH_THIN.HIRE_FEE)}. Skraca kontuzję o jeden mecz.`}
          {assistantGroup
            ? ` Asystent podnosi grupę: ${COACH_GROUP_LABEL[assistantGroup]}, jeśli to nie grupa trenera.`
            : ' Asystent podnosi jedną grupę, inną niż trener.'}
        </p>
        {physioState.error ? (
          <p className="lf-tr__regen-note" role="alert">
            {physioState.error}
          </p>
        ) : null}
        {assistantState.error ? (
          <p className="lf-tr__regen-note" role="alert">
            {assistantState.error}
          </p>
        ) : null}
        {!physio ? (
          <form action={physioAction}>
            <Button type="submit" disabled={physioPending || cash < COACH_THIN.HIRE_FEE}>
              {physioPending ? 'Zapisuję…' : `Fizjoterapeuta · ${formatMoney(COACH_THIN.HIRE_FEE)}`}
            </Button>
          </form>
        ) : null}
        <div className="lf-tr__focus-grid">
          {COACH_GROUPS.map((group) => (
            <form key={`assistant-${group}`} action={assistantAction}>
              <input type="hidden" name="group" value={group} />
              <Button
                type="submit"
                variant={assistantGroup === group ? 'primary' : 'default'}
                disabled={
                  assistantPending || (assistantGroup !== group && cash < COACH_THIN.HIRE_FEE)
                }
              >
                {assistantGroup === group
                  ? `Asystent · ${COACH_GROUP_LABEL[group]}`
                  : `Asystent · ${COACH_GROUP_LABEL[group]} · ${formatMoney(COACH_THIN.HIRE_FEE)}`}
              </Button>
            </form>
          ))}
        </div>
      </section>

      {training.individualAvailable && players.length > 0 ? (
        <section className="lf-tr__block" aria-label="Trening indywidualny">
          <h3 className="lf-tr__block-title">Trening indywidualny</h3>
          <p className="lf-tr__meta">
            Jeden zawodnik dziennie, jedna grupa. Kosztuje 8 energii. Nie rusza ogólnej
            umiejętności.
          </p>
          {individualState.error ? (
            <p className="lf-tr__regen-note" role="alert">
              {individualState.error}
            </p>
          ) : null}
          {individualState.ok ? <p className="lf-tr__meta">Zapisane.</p> : null}
          <form action={individualAction} className="lf-tr__focus-grid">
            <select name="playerId" defaultValue={players[0]?.id}>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name} · energia {player.energy}
                </option>
              ))}
            </select>
            <select name="group" defaultValue="attack">
              {COACH_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {COACH_GROUP_LABEL[group]}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={individualPending}>
              {individualPending ? 'Trening…' : 'Trenuj jednego'}
            </Button>
          </form>
        </section>
      ) : null}

      <section className="lf-tr__block" aria-label="Linia pressingu">
        <h3 className="lf-tr__block-title">Linia pressingu</h3>
        <p className="lf-tr__meta">
          Teraz: {pressLineLabel(pressLine)}. Wysoka linia podnosi pressing na rozpoczęcie o 4,
          niska obniża o 4.
        </p>
        {lineState.error ? (
          <p className="lf-tr__regen-note" role="alert">
            {lineState.error}
          </p>
        ) : null}
        <div className="lf-tr__focus-grid">
          {(
            [
              ['high', 'Wysoki'],
              ['mid', 'Środek'],
              ['low', 'Niski'],
            ] as const
          ).map(([line, label]) => (
            <form key={line} action={lineAction}>
              <input type="hidden" name="line" value={line} />
              <Button
                type="submit"
                variant={pressLine === line ? 'primary' : 'default'}
                disabled={linePending}
              >
                {label}
              </Button>
            </form>
          ))}
        </div>
      </section>

      <section className="lf-tr__block" aria-label="Kształt pressingu">
        <h3 className="lf-tr__block-title">Kształt pressingu</h3>
        <p className="lf-tr__meta">
          Teraz: {pressShapeLabel(pressShape)}. Lewa albo prawa wysoko dodaje 2 do startu,
          rozciągnięty dodaje 1.
        </p>
        {shapeState.error ? (
          <p className="lf-tr__regen-note" role="alert">
            {shapeState.error}
          </p>
        ) : null}
        <div className="lf-tr__focus-grid">
          {(
            [
              ['flat', 'Równo'],
              ['left_high', 'Lewa'],
              ['right_high', 'Prawa'],
              ['split', 'Rozciągnięty'],
            ] as const
          ).map(([shape, label]) => (
            <form key={shape} action={shapeAction}>
              <input type="hidden" name="shape" value={shape} />
              <Button
                type="submit"
                variant={pressShape === shape ? 'primary' : 'default'}
                disabled={shapePending}
              >
                {label}
              </Button>
            </form>
          ))}
        </div>
      </section>

      {pressFixtureId ? (
        <section className="lf-tr__block" aria-label="Konferencja">
          <h3 className="lf-tr__block-title">Konferencja</h3>
          <p className="lf-tr__meta">
            {pressDone
              ? 'Po ostatnim meczu już mówiono.'
              : 'Jedna wypowiedź po meczu rusza morale całej kadry o 2 w górę, w dół, albo wcale.'}
          </p>
          {pressState.error ? (
            <p className="lf-tr__regen-note" role="alert">
              {pressState.error}
            </p>
          ) : null}
          {!pressDone ? (
            <div className="lf-tr__focus-grid">
              {(
                [
                  ['praise', 'Pochwała'],
                  ['calm', 'Spokój'],
                  ['criticize', 'Krytyka'],
                ] as const
              ).map(([tone, label]) => (
                <form key={tone} action={pressAction}>
                  <input type="hidden" name="fixtureId" value={pressFixtureId} />
                  <input type="hidden" name="tone" value={tone} />
                  <Button type="submit" disabled={pressPending}>
                    {label}
                  </Button>
                </form>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <header className="lf-tr__hero">
        <p className="lf-tr__status">
          {training.canTrain ? 'Sesja dostępna' : lockTitle(training)}
        </p>
        <h1 className="lf-tr__question">Jaki trening wykonujesz dzisiaj?</h1>
        <p className="lf-tr__meta">
          Rozegrane: {training.playedCount} · Dziś (UTC): {training.today}
        </p>
      </header>

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

      <form action={action} className="lf-tr__cta-wrap">
        <input type="hidden" name="focusId" value={focusId} />
        <input type="hidden" name="intensityId" value={intensityId} />
        {!training.canTrain ? <p className="lf-tr__meta">{lockCopy(training)}</p> : null}
        <button type="submit" className="lf-tr__primary" disabled={pending || !training.canTrain}>
          {pending ? 'Trening…' : 'Przeprowadź trening'}
        </button>
        <Link href="/squad" className="lf-tr__secondary">
          Kadra
        </Link>
        <Link href="/hub" className="lf-tr__secondary">
          Hub
        </Link>
      </form>

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

      {hasFeedback ? (
        <div className="lf-tr__feedback" aria-live="polite">
          {state.ok && !state.skipped && state.summary ? (
            <p className="lf-tr__feedback-msg lf-tr__feedback-msg--ok">
              Sesja zapisana · Trenowało <strong>{state.summary.trained}</strong>
              {' · '}
              Zmęczeni <strong>{state.summary.tired}</strong>
              {' · '}
              Zregenerowani <strong>{state.summary.regenerated}</strong>
              {' · '}
              Wyższa umiejętność <strong>{state.summary.skillUp}</strong>
              {state.summary.skillUpNames && state.summary.skillUpNames.length > 0 ? (
                <>
                  {': '}
                  {state.summary.skillUpNames.map((player, index) => (
                    <span key={player.id}>
                      {index > 0 ? ', ' : null}
                      <Link href={`/players/${player.id}`}>{player.name}</Link>
                    </span>
                  ))}
                </>
              ) : null}
              {' — '}
              <Link href="/squad">Kadra</Link>
            </p>
          ) : null}
          {state.ok && state.skipped ? (
            <p className="lf-tr__feedback-msg lf-tr__feedback-msg--muted">
              Sesja na dziś była już zapisana.
            </p>
          ) : null}
          {state.error ? <StateBanner tone="error">{state.error}</StateBanner> : null}
        </div>
      ) : null}
    </div>
  );
}
