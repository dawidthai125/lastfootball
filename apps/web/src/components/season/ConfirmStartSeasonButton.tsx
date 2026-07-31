'use client';

import { useActionState } from 'react';

import { confirmStartNextSeason } from '@/lib/season/confirm-start-next-season';
import { CONFIRM_START_NEXT_SEASON_INITIAL } from '@/lib/season/action-types';
import { UI_COPY } from '@/lib/ui/copy';

/**
 * Confirm N+1 — sole mutation into Season N+1 (D85).
 * Presentation: Primary CTA form; not part of read-only report (D86).
 */
export function ConfirmStartSeasonButton({ label }: { label: string }) {
  const [state, action, pending] = useActionState(
    confirmStartNextSeason,
    CONFIRM_START_NEXT_SEASON_INITIAL,
  );

  return (
    <form action={action} className="lf-hub__primary-wrap">
      <button
        type="submit"
        data-hub-primary-cta="prepare-next-season"
        className="lf-hub__primary lf-motion-press"
        disabled={pending}
      >
        {pending ? UI_COPY.saving : label}
      </button>
      {state.error ? (
        <p className="lf-hub__confirm-error" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
