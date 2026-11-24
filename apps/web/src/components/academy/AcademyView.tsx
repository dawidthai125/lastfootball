'use client';

import { useActionState } from 'react';

import { LocationHero, SoftLockState, StateBanner, Panel, Button } from '@/components/ui';
import {
  declineAcademyIntake,
  intakeAcademyProspect,
  promoteAcademyProspect,
  takeAcademyCandidate,
  trainAcademyJunior,
  upgradeAcademy,
} from '@/lib/academy/actions';
import {
  ACADEMY_ACTION_INITIAL,
  type AcademyActionState,
  type AcademyDto,
  type AcademyProspectDto,
} from '@/lib/academy';
import { JUNIOR_TRAINING } from '@/lib/academy/levels';
import { formatMoney } from '@/lib/finance/format-money';
import { buyScoutReport } from '@/lib/scouting/actions-report';
import { SCOUT_REPORT_FEE } from '@/lib/scouting/reveal';
import { COACH_GROUP_LABEL, COACH_GROUPS } from '@/lib/training/coach';

function intakeHint(dto: AcademyDto): string {
  if (dto.intakeBlockedReason === 'slots_full') {
    return `Limit perspektyw: ${dto.prospectCount}/${dto.maxProspects}. Wypromuj kogoś, by zrobić miejsce.`;
  }
  const places = `Perspektywy: ${dto.prospectCount}/${dto.maxProspects}`;
  if (dto.intakeBlockedReason === 'offer_open') return `${places}. Kandydaci czekają na decyzję.`;
  if (dto.intakeBlockedReason === 'waiting') {
    return `${places}. Następny nabór za ${days(dto.waitDays)}.`;
  }
  return dto.hasLevels ? `${places}. Nabór otwarty.` : places;
}

function days(count: number): string {
  return `${count} ${count === 1 ? 'dzień' : 'dni'}`;
}

type FormAction = (data: FormData) => void;

/** One state for the page, so the banner always belongs to the last action. */
const ACTIONS = {
  intake: intakeAcademyProspect,
  take: takeAcademyCandidate,
  decline: declineAcademyIntake,
  upgrade: upgradeAcademy,
  train: trainAcademyJunior,
  promote: promoteAcademyProspect,
  report: buyScoutReport,
} as const;

type ActionKind = keyof typeof ACTIONS;

function LevelPanel({
  academy,
  action,
  pending,
}: {
  academy: AcademyDto;
  action: FormAction;
  pending: boolean;
}) {
  const { upgrade } = academy;
  return (
    <section className="mb-3">
      <Panel title={`Poziom akademii: ${academy.level} z 3`} flush>
        <div className="space-y-2 px-2.5 py-2.5 text-[12px] text-[var(--lf-muted)]">
          <p>{academy.summary}</p>
          {upgrade ? (
            <>
              <p>
                Poziom {academy.level + 1}: {upgrade.effects}
              </p>
              <form action={action}>
                <input type="hidden" name="level" value={academy.level} />
                <Button type="submit" disabled={pending || !upgrade.affordable}>
                  {`Rozbuduj · ${formatMoney(upgrade.cost)}`}
                </Button>
              </form>
            </>
          ) : (
            <p>Najwyższy poziom.</p>
          )}
        </div>
      </Panel>
    </section>
  );
}

function OfferPanel({
  offer,
  full,
  takeAction,
  declineAction,
  pending,
}: {
  offer: NonNullable<AcademyDto['offer']>;
  full: boolean;
  takeAction: FormAction;
  declineAction: FormAction;
  pending: boolean;
}) {
  return (
    <section className="mb-3">
      <Panel title="Wybierz jednego kandydata">
        <ul className="grid gap-2 sm:grid-cols-3">
          {offer.candidates.map((candidate) => (
            <li
              key={candidate.index}
              className="border border-[var(--lf-border)] bg-[var(--lf-panel-alt)] p-2.5"
              style={{ borderRadius: 'var(--lf-radius)' }}
            >
              <p className="text-[13px] font-medium text-[var(--lf-text-strong)]">
                {candidate.name}
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--lf-muted)]">
                {candidate.pos} · {candidate.age} lat
              </p>
              <p className="text-[12px] text-[var(--lf-muted)]">
                Potencjał: {candidate.potentialLabel}
              </p>
              <form action={takeAction} className="mt-2">
                <input type="hidden" name="seq" value={offer.seq} />
                <input type="hidden" name="index" value={candidate.index} />
                <Button type="submit" variant="primary" disabled={pending || full}>
                  Wybierz
                </Button>
              </form>
            </li>
          ))}
        </ul>
        <form action={declineAction} className="mt-2">
          <input type="hidden" name="seq" value={offer.seq} />
          <Button type="submit" variant="ghost" disabled={pending}>
            Żaden. Czekam na następny nabór
          </Button>
        </form>
        {full ? (
          <p className="mt-1.5 text-[11px] text-[var(--lf-faint)]">
            Akademia jest pełna. Wypromuj kogoś, żeby wybrać.
          </p>
        ) : null}
      </Panel>
    </section>
  );
}

function JuniorTraining({
  junior,
  action,
  pending,
}: {
  junior: AcademyProspectDto;
  action: FormAction;
  pending: boolean;
}) {
  return (
    <form
      action={action}
      className="flex w-full flex-wrap items-center gap-2 text-[11px] text-[var(--lf-muted)]"
    >
      <input type="hidden" name="playerId" value={junior.id} />
      <select
        name="group"
        defaultValue="attack"
        aria-label={`Grupa treningu: ${junior.name}`}
        className="border border-[var(--lf-border)] bg-[var(--lf-panel-alt)] px-1.5 py-0.5"
      >
        {COACH_GROUPS.map((group) => (
          <option key={group} value={group}>
            {COACH_GROUP_LABEL[group]}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={pending || junior.trainingBlock != null}>
        {`Trenuj +1 · ${formatMoney(JUNIOR_TRAINING.COST)}`}
      </Button>
      <span>
        {junior.seasonGain}/{JUNIOR_TRAINING.SEASON_GAIN} w sezonie
        {junior.trainingBlock ? ` · ${junior.trainingBlock}` : ''}
      </span>
    </form>
  );
}

/**
 * Academy Experience — LFE-ACADEMY-01 Thin A, levels LFE-ACADEMY-02.
 * Decision-first; domain only via resolveClubAcademy + server actions.
 */
export function AcademyView({ academy }: { academy: AcademyDto }) {
  const [state, dispatch, pending] = useActionState(
    (_prev: AcademyActionState, job: { readonly kind: ActionKind; readonly data: FormData }) =>
      ACTIONS[job.kind](ACADEMY_ACTION_INITIAL, job.data),
    ACADEMY_ACTION_INITIAL,
  );
  const run =
    (kind: ActionKind): FormAction =>
    (data) =>
      dispatch({ kind, data });

  if (!academy.unlocked) {
    return (
      <div className="lf-aca" data-lf-impl="LFE-ACADEMY-01">
        <LocationHero waId="HERO-012" src="/assets/world-art/hero-012-academy.png" priority />
        <SoftLockState
          waId="ILL-009"
          illustrationSrc="/assets/world-art/ill-009-youth-prospect.png"
          title="Akademia wkrótce"
          reason="Nabór młodzieży i promocja do seniorów odblokują się po wejściu w sezon."
          unlockHint="Akademia jest opcjonalna — sezon działa bez niej."
          secondaryHref="/squad"
          secondaryLabel="Kadra"
        />
      </div>
    );
  }

  const err = state.error;
  const okMsg = state.ok ? state.message : null;

  return (
    <div className="lf-aca" data-lf-impl="LFE-ACADEMY-01">
      <LocationHero waId="HERO-012" src="/assets/world-art/hero-012-academy.png" priority />

      <header className="mb-3 px-0.5">
        <p className="text-[11px] tracking-wide text-[var(--lf-muted)] uppercase">Akademia</p>
        <h1 className="font-[family-name:var(--font-display)] text-[1.25rem] text-[var(--lf-text-strong)]">
          Budujesz kadrę od młodzieży?
        </h1>
        <p className="mt-1 text-[12px] text-[var(--lf-muted)]">{intakeHint(academy)}</p>
      </header>

      {err ? (
        <div className="mb-3">
          <StateBanner tone="error">{err}</StateBanner>
        </div>
      ) : null}
      {okMsg ? (
        <div className="mb-3">
          <StateBanner tone="info">{okMsg}</StateBanner>
        </div>
      ) : null}

      {academy.hasLevels ? (
        <LevelPanel academy={academy} action={run('upgrade')} pending={pending} />
      ) : null}

      {academy.offer ? (
        <OfferPanel
          offer={academy.offer}
          full={academy.prospectCount >= academy.maxProspects}
          takeAction={run('take')}
          declineAction={run('decline')}
          pending={pending}
        />
      ) : null}

      <section className="mb-3">
        <form action={run('intake')}>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!academy.canIntake || pending}
            className="w-full sm:w-auto"
          >
            {academy.intakeBlockedReason === 'waiting'
              ? `Nabór za ${days(academy.waitDays)}`
              : 'Przeprowadź nabór'}
          </Button>
        </form>
        {!academy.canIntake && academy.intakeBlockedReason === 'slots_full' ? (
          <p className="mt-1.5 text-[11px] text-[var(--lf-faint)]">
            Maksymalna liczba perspektyw naraz: {academy.maxProspects}.
          </p>
        ) : null}
      </section>

      {academy.hasLevels ? (
        <p className="mb-3 px-0.5 text-[11px] text-[var(--lf-faint)]">
          Trening: jeden junior dziennie. Sprzedaż wychowanka komputerowi: 10% wartości, 25% od 10
          meczów, 50% od 22 meczów w seniorach.
        </p>
      ) : null}

      <Panel title="Perspektywy" flush>
        {academy.prospects.length === 0 ? (
          <p className="px-2.5 py-3 text-[12px] text-[var(--lf-muted)]">
            Brak perspektyw. Nabór to świadoma, opcjonalna decyzja — nie obowiązek.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--lf-border)]">
            {academy.prospects.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-2.5"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[var(--lf-text-strong)]">
                    {p.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--lf-muted)]">
                    {p.pos} · {p.age} lat · potencjał: {p.potentialLabel} · {p.careerPhaseLabel}
                  </div>
                  {p.lastSeason ? (
                    <div className="mt-0.5 text-[11px] text-[var(--lf-danger)]">
                      Ostatni sezon w akademii. Wypromuj go, inaczej odejdzie przed następnym.
                    </div>
                  ) : null}
                </div>
                <form action={run('promote')}>
                  <input type="hidden" name="playerId" value={p.id} />
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={!academy.canPromote || pending}
                  >
                    Promuj
                  </Button>
                </form>
                {p.potentialLabel === 'Sufit ukryty' ? (
                  <form action={run('report')}>
                    <input type="hidden" name="playerId" value={p.id} />
                    <Button type="submit" variant="default" size="sm" disabled={pending}>
                      {`Raport ${formatMoney(SCOUT_REPORT_FEE)}`}
                    </Button>
                  </form>
                ) : null}
                {academy.hasLevels ? (
                  <JuniorTraining junior={p} action={run('train')} pending={pending} />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
