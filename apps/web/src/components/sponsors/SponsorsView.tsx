'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { LocationHero, Panel, Button, StateBanner } from '@/components/ui';
import { acceptSponsorRenewal, claimSponsorBonus } from '@/lib/sponsors/actions';
import { SPONSOR_ACTION_INITIAL, type ClubSponsorsDto } from '@/lib/sponsors';
import { UI_COPY } from '@/lib/ui/copy';

function bonusStateLabel(state: ClubSponsorsDto['bonusState']): string {
  switch (state) {
    case 'claimable':
      return 'Gotowy do odbioru';
    case 'claimed':
      return 'Odebrany';
    default:
      return 'Niedostępny';
  }
}

/**
 * Sponsors Experience — LFE-SPONSORS-01 Thin.
 * Domain only via resolveClubSponsors + server actions (D96 · D97 · D98).
 */
export function SponsorsView({ sponsors }: { sponsors: ClubSponsorsDto }) {
  const [claimState, claimAction, claimPending] = useActionState(
    claimSponsorBonus,
    SPONSOR_ACTION_INITIAL,
  );
  const [renewState, renewAction, renewPending] = useActionState(
    acceptSponsorRenewal,
    SPONSOR_ACTION_INITIAL,
  );

  const err = claimState.error || renewState.error;

  return (
    <div className="lf-sp" data-lf-impl="LFE-SPONSORS-01">
      <LocationHero waId="HERO-007" src="/assets/world-art/hero-007-finance-ledger.png" priority />

      <header className="mb-3 px-0.5">
        <p className="text-[11px] tracking-wide text-[var(--lf-muted)] uppercase">Sponsorzy</p>
        <h1 className="font-[family-name:var(--font-display)] text-[1.25rem] text-[var(--lf-text-strong)]">
          {sponsors.brandName}
        </h1>
        <p className="mt-1 text-[12px] text-[var(--lf-muted)]">
          {sponsors.seasonLabel} · przychód bazowy {sponsors.basePayoutLabel}
        </p>
      </header>

      {err ? (
        <div className="mb-3">
          <StateBanner tone="error">{err}</StateBanner>
        </div>
      ) : null}

      <Panel title="Cel sezonowy" flush>
        <div className="space-y-1.5 px-2.5 py-2.5 text-[13px]">
          <p className="text-[var(--lf-text-strong)]">{sponsors.goal.label}</p>
          <p className="text-[12px] text-[var(--lf-muted)]">{sponsors.goal.progressLabel}</p>
          <p className="text-[12px] text-[var(--lf-muted)]">
            Bonus {sponsors.bonusLabel} · {bonusStateLabel(sponsors.bonusState)}
          </p>
          {sponsors.bonusState === 'claimable' ? (
            <form action={claimAction} className="pt-1">
              <Button type="submit" variant="primary" size="md" disabled={claimPending}>
                {claimPending ? 'Wypłata…' : `Odbierz bonus ${sponsors.bonusLabel}`}
              </Button>
            </form>
          ) : null}
          {sponsors.bonusState === 'claimed' ? (
            <p className="text-[11px] text-[var(--lf-faint)]">Bonus już wypłacony na kasę klubu.</p>
          ) : null}
        </div>
      </Panel>

      {sponsors.renewal ? (
        <div className="mt-3">
          <Panel title="Odnowienie (opcjonalne)" flush>
            <div className="space-y-1.5 px-2.5 py-2.5 text-[13px]">
              <p className="text-[12px] text-[var(--lf-muted)]">{sponsors.renewal.summaryLabel}</p>
              {sponsors.renewal.accepted ? (
                <p className="text-[12px] text-[var(--lf-text-strong)]">Zaakceptowano.</p>
              ) : (
                <form action={renewAction}>
                  <Button type="submit" variant="default" size="md" disabled={renewPending}>
                    {renewPending ? 'Zapisywanie…' : 'Zaakceptuj odnowienie'}
                  </Button>
                </form>
              )}
              <p className="text-[11px] text-[var(--lf-faint)]">
                Start kolejnego sezonu potwierdzasz na Hubie — ta akcja go nie blokuje.
              </p>
            </div>
          </Panel>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/hub"
          className="text-[13px] text-[var(--lf-color-accent)] underline-offset-2 hover:underline"
        >
          {UI_COPY.hubExit}
        </Link>
        <Link
          href="/finance"
          className="text-[13px] text-[var(--lf-muted)] underline-offset-2 hover:underline"
        >
          Finanse
        </Link>
      </div>
    </div>
  );
}
