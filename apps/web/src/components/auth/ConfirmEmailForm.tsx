'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { confirmEmailAction } from '@/lib/auth/actions';
import type { ConfirmEmailState } from '@/lib/auth/types';

const INITIAL: ConfirmEmailState = { result: null };

const LEAD = {
  ok: 'Rywalizacja jest otwarta. Premia 10 000 EUR wpada na konto klubu, a jeśli klubu jeszcze nie ma, dostaniesz ją przy jego założeniu.',
  proved: 'Adres jest sprawdzony. E-maile z powiadomieniami włączysz w ustawieniach.',
  bad: 'Ten link wygasł albo został już użyty. Zaloguj się i wyślij nowy. Nowy link działa 24 godziny.',
} as const;

export function ConfirmEmailForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(confirmEmailAction, INITIAL);
  const result = token ? state.result : 'bad';

  if (result === null) {
    return (
      <>
        <h1>Potwierdź email</h1>
        <p className="lf-landing__gate-lead">Kliknij, żeby potwierdzić swój adres.</p>
        <form action={action}>
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="lf-landing__cta lf-landing__cta--primary"
            disabled={pending}
          >
            {pending ? 'Potwierdzam…' : 'Potwierdzam adres'}
          </button>
        </form>
      </>
    );
  }
  return (
    <>
      <h1>{result === 'bad' ? 'Link nie działa' : 'Email potwierdzony'}</h1>
      <p className="lf-landing__gate-lead">{LEAD[result]}</p>
      <div className="lf-landing__cta-row">
        <Link href="/hub" className="lf-landing__cta lf-landing__cta--primary">
          Wracam do gry
        </Link>
      </div>
    </>
  );
}
