import type { FixtureDto } from '@/lib/fixtures/types';
import type { HubCta, HubPhase, HubSession } from '@/lib/hub/types';
import { UI_COPY } from '@/lib/ui/copy';

const DECISION_PHASES = new Set<HubPhase>(['EARLY_CLUB', 'SEASON']);

export type DailyGoalKind = 'match' | 'squad' | 'training' | 'fixtures';

export type ClubDailyGoalDto = {
  readonly kind: DailyGoalKind;
  readonly label: string;
  readonly href: string;
  readonly syncedWithPrimary: boolean;
};

export type ResolveClubDailyGoalInput = {
  readonly phase: HubPhase;
  readonly session: HubSession;
  readonly primary: HubCta;
  readonly nextFixture: FixtureDto | null;
  readonly lastPlayedFixture?: FixtureDto | null;
  readonly hasFixtures?: boolean;
  readonly trainingUnlocked: boolean;
  readonly lastTrainingOn: string | null;
  /** UTC `YYYY-MM-DD` — injected for determinism (REUSE `utcDateString`). */
  readonly todayUtc: string;
};

function goal(kind: DailyGoalKind, label: string, href: string, primary: HubCta): ClubDailyGoalDto {
  return {
    kind,
    label,
    href,
    syncedWithPrimary: primary.href === href,
  };
}

function matchHref(fixtureId: string): string {
  return `/match/${fixtureId}/tunnel`;
}

/**
 * Daily Goal Thin (GDD §20) — pure derive suggestion for Hub warstwa 2.
 * Never mutates domain; never elevates above Primary CTA.
 */
export function resolveClubDailyGoal(input: ResolveClubDailyGoalInput): ClubDailyGoalDto | null {
  if (!DECISION_PHASES.has(input.phase)) return null;

  const { session, primary, nextFixture, trainingUnlocked, lastTrainingOn, todayUtc } = input;

  // P1 — matchday: sync with Primary match path
  if (session === 'matchday' && nextFixture) {
    return goal('match', UI_COPY.dailyGoalMatch, matchHref(nextFixture.id), primary);
  }

  // P2 — post_match: upcoming next (defensive) → match; else squad
  if (session === 'post_match') {
    if (nextFixture?.status === 'upcoming') {
      return goal('match', UI_COPY.dailyGoalMatch, matchHref(nextFixture.id), primary);
    }
    return goal('squad', UI_COPY.dailyGoalSquad, '/squad', primary);
  }

  // P3 — training available today (UTC slot; soft-lock aware)
  if (trainingUnlocked && lastTrainingOn !== todayUtc) {
    return goal('training', UI_COPY.dailyGoalTraining, '/training', primary);
  }

  // P4/P5 — fallback Kadra (spójny z Primary idle); null tylko poza decision phases
  void input.hasFixtures;
  void input.lastPlayedFixture;
  return goal('squad', UI_COPY.dailyGoalSquad, '/squad', primary);
}
