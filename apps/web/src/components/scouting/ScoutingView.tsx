'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { SoftLockState, StateBanner, Panel, Button } from '@/components/ui';
import { addScoutShortlist, removeScoutShortlist } from '@/lib/scouting/actions';
import {
  SCOUTING_ACTION_INITIAL,
  type ScoutingCandidateDto,
  type ScoutingDto,
} from '@/lib/scouting';

function CandidateRow({
  c,
  removeAction,
  addAction,
  pending,
}: {
  c: ScoutingCandidateDto;
  removeAction: (payload: FormData) => void;
  addAction: (payload: FormData) => void;
  pending: boolean;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-2.5">
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-[var(--lf-text-strong)]">{c.name}</div>
        <div className="mt-0.5 text-[11px] text-[var(--lf-muted)]">
          {c.pos} · {c.age} lat · potencjał: {c.potentialLabel}
          {c.listed ? ' · na liście transferowej' : ''}
          {c.source === 'market_listed' ? ' · rynek' : ' · kadra'}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={c.ctaHref}
          className="text-[12px] text-[var(--lf-color-gold-base)] underline-offset-2 hover:underline"
        >
          {c.ctaLabel} →
        </Link>
        {c.onShortlist ? (
          <form action={removeAction}>
            <input type="hidden" name="playerId" value={c.playerId} />
            <Button type="submit" variant="default" size="sm" disabled={pending}>
              {pending ? '…' : 'Usuń'}
            </Button>
          </form>
        ) : (
          <form action={addAction}>
            <input type="hidden" name="playerId" value={c.playerId} />
            <Button type="submit" variant="default" size="sm" disabled={pending}>
              {pending ? '…' : 'Shortlista'}
            </Button>
          </form>
        )}
      </div>
    </li>
  );
}

/**
 * Scouting Experience — LFE-SCOUTING-01 Information Thin.
 * Organizes facts; never scores players. Domain only via resolveClubScouting.
 */
export function ScoutingView({ scouting }: { scouting: ScoutingDto }) {
  const [addState, addAction, addPending] = useActionState(
    addScoutShortlist,
    SCOUTING_ACTION_INITIAL,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeScoutShortlist,
    SCOUTING_ACTION_INITIAL,
  );
  const pending = addPending || removePending;

  if (!scouting.unlocked) {
    return (
      <div className="lf-sco" data-lf-impl="LFE-SCOUTING-01">
        <SoftLockState
          waId="ILL-003"
          illustrationSrc="/assets/world-art/ill-003-window-closed.png"
          title="Skauting wkrótce"
          reason="Porządkowanie informacji o kadrze i rynku odblokuje się w sezonie."
          unlockHint="Skauting jest opcjonalny — decyzje podejmujesz Ty, nie raport."
          secondaryHref="/hub"
          secondaryLabel="Hub"
        />
      </div>
    );
  }

  const err = addState.error || removeState.error;
  const okMsg =
    (addState.ok && addState.message) || (removeState.ok && removeState.message) || null;

  const marketCandidates = scouting.candidates.filter((c) => c.source === 'market_listed');
  const ownCandidates = scouting.candidates.filter((c) => c.source === 'own_senior');

  return (
    <div className="lf-sco" data-lf-impl="LFE-SCOUTING-01">
      <header className="mb-3 px-0.5">
        <p className="text-[11px] tracking-wide text-[var(--lf-muted)] uppercase">Skauting</p>
        <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] text-[var(--lf-text-strong)]">
          Porządkujesz informacje przed decyzją?
        </h2>
        <p className="mt-1 text-[12px] text-[var(--lf-muted)]">
          Shortlista: {scouting.shortlistCount}/{scouting.maxShortlist}
          {scouting.windowOpen ? ' · okno transferowe otwarte' : ' · okno zamknięte'} — ocena zawsze
          należy do Ciebie.
        </p>
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

      <Panel title="Twoja shortlista" flush className="mb-3">
        {scouting.shortlist.length === 0 ? (
          <p className="px-2.5 py-3 text-[12px] text-[var(--lf-muted)]">
            Pusta. Shortlista to prywatna organizacja pracy — nie ranking i nie oferta.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--lf-border)]">
            {scouting.shortlist.map((c) => (
              <CandidateRow
                key={c.playerId}
                c={c}
                addAction={addAction}
                removeAction={removeAction}
                pending={pending}
              />
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Rynek (listed)" flush className="mb-3">
        {marketCandidates.length === 0 ? (
          <p className="px-2.5 py-3 text-[12px] text-[var(--lf-muted)]">
            Brak żywych listingów H2H. Decyzje kupna wyłącznie w Transferach.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--lf-border)]">
            {marketCandidates.map((c) => (
              <CandidateRow
                key={c.playerId}
                c={c}
                addAction={addAction}
                removeAction={removeAction}
                pending={pending}
              />
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Kadra seniorów" flush>
        {ownCandidates.length === 0 ? (
          <p className="px-2.5 py-3 text-[12px] text-[var(--lf-muted)]">Brak seniorów w kadrze.</p>
        ) : (
          <ul className="divide-y divide-[var(--lf-border)]">
            {ownCandidates.map((c) => (
              <CandidateRow
                key={c.playerId}
                c={c}
                addAction={addAction}
                removeAction={removeAction}
                pending={pending}
              />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
