import { MatchVsView } from '@/components/match/MatchVsView';
import { loadMatchPathContext } from '@/lib/match/load-match-path-context';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MatchVsPage({ params }: PageProps) {
  const { id } = await params;
  const ctx = await loadMatchPathContext(id);
  return (
    <MatchVsView
      matchId={ctx.matchId}
      homeShort={ctx.homeShort}
      homeName={ctx.homeName}
      awayShort={ctx.awayShort}
      awayName={ctx.awayName}
      meta={ctx.meta}
    />
  );
}
