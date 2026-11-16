import { KickoffBlocked } from '@/components/match/KickoffBlocked';
import { MatchVsView } from '@/components/match/MatchVsView';
import { loadMatchPathContext } from '@/lib/match/load-match-path-context';
import { upcomingKickoffSentence } from '@/lib/match/upcoming-kickoff-block';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MatchVsPage({ params }: PageProps) {
  const { id } = await params;
  const sentence = await upcomingKickoffSentence(id);
  if (sentence) return <KickoffBlocked sentence={sentence} />;
  const ctx = await loadMatchPathContext(id);
  return (
    <MatchVsView
      matchId={ctx.matchId}
      homeShort={ctx.homeShort}
      homeName={ctx.homeName}
      awayShort={ctx.awayShort}
      awayName={ctx.awayName}
      meta={ctx.meta}
      rivalLines={ctx.rivalLines}
    />
  );
}
