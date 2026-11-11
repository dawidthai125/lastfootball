import type { Metadata } from 'next';
import Link from 'next/link';

import { confirmEmailToken } from '@/lib/auth/email-confirm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Email',
  robots: { index: false, follow: false },
};

export default async function EmailConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token ?? '';
  const result = token ? await confirmEmailToken(token) : 'bad';
  const ok = result === 'ok';

  return (
    <div className="lf-landing__gate lf-landing__gate--auth">
      <p className="lf-landing__eyebrow">Konto</p>
      <h1>{ok ? 'Email potwierdzony' : 'Link nie działa'}</h1>
      <p className="lf-landing__gate-lead">
        {ok
          ? 'Rywalizacja jest otwarta. Premia 10 000 EUR wpada na konto klubu, a jeśli klubu jeszcze nie ma, dostaniesz ją przy jego założeniu.'
          : 'Ten link wygasł albo został już użyty. Zaloguj się i wyślij nowy. Nowy link działa 24 godziny.'}
      </p>
      <div className="lf-landing__cta-row">
        <Link href="/hub" className="lf-landing__cta lf-landing__cta--primary">
          Wracam do gry
        </Link>
      </div>
    </div>
  );
}
