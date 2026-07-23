import { Grid, GridItem } from '@/components/layout/Grid';
import { ClubHero } from '@/components/panel/ClubHero';
import { FinanceSummary } from '@/components/panel/FinanceSummary';
import { LeagueSnapshot } from '@/components/panel/LeagueSnapshot';
import { MatchdayStrip } from '@/components/panel/MatchdayStrip';
import { MessagesPreview } from '@/components/panel/MessagesPreview';
import { RecentResults } from '@/components/panel/RecentResults';
import { TrainingToday } from '@/components/panel/TrainingToday';

/**
 * Panel menedżera — LFE-UI-IMPL-02
 * Order: Club Hero → Matchday (+ Quick Actions) → data zones (WF-01 / GX-01)
 */
export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-5)' }}>
      <ClubHero />
      <MatchdayStrip />

      <Grid>
        <GridItem span={7}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-3)' }}>
            <LeagueSnapshot />
            <RecentResults />
            <FinanceSummary />
          </div>
        </GridItem>
        <GridItem span={5}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-3)' }}>
            <TrainingToday />
            <MessagesPreview />
          </div>
        </GridItem>
      </Grid>
    </div>
  );
}
