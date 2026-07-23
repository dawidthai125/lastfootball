import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PreMatchView } from '@/components/match/PreMatchView';
import { getFixtureById, getPreMatchBundle } from '@/data/fixtures';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PreMatchPage({ params }: PageProps) {
  const { id } = await params;
  const fixture = getFixtureById(id);
  if (!fixture) notFound();

  if (fixture.status === 'played') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-3)' }}>
        <h1
          className="font-[family-name:var(--font-ui)] font-semibold"
          style={{ margin: 0, fontSize: 'var(--lf-type-h1)', color: 'var(--lf-color-text-primary)' }}
        >
          Mecz zakończony
        </h1>
        <p style={{ margin: 0, fontSize: 'var(--lf-type-body)', color: 'var(--lf-color-text-muted)' }}>
          {fixture.opponent} · {fixture.score ?? '—'} · raport pomeczowy w kolejnym EPIC.
        </p>
        <Link href="/matches" style={{ color: 'var(--lf-color-text-gold)', fontSize: 'var(--lf-type-caption)' }}>
          ← Terminarz
        </Link>
      </div>
    );
  }

  if (fixture.status === 'live') {
    // Soft redirect target — live page is canonical during live
  }

  const bundle = getPreMatchBundle(id);
  if (!bundle) notFound();

  return <PreMatchView bundle={bundle} />;
}
