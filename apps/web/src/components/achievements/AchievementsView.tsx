import type { AchievementCategory, ClubAchievementsDto } from '@/lib/achievements';
import { UI_COPY } from '@/lib/ui/copy';

import './achievements.css';

function categoryLabel(category: AchievementCategory): string {
  switch (category) {
    case 'club':
      return UI_COPY.achievementCategoryClub;
    case 'career':
      return UI_COPY.achievementCategoryCareer;
    case 'sport':
      return UI_COPY.achievementCategorySport;
    case 'season':
      return UI_COPY.achievementCategorySeason;
    default:
      return category;
  }
}

function formatOccurredAt(value: string | null): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

/**
 * Achievements history — LFE-ACHIEVEMENTS-01 Information Thin.
 * Read-only derive view; no claim / XP / score.
 */
export function AchievementsView({ achievements }: { achievements: ClubAchievementsDto }) {
  const { milestones } = achievements;
  const onlyFounded = milestones.length === 1 && milestones[0]?.id === 'club_founded';

  return (
    <div className="lf-ach" data-lf-impl="LFE-ACHIEVEMENTS-01">
      <header className="lf-ach__header">
        <p className="lf-ach__eyebrow">Historia</p>
        <h1 className="lf-ach__title">{UI_COPY.achievementsTitle}</h1>
        <p className="lf-ach__subtitle">{UI_COPY.achievementsSubtitle}</p>
      </header>

      {onlyFounded ? <p className="lf-ach__hint">{UI_COPY.achievementsEmptyHint}</p> : null}

      <ol className="lf-ach__list" aria-label={UI_COPY.achievementsTitle}>
        {milestones.map((m) => {
          const when = formatOccurredAt(m.occurredAt);
          return (
            <li
              key={m.id}
              className="lf-ach__item"
              data-ach-id={m.id}
              data-ach-category={m.category}
            >
              <div className="lf-ach__item-meta">
                <span className="lf-ach__category">{categoryLabel(m.category)}</span>
                {when ? (
                  <time className="lf-ach__when" dateTime={m.occurredAt ?? undefined}>
                    {when}
                  </time>
                ) : null}
              </div>
              <h2 className="lf-ach__item-title">{m.title}</h2>
              <p className="lf-ach__item-detail">{m.detail}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
