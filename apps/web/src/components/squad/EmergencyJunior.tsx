'use client';

import { useActionState } from 'react';

import { StateBanner } from '@/components/ui';
import { callEmergencyJunior } from '@/lib/squad/actions-emergency';
import { EMERGENCY_JUNIOR_INITIAL } from '@/lib/squad/emergency-action-state';

/** Shown only while the club cannot field a legal eleven. */
export function EmergencyJunior({ keeper }: { readonly keeper: boolean }) {
  const [state, action, pending] = useActionState(callEmergencyJunior, EMERGENCY_JUNIOR_INITIAL);
  return (
    <section
      aria-label="Junior awaryjny"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--lf-space-2)',
        margin: 'var(--lf-space-3) 0',
      }}
    >
      <p style={{ margin: 0 }}>
        {keeper
          ? 'Żaden bramkarz nie może teraz zagrać.'
          : 'Mniej niż jedenastu zawodników może teraz zagrać.'}{' '}
        Powołaj juniora: nic nie kosztuje, ma kontrakt do końca sezonu i nie można go sprzedać.
        Kontuzje i zawieszenia skraca też każdy dzień bez meczu.
      </p>
      <form action={action}>
        <button type="submit" disabled={pending} style={{ minHeight: 44 }}>
          {pending ? 'Powołuję…' : 'Powołaj juniora awaryjnego'}
        </button>
      </form>
      {state.ok ? (
        <StateBanner tone="info">{`${state.name ?? 'Junior'} jest w kadrze.`}</StateBanner>
      ) : null}
      {state.error ? <StateBanner tone="error">{state.error}</StateBanner> : null}
    </section>
  );
}
