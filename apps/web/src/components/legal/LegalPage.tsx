import type { ReactNode } from 'react';

import { LandingCta } from '@/components/landing/LandingCta';
import { OPERATOR } from '@/lib/legal';

import './legal.css';

/** Shell of the terms and the privacy policy. */
export function LegalPage({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <article className="lf-legal">
      <h1>{title}</h1>
      {children}
      <LandingCta href="/" variant="primary">
        Wróć
      </LandingCta>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function OperatorLine() {
  return (
    <>
      {OPERATOR.name}, {OPERATOR.address}, NIP {OPERATOR.nip}, REGON {OPERATOR.regon}
    </>
  );
}

export function ContactLink() {
  return <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>;
}
