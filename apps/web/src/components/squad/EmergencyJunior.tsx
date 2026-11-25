'use client';

import { useActionState } from 'react';
import Link from 'next/link';

import { StateBanner } from '@/components/ui';
import { callEmergencyJunior } from '@/lib/squad/actions-emergency';
import type { MissingRole } from '@/lib/squad/emergency-junior';
import { EMERGENCY_JUNIOR_INITIAL } from '@/lib/squad/emergency-action-state';

/** Shown only while the club cannot field a legal eleven. */
export function EmergencyJunior({ need }: { readonly need: MissingRole | 'recall' }) {
  const [state, action, pending] = useActionState(callEmergencyJunior, EMERGENCY_JUNIOR_INITIAL);
  if (need === 'recall') {
    return (
      <p style={{ margin: 'var(--lf-space-3) 0' }}>
        Do jedenastki brakuje zawodników z wypożyczenia. Ściągnij ich: otwórz zawodnika w{' '}
        <Link href="/squad" style={{ color: 'var(--lf-color-text-gold)' }}>
          kadrze
        </Link>{' '}
        i wybierz „Ściągnij z wypożyczenia”.
      </p>
    );
  }
  const keeper = need.pos === 'BR';
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
