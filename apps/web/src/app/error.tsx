'use client';

import Link from 'next/link';

import '@/components/legal/legal.css';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <article className="lf-legal" role="alert">
      <h1>Coś poszło nie tak</h1>
      <p>Spróbuj jeszcze raz. Jeśli to się powtarza, napisz na kontakt@lastfootball.pl.</p>
      <p>
        <button type="button" onClick={reset}>
          Spróbuj ponownie
        </button>{' '}
        <Link href="/">Strona główna</Link>
      </p>
    </article>
  );
}
