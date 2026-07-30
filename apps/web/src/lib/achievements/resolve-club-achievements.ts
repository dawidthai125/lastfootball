import type { ClubDto } from '@/lib/club/types';
import { countPlayedInList } from '@/lib/fixtures/played-unlock';
import type { FixtureDto } from '@/lib/fixtures/types';
import { UI_COPY } from '@/lib/ui/copy';

export type AchievementCategory = 'sport' | 'club' | 'career' | 'season';

export type AchievementMilestoneDto = {
  readonly id: string;
  readonly category: AchievementCategory;
  readonly title: string;
  readonly detail: string;
  readonly occurredAt: string | null;
};

export type ClubAchievementsDto = {
  readonly milestones: readonly AchievementMilestoneDto[];
};

export type ResolveClubAchievementsInput = {
  readonly club: ClubDto;
  readonly fixtures: readonly FixtureDto[];
};

const ID_ORDER: Record<string, number> = {
  club_founded: 0,
  first_match: 1,
  first_league_match: 2,
  first_training: 3,
};

function earliestPlayedAt(fixtures: readonly FixtureDto[]): string | null {
  let earliest: string | null = null;
  for (const f of fixtures) {
    if (f.status !== 'played' || !f.playedAt) continue;
    if (earliest === null || f.playedAt < earliest) earliest = f.playedAt;
  }
  return earliest;
}

function hasPlayedFixture(fixtures: readonly FixtureDto[]): boolean {
  return countPlayedInList(fixtures) > 0;
}

function compareMilestones(a: AchievementMilestoneDto, b: AchievementMilestoneDto): number {
  const aAt = a.occurredAt;
  const bAt = b.occurredAt;
  if (aAt && bAt) {
    if (aAt < bAt) return -1;
    if (aAt > bAt) return 1;
  } else if (aAt && !bAt) {
    return -1;
  } else if (!aAt && bAt) {
    return 1;
  }
  return (ID_ORDER[a.id] ?? 99) - (ID_ORDER[b.id] ?? 99);
}

/**
 * Achievements Information Thin (GDD §19) — pure derive history.
 * Immutable view of lasting domain facts; never mutates; no XP/score/economy.
 */
export function resolveClubAchievements(input: ResolveClubAchievementsInput): ClubAchievementsDto {
  const { club, fixtures } = input;
  const milestones: AchievementMilestoneDto[] = [];

  milestones.push({
    id: 'club_founded',
    category: 'club',
    title: UI_COPY.achievementClubFoundedTitle,
    detail: UI_COPY.achievementClubFoundedDetail,
    occurredAt: club.createdAt,
  });

  if (club.firstMatchCompletedAt) {
    milestones.push({
      id: 'first_match',
      category: 'career',
      title: UI_COPY.achievementFirstMatchTitle,
      detail: UI_COPY.achievementFirstMatchDetail,
      occurredAt: club.firstMatchCompletedAt,
    });
  }

  if (hasPlayedFixture(fixtures)) {
    milestones.push({
      id: 'first_league_match',
      category: 'sport',
      title: UI_COPY.achievementFirstLeagueTitle,
      detail: UI_COPY.achievementFirstLeagueDetail,
      occurredAt: earliestPlayedAt(fixtures),
    });
  }

  if (club.lastTrainingOn) {
    milestones.push({
      id: 'first_training',
      category: 'career',
      title: UI_COPY.achievementFirstTrainingTitle,
      detail: UI_COPY.achievementFirstTrainingDetail,
      occurredAt: club.lastTrainingOn,
    });
  }

  const sorted = [...milestones].sort(compareMilestones);
  return { milestones: sorted };
}
