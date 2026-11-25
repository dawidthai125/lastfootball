import { kickoffBlockReason } from '@/lib/fixtures/kickoff-gate';
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
  /** Email deadline from loadEmailGate. Default false. */
  readonly matchesBlocked?: boolean;
  /** Newest played_at. When omitted, lastPlayedFixture.playedAt is used. */
  readonly lastPlayedAt?: string | null;
  /** Injected clock for the Warsaw day rule. */
  readonly now?: Date;
  /** Starting XI fails validateStartingXi (ban, injury, call-up, loan). */
  readonly lineupBlocked?: boolean;
  /** Dressing conflict pending in messages (REUSE msg:dress). */
  readonly dressingConflict?: boolean;
  /** National call-up pending in messages (REUSE msg:intl). */
  readonly intlCallup?: boolean;
};

function goal(kind: DailyGoalKind, label: string, href: string, primary: HubCta): ClubDailyGoalDto {
  return {
    kind,
    label,
    href,
    syncedWithPrimary: primary.href === href,
  };
}

function lineupHref(fixtureId: string): string {
  return `/match/${fixtureId}/xi`;
}

function matchHref(fixtureId: string): string {
  return `/match/${fixtureId}/tunnel`;
}

/** Same sentence as the kickoff gate. Never a tunnel link. */
function blockedMatchLine(
  input: ResolveClubDailyGoalInput,
  fixture: FixtureDto,
): ClubDailyGoalDto | null {
  const sentence = kickoffBlockReason({
    matchesBlocked: input.matchesBlocked ?? false,
    competition: fixture.competition,
    lastPlayedAt:
      input.lastPlayedAt !== undefined ? input.lastPlayedAt : input.lastPlayedFixture?.playedAt,
    now: input.now ?? new Date(),
  });
  if (!sentence) return null;
  if (input.matchesBlocked) return goal('match', sentence, '/profile', input.primary);
  return goal('fixtures', sentence, '/matches', input.primary);
}

/**
 * Daily Goal Thin (GDD §20) — pure derive suggestion for Hub warstwa 2.
 * Never mutates domain; never elevates above Primary CTA.
 */
export function resolveClubDailyGoal(input: ResolveClubDailyGoalInput): ClubDailyGoalDto | null {
  if (!DECISION_PHASES.has(input.phase)) return null;

  const { session, primary, nextFixture, trainingUnlocked, lastTrainingOn, todayUtc } = input;

  // P1 — matchday: sync with Primary match path, unless kickoff is closed
  if (session === 'matchday' && nextFixture) {
    const blocked = blockedMatchLine(input, nextFixture);
    if (blocked) return restOfDayGoal(input, primary) ?? blocked;
    if (input.lineupBlocked) {
      return goal('match', UI_COPY.dailyGoalLineup, lineupHref(nextFixture.id), primary);
    }
    return goal('match', UI_COPY.dailyGoalMatch, matchHref(nextFixture.id), primary);
  }

  // P2 — post_match: upcoming next (defensive) → match; else messages/squad
  if (session === 'post_match') {
    if (nextFixture?.status === 'upcoming') {
      const blocked = blockedMatchLine(input, nextFixture);
      if (blocked) return restOfDayGoal(input, primary) ?? blocked;
      if (input.lineupBlocked) {
        return goal('match', UI_COPY.dailyGoalLineup, lineupHref(nextFixture.id), primary);
      }
      return goal('match', UI_COPY.dailyGoalMatch, matchHref(nextFixture.id), primary);
    }
    const desk = messagesDeskGoal(input, primary);
    if (desk) return desk;
    return goal('squad', UI_COPY.dailyGoalSquad, '/squad', primary);
  }

  // P2b — idle desk: dressing / intl before training nudge
  const desk = messagesDeskGoal(input, primary);
  if (desk) return desk;

  // P3 — training available today (UTC slot; soft-lock aware)
  if (trainingUnlocked && lastTrainingOn !== todayUtc) {
    return goal('training', UI_COPY.dailyGoalTraining, '/training', primary);
  }

  // P4/P5 — fallback Kadra (spójny z Primary idle); null tylko poza decision phases
  void input.hasFixtures;
  void input.lastPlayedFixture;
  return goal('squad', UI_COPY.dailyGoalSquad, '/squad', primary);
}

/** The match of the day is done. A waiting talk or the training of the day is still worth a click. */
function restOfDayGoal(input: ResolveClubDailyGoalInput, primary: HubCta): ClubDailyGoalDto | null {
  if (input.matchesBlocked) return null;
  const desk = messagesDeskGoal(input, primary);
  if (desk) return desk;
  if (input.trainingUnlocked && input.lastTrainingOn !== input.todayUtc) {
    return goal('training', UI_COPY.dailyGoalTraining, '/training', primary);
  }
  return null;
}

function messagesDeskGoal(
  input: ResolveClubDailyGoalInput,
  primary: HubCta,
): ClubDailyGoalDto | null {
  const dressing = Boolean(input.dressingConflict);
  const intl = Boolean(input.intlCallup);
  if (!dressing && !intl) return null;
  const label =
    dressing && intl
      ? UI_COPY.dailyGoalDressingIntl
      : dressing
        ? UI_COPY.dailyGoalDressing
        : UI_COPY.dailyGoalIntl;
  return goal('squad', label, '/messages', primary);
}
