import { notFound } from 'next/navigation';

import { LiveMatchFoundation } from '@/components/match/LiveMatchFoundation';
import { getLiveMatchBundle } from '@/data/fixtures';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LiveMatchPage({ params }: PageProps) {
  const { id } = await params;
  const bundle = getLiveMatchBundle(id);
  if (!bundle) notFound();

  return <LiveMatchFoundation bundle={bundle} />;
}
