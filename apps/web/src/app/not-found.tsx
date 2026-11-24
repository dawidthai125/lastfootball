import type { Metadata } from 'next';
import Link from 'next/link';

import '@/components/legal/legal.css';

export const metadata: Metadata = {
  title: 'Nie ma takiej strony',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <article className="lf-legal">
      <h1>Nie ma takiej strony</h1>
      <p>Adres jest błędny albo strona została usunięta.</p>
      <p>
        <Link href="/">Wróć do Last Football</Link>
      </p>
    </article>
  );
}
