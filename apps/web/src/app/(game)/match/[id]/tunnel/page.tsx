import { KickoffBlocked } from '@/components/match/KickoffBlocked';
import { MatchTunnelView } from '@/components/match/MatchTunnelView';
import { loadMatchPathContext } from '@/lib/match/load-match-path-context';
import { upcomingKickoffSentence } from '@/lib/match/upcoming-kickoff-block';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MatchTunnelPage({ params }: PageProps) {
  const { id } = await params;
  const sentence = await upcomingKickoffSentence(id);
  if (sentence) return <KickoffBlocked sentence={sentence} />;
  const ctx = await loadMatchPathContext(id);
  return <MatchTunnelView matchId={ctx.matchId} opponentLabel={ctx.opponentLabel} />;
}
