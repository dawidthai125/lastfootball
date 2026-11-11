'use client';

import { useActionState } from 'react';
import { usePathname } from 'next/navigation';

import { sendEmailConfirmLink } from '@/lib/auth/actions';

import '@/components/ui/domain-states.css';

const INITIAL = { error: null as string | null, info: null as string | null };

export function EmailConfirmBanner({
  variant,
  deadlineLabel,
  matchesBlocked,
}: {
  variant: 'game' | 'auth';
  deadlineLabel: string;
  matchesBlocked: boolean;
}) {
  const pathname = usePathname();
  const [state, action, pending] = useActionState(sendEmailConfirmLink, INITIAL);
  if (variant === 'game' && pathname.startsWith('/match/')) return null;

  const className = variant === 'auth' ? 'lf-auth-form__info' : 'lf-sb lf-sb--info';

  return (
    <div className={className} role="status" style={{ marginBottom: '1rem' }}>
      <div className={variant === 'auth' ? undefined : 'lf-sb__body'}>
        <p style={{ margin: '0 0 0.35rem' }}>
          Potwierdź email, żeby grać w rywalizacji i dostać 10 000 EUR premii od zarządu.
          {matchesBlocked
            ? ' Czas na grę bez potwierdzenia minął, więc kolejne mecze czekają.'
            : ` Mecze ligi zostają otwarte do ${deadlineLabel}.`}
        </p>
        <p style={{ margin: '0 0 0.5rem' }}>
          Link z maila gaśnie po czasie. Nowy jest ważny 24 godziny. Można prosić co 15 minut,
          najwyżej 4 razy na dobę.
        </p>
        {state.error ? <p style={{ margin: '0 0 0.35rem' }}>{state.error}</p> : null}
        {state.info ? <p style={{ margin: '0 0 0.35rem' }}>{state.info}</p> : null}
        <form action={action}>
          <button type="submit" className="lf-sb__retry" disabled={pending}>
            {pending ? 'Wysyłam…' : 'Wyślij nowy link'}
          </button>
        </form>
      </div>
    </div>
  );
}
