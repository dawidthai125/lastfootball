'use client';

import { useActionState } from 'react';

import { LocationHero, SoftLockState, StateBanner, Panel, Button } from '@/components/ui';
import { intakeAcademyProspect, promoteAcademyProspect } from '@/lib/academy/actions';
import { ACADEMY_ACTION_INITIAL, type AcademyDto } from '@/lib/academy';

function intakeHint(dto: AcademyDto): string {
  if (dto.intakeBlockedReason === 'slots_full') {
    return `Limit perspektyw: ${dto.prospectCount}/${dto.maxProspects}. Wypromuj kogoś, by zrobić miejsce.`;
  }
  return `Perspektywy: ${dto.prospectCount}/${dto.maxProspects}`;
}

/**
 * Academy Experience — LFE-ACADEMY-01 Thin A.
 * Decision-first; domain only via resolveClubAcademy + server actions.
 */
export function AcademyView({ academy }: { academy: AcademyDto }) {
  const [intakeState, intakeAction, intakePending] = useActionState(
    intakeAcademyProspect,
    ACADEMY_ACTION_INITIAL,
  );
  const [promoteState, promoteAction, promotePending] = useActionState(
    promoteAcademyProspect,
    ACADEMY_ACTION_INITIAL,
  );

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

  const err = intakeState.error || promoteState.error;
  const okMsg =
    (intakeState.ok && intakeState.message) || (promoteState.ok && promoteState.message) || null;

  return (
    <div className="lf-aca" data-lf-impl="LFE-ACADEMY-01">
      <LocationHero waId="HERO-012" src="/assets/world-art/hero-012-academy.png" priority />

      <header className="mb-3 px-0.5">
        <p className="text-[11px] tracking-wide text-[var(--lf-muted)] uppercase">Akademia</p>
        <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] text-[var(--lf-text-strong)]">
          Budujesz kadrę od młodzieży?
        </h2>
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

      <section className="mb-3">
        <form action={intakeAction}>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!academy.canIntake || intakePending}
            className="w-full sm:w-auto"
          >
            {intakePending ? 'Nabór…' : 'Przeprowadź nabór'}
          </Button>
        </form>
        {!academy.canIntake && academy.intakeBlockedReason === 'slots_full' ? (
          <p className="mt-1.5 text-[11px] text-[var(--lf-faint)]">
            Maksymalnie {academy.maxProspects} perspektywy naraz.
          </p>
        ) : null}
      </section>

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
                    {p.pos} · {p.age} lat · potencjał: {p.potentialLabel}
                  </div>
                </div>
                <form action={promoteAction}>
                  <input type="hidden" name="playerId" value={p.id} />
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={!academy.canPromote || promotePending}
                  >
                    {promotePending ? '…' : 'Promuj'}
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
