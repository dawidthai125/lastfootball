import Link from 'next/link';

import { AtmosphereLayer, ClubCrest } from '@/components/assets';
import type { ClubDto } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import {
  buildLastMatchStrip,
  buildLightStatus,
  buildWelcomeMessage,
  resolveHubPhase,
  resolveHubSession,
  resolvePrimaryCta,
  resolveSecondaryCtas,
  type HubCta,
  type HubSession,
} from '@/lib/hub';

import './hub-decision.css';

/**
 * Decision Hub — GDD §23 / LFE-UI-EVOLUTION-01A + daily loop 02 (presentation).
 * Unlock via existing resolveNavAccess — no new domain rules.
 */
export function EarlyClubHub({
  club,
  nextFixture = null,
  lastPlayedFixture = null,
  hasFixtures = false,
  leaguePositionLabel = null,
  cashLabel = null,
  trainingUnlocked = false,
}: {
  club: ClubDto;
  nextFixture?: FixtureDto | null;
  lastPlayedFixture?: FixtureDto | null;
  hasFixtures?: boolean;
  leaguePositionLabel?: string | null;
  cashLabel?: string | null;
  /** Existing unlock flag — presentation only (resolveNavAccess). */
  trainingUnlocked?: boolean;
}) {
  const phase = resolveHubPhase(club, { hasFixtures });
  const session = resolveHubSession(phase, nextFixture, lastPlayedFixture);
  const primary = resolvePrimaryCta(phase, session, {
    nextFixture,
    lastPlayedFixture,
    hasFixtures,
  });
  const secondary = resolveSecondaryCtas(phase, {
    hasFixtures,
    trainingUnlocked,
    transferWindowOpen: club.transferWindowOpen,
  }).slice(0, 5);
  const lastMatch = buildLastMatchStrip(club, lastPlayedFixture);
  const status = buildLightStatus(club, nextFixture, leaguePositionLabel, cashLabel);
  const message = buildWelcomeMessage(club, nextFixture);

  return (
    <div className="lf-hub" data-hub-phase={phase} data-hub-session={session}>
      <DecisionBanner
        club={club}
        session={session}
        nextFixture={nextFixture}
        lastMatch={lastMatch}
        dayLabel={status.dayLabel}
        league={status.league}
      />
      <PrimaryCta cta={primary} />
      <ClubIdentity club={club} status={status} />
      <SecondaryRow actions={secondary} />
      <LightStatus status={status} />
      <WelcomeMessage message={message} />
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

/** Domain entity: nearest match / session event — not a KPI strip. */
function DecisionBanner({
  club,
  session,
  nextFixture,
  lastMatch,
  dayLabel,
  league,
}: DecisionBannerProps) {
  const event = resolveDecisionEvent({
    club,
    session,
    nextFixture,
    lastMatch,
    dayLabel,
    league,
  });

  return (
    <AtmosphereLayer
      className="lf-hub__decision"
      aria-label={event.eyebrow}
      layers={['vignette', 'grain']}
    >
      <p className="lf-hub__decision-eyebrow">{event.eyebrow}</p>
      <h1 className="lf-hub__decision-title">{event.title}</h1>
      <p className="lf-hub__decision-meta">{event.meta}</p>
      {event.detail ? <p className="lf-hub__decision-detail">{event.detail}</p> : null}
    </AtmosphereLayer>
  );
}

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

/** Domain entity: club — compact identity, not a dashboard hero card. */
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
      <Link href={cta.href} data-hub-primary-cta={cta.id} className="lf-hub__primary">
        {cta.label}
      </Link>
    </div>
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
            title="Odblokuje się wkrótce"
          >
            {cta.label} · wkrótce
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

/** Domain entity: board message — typographic, not a KPI card. */
function WelcomeMessage({ message }: { message: ReturnType<typeof buildWelcomeMessage> }) {
  return (
    <section className="lf-hub__message" aria-label="Wiadomość">
      <p className="lf-hub__message-from">Wiadomość · {message.from}</p>
      <h2 className="lf-hub__message-subject">{message.subject}</h2>
      <p className="lf-hub__message-body">{message.body}</p>
    </section>
  );
}
