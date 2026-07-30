import Link from 'next/link';
import Image from 'next/image';

import { AtmosphereLayer, ClubCrest } from '@/components/assets';
import type { ClubDto } from '@/lib/club/types';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import type { FixtureDto } from '@/lib/fixtures/types';
import {
  buildLastMatchStrip,
  buildLightStatus,
  buildWelcomeMessage,
  resolveClubDailyGoal,
  resolveHubPhase,
  resolveHubSession,
  resolvePrimaryCta,
  resolveSecondaryCtas,
  type ClubDailyGoalDto,
  type HubCta,
  type HubSession,
} from '@/lib/hub';
import { UI_COPY } from '@/lib/ui/copy';

import './hub-decision.css';

/**
 * Decision Hub — LFE-UI-IMPL-01 / Hi-Fi HF-HUB-01|02|04 · LFE-DAILY-01.
 * Hero → Decision → Primary → Daily Goal (suggestion) → Secondary≤5 → Context.
 * Unlock via resolveNavAccess — no new domain rules.
 */
export function EarlyClubHub({
  club,
  nextFixture = null,
  lastPlayedFixture = null,
  hasFixtures = false,
  leaguePositionLabel = null,
  cashLabel = null,
  trainingUnlocked = false,
  todayUtc = utcDateString(),
}: {
  club: ClubDto;
  nextFixture?: FixtureDto | null;
  lastPlayedFixture?: FixtureDto | null;
  hasFixtures?: boolean;
  leaguePositionLabel?: string | null;
  cashLabel?: string | null;
  trainingUnlocked?: boolean;
  /** Injected UTC day for Daily Goal determinism (tests / page). */
  todayUtc?: string;
}) {
  const phase = resolveHubPhase(club, { hasFixtures });
  const session = resolveHubSession(phase, nextFixture, lastPlayedFixture);
  const primary = resolvePrimaryCta(phase, session, {
    nextFixture,
    lastPlayedFixture,
    hasFixtures,
  });
  const dailyGoal = resolveClubDailyGoal({
    phase,
    session,
    primary,
    nextFixture,
    lastPlayedFixture,
    hasFixtures,
    trainingUnlocked,
    lastTrainingOn: club.lastTrainingOn,
    todayUtc,
  });
  const secondary = resolveSecondaryCtas(phase, {
    hasFixtures,
    trainingUnlocked,
    transferWindowOpen: club.transferWindowOpen,
  }).slice(0, 5);
  const lastMatch = buildLastMatchStrip(club, lastPlayedFixture);
  const status = buildLightStatus(club, nextFixture, leaguePositionLabel, cashLabel);
  const message = buildWelcomeMessage(club, nextFixture);
  const event = resolveDecisionEvent({
    club,
    session,
    nextFixture,
    lastMatch,
    dayLabel: status.dayLabel,
    league: status.league,
  });

  return (
    <div
      className="lf-hub"
      data-hub-phase={phase}
      data-hub-session={session}
      data-lf-impl="LFE-UI-IMPL-06A"
      data-lf-daily="LFE-DAILY-01"
    >
      <LocationHero session={session} />

      <div className="lf-hub__decision-stage">
        <AtmosphereLayer
          className="lf-hub__decision lf-motion-enter"
          aria-label={event.eyebrow}
          layers={['vignette', 'grain']}
        >
          <p className="lf-hub__decision-eyebrow">{event.eyebrow}</p>
          <h1 className="lf-hub__decision-title">{event.title}</h1>
          <p className="lf-hub__decision-meta">{event.meta}</p>
          {event.detail ? <p className="lf-hub__decision-detail">{event.detail}</p> : null}
        </AtmosphereLayer>

        <PrimaryCta cta={primary} />
        <DailyGoalSuggestion goal={dailyGoal} />
      </div>

      <div className="lf-hub__body">
        <ClubIdentity club={club} status={status} />
        <div className="lf-hub__actions">
          <SecondaryRow actions={secondary} />
          <LightStatus status={status} />
        </div>
      </div>

      <WelcomeMessage message={message} />
    </div>
  );
}

function LocationHero({ session }: { session: HubSession }) {
  const matchday = session === 'matchday';
  return (
    <div
      className={matchday ? 'lf-hub__hero lf-hub__hero--matchday' : 'lf-hub__hero'}
      data-wa="HERO-001"
      aria-hidden
    >
      <Image
        className="lf-hub__hero-img lf-hub__hero-img--desktop"
        src="/assets/world-art/hero-001-office-night.png"
        alt=""
        fill
        sizes="(max-width: 767px) 0px, 100vw"
        priority
      />
      <Image
        className="lf-hub__hero-img lf-hub__hero-img--mobile"
        src="/assets/world-art/hero-001-office-mobile.png"
        alt=""
        fill
        sizes="(min-width: 768px) 0px, 100vw"
        priority
      />
      <div className="lf-hub__hero-veil" />
    </div>
  );
}

type DecisionBannerProps = {
  club: ClubDto;
  session: HubSession;
  nextFixture: FixtureDto | null;
  lastMatch: ReturnType<typeof buildLastMatchStrip>;
  dayLabel: string;
  league: string;
};

function resolveDecisionEvent({
  club,
  session,
  nextFixture,
  lastMatch,
  dayLabel,
  league,
}: DecisionBannerProps): {
  eyebrow: string;
  title: string;
  meta: string;
  detail: string | null;
} {
  if (session === 'matchday' && nextFixture) {
    const venue = nextFixture.isHome ? 'U siebie' : 'Wyjazd';
    return {
      eyebrow: 'Najbliższy mecz',
      title: `${club.shortName} vs ${nextFixture.opponent.shortName}`,
      meta: `Kolejka ${nextFixture.matchday} · ${league} · ${venue}`,
      detail: nextFixture.opponent.name,
    };
  }

  if (session === 'post_match') {
    return {
      eyebrow: lastMatch.title,
      title: lastMatch.detail,
      meta: `${league} · ${dayLabel}`,
      detail: null,
    };
  }

  if (nextFixture) {
    const venue = nextFixture.isHome ? 'U siebie' : 'Wyjazd';
    return {
      eyebrow: 'Nadchodzące wydarzenie',
      title: `vs ${nextFixture.opponent.name}`,
      meta: `Kolejka ${nextFixture.matchday} · ${league} · ${venue}`,
      detail: null,
    };
  }

  return {
    eyebrow: lastMatch.title,
    title: lastMatch.detail,
    meta: `${league} · ${dayLabel}`,
    detail: null,
  };
}

function ClubIdentity({
  club,
  status,
}: {
  club: ClubDto;
  status: ReturnType<typeof buildLightStatus>;
}) {
  return (
    <div className="lf-hub__club" aria-label="Twój klub">
      <ClubCrest
        shortName={club.shortName}
        clubName={club.name}
        crestTemplateId={club.crestTemplateId}
        accentColor={club.primaryColor}
        size="md"
      />
      <div className="lf-hub__club-text">
        <p className="lf-hub__club-label">Twój klub</p>
        <p className="lf-hub__club-name">{club.name}</p>
        <p className="lf-hub__club-meta">
          {status.league} · {status.dayLabel} · {status.seasonLabel}
        </p>
      </div>
    </div>
  );
}

function PrimaryCta({ cta }: { cta: HubCta }) {
  return (
    <div className="lf-hub__primary-wrap">
      <Link
        href={cta.href}
        data-hub-primary-cta={cta.id}
        className="lf-hub__primary lf-motion-press"
      >
        {cta.label}
      </Link>
    </div>
  );
}

/** Information Thin — suggestion only; never styled as Primary (LFE-DAILY-01). */
function DailyGoalSuggestion({ goal }: { goal: ClubDailyGoalDto | null }) {
  if (!goal) return null;
  return (
    <p
      className="lf-hub__daily"
      data-daily-kind={goal.kind}
      data-daily-synced={goal.syncedWithPrimary}
    >
      <span className="lf-hub__daily-eyebrow">{UI_COPY.dailyGoalEyebrow}</span>
      <Link href={goal.href} className="lf-hub__daily-link">
        {goal.label}
      </Link>
    </p>
  );
}

function SecondaryRow({ actions }: { actions: HubCta[] }) {
  if (actions.length === 0) return null;
  return (
    <nav className="lf-hub__secondary" aria-label="Akcje dodatkowe">
      {actions.map((cta) =>
        cta.access === 'soft_locked' ? (
          <span
            key={cta.id}
            className="lf-hub__secondary-item lf-hub__secondary-item--locked"
            title="Niedostępne w tej fazie"
          >
            {cta.label} · {UI_COPY.softLockUnavailable}
          </span>
        ) : (
          <Link key={cta.id} href={cta.href} className="lf-hub__secondary-item">
            {cta.label}
          </Link>
        ),
      )}
    </nav>
  );
}

function LightStatus({ status }: { status: ReturnType<typeof buildLightStatus> }) {
  const parts = [
    status.clubLevelLabel,
    status.league,
    status.leaguePositionLabel,
    status.cashLabel,
    status.stadium,
  ].filter((v): v is string => Boolean(v));

  return (
    <p className="lf-hub__status" aria-label="Status klubu">
      {parts.join(' · ')}
    </p>
  );
}

function WelcomeMessage({ message }: { message: ReturnType<typeof buildWelcomeMessage> }) {
  return (
    <section className="lf-hub__message" aria-label="Wiadomość">
      <p className="lf-hub__message-from">Wiadomość · {message.from}</p>
      <h2 className="lf-hub__message-subject">{message.subject}</h2>
      <p className="lf-hub__message-body">{message.body}</p>
    </section>
  );
}
