'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { confirmEmailChange, type EmailChangeState } from '@/lib/account/credentials';

const INITIAL: EmailChangeState = { result: null };

const TEXT = {
  ok: ['Adres zmieniony', 'Od teraz logujesz się nowym adresem.'],
  bad: [
    'Link nie działa',
    'Link wygasł albo został już użyty. Zmień adres jeszcze raz w Ustawieniach.',
  ],
  taken: ['Adresu nie da się użyć', 'Wybierz inny adres w Ustawieniach.'],
} as const;

export function ConfirmEmailChangeForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(confirmEmailChange, INITIAL);
  const result = token ? state.result : 'bad';

  if (result === null) {
    return (
      <>
        <h1>Nowy adres konta</h1>
        <p className="lf-landing__gate-lead">Kliknij, żeby używać tego adresu.</p>
        <form action={action}>
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="lf-landing__cta lf-landing__cta--primary"
            disabled={pending}
          >
            {pending ? 'Zmieniam…' : 'Potwierdzam nowy adres'}
          </button>
        </form>
      </>
    );
  }
  return (
    <>
      <h1>{TEXT[result][0]}</h1>
      <p className="lf-landing__gate-lead">{TEXT[result][1]}</p>
      <div className="lf-landing__cta-row">
        <Link href="/settings" className="lf-landing__cta lf-landing__cta--primary">
          Wracam do gry
        </Link>
      </div>
    </>
  );
}
