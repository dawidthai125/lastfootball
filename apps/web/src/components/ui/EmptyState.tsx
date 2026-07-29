import Image from 'next/image';
import Link from 'next/link';

import './domain-states.css';

type EmptyLink = { href: string; label: string };

type EmptyStateProps = {
  waId: string;
  illustrationSrc: string;
  title: string;
  body: string;
  links?: readonly EmptyLink[];
};

/** EmptyState — EMP-* Hi-Fi (Squad / Finance). */
export function EmptyState({ waId, illustrationSrc, title, body, links = [] }: EmptyStateProps) {
  return (
    <div className="lf-es" data-wa={waId} data-lf-impl="LFE-UI-IMPL-03" role="status">
      <Image
        className="lf-es__ill"
        src={illustrationSrc}
        alt=""
        width={480}
        height={280}
        sizes="(max-width: 767px) 100vw, 480px"
      />
      <h2 className="lf-es__title">{title}</h2>
      <p className="lf-es__body">{body}</p>
      {links.length > 0 ? (
        <nav className="lf-es__links" aria-label="Następne kroki">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="lf-es__link">
              {l.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
