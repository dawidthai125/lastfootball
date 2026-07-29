import { MatchTunnelView } from '@/components/match/MatchTunnelView';
import { loadMatchPathContext } from '@/lib/match/load-match-path-context';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MatchTunnelPage({ params }: PageProps) {
  const { id } = await params;
  const ctx = await loadMatchPathContext(id);
  return <MatchTunnelView matchId={ctx.matchId} opponentLabel={ctx.opponentLabel} />;
}
