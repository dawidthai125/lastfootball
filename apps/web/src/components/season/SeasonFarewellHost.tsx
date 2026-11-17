'use client';

import { useActionState } from 'react';

import { StateBanner } from '@/components/ui';
import { confirmStartNextSeason } from '@/lib/season/confirm-start-next-season';
import { CONFIRM_START_NEXT_SEASON_INITIAL } from '@/lib/season/action-types';
import type { RetirementFarewell } from '@/lib/season/departure';
import { UI_COPY } from '@/lib/ui/copy';

/**
 * Confirm N+1 + post–Confirm retirement farewell (LFE-RETIREMENT-01).
 * Client host stays mounted across OFFSEASON→SEASON so useActionState farewell survives.
 */
export function SeasonFarewellHost({
  showConfirm,
  confirmLabel,
  serverFarewell = null,
}: {
  showConfirm: boolean;
  confirmLabel: string;
  serverFarewell?: RetirementFarewell | null;
}) {
  const [state, action, pending] = useActionState(
    confirmStartNextSeason,
    CONFIRM_START_NEXT_SEASON_INITIAL,
  );
  const farewell = state.farewell ?? serverFarewell;

  return (
    <>
      {farewell ? <RetirementFarewellBanner farewell={farewell} /> : null}
      {showConfirm ? (
        <form action={action} className="lf-hub__primary-wrap">
          <button
            type="submit"
            data-hub-primary-cta="prepare-next-season"
            className="lf-hub__primary lf-motion-press"
            disabled={pending}
          >
            {pending ? UI_COPY.saving : confirmLabel}
          </button>
          {state.error ? (
            <p className="lf-hub__confirm-error" role="alert">
              {state.error}
            </p>
          ) : null}
        </form>
      ) : null}
    </>
  );
}

export function RetirementFarewellBanner({ farewell }: { farewell: RetirementFarewell }) {
  return (
    <div className="lf-hub__farewell" data-retirement-farewell="">
      <StateBanner tone="info">
        <p data-farewell-retire="">
          {farewell.retireName} zakończył karierę.
          {farewell.promoteName ? (
            <>
              {' '}
              <span data-farewell-promote="">Wchodzi {farewell.promoteName}.</span>
            </>
          ) : null}
        </p>
      </StateBanner>
    </div>
  );
}
