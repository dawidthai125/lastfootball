import Link from 'next/link';

import { AtmosphereLayer, ClubCrest } from '@/components/assets';
import type { ClubDto } from '@/lib/club/types';
import {
  buildLastMatchStrip,
  buildLightStatus,
  buildWelcomeMessage,
  resolveHubPhase,
  resolveHubSession,
  resolvePrimaryCta,
  resolveSecondaryCtas,
  type HubCta,
} from '@/lib/hub';

/**
 * EARLY_CLUB decision Hub — GDD §23 / LFE-HUB-01.
 * No mid-season mock; Club DTO + hub SSOT only.
 */
export function EarlyClubHub({ club }: { club: ClubDto }) {
  const phase = resolveHubPhase(club);
  const session = resolveHubSession(phase);
  const primary = resolvePrimaryCta(phase, session);
  const secondary = resolveSecondaryCtas(phase).slice(0, 5);
  const lastMatch = buildLastMatchStrip(club);
  const status = buildLightStatus(club);
  const message = buildWelcomeMessage(club);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-4)' }}
      data-hub-phase={phase}
      data-hub-session={session}
    >
      <EarlyHero club={club} status={status} />
      <LastMatchStrip title={lastMatch.title} detail={lastMatch.detail} />
      <PrimaryCta cta={primary} />
      <SecondaryRow actions={secondary} />
      <LightStatus status={status} />
      <WelcomeMessage message={message} />
    </div>
  );
}

function EarlyHero({
  club,
  status,
}: {
  club: ClubDto;
  status: ReturnType<typeof buildLightStatus>;
}) {
  return (
    <AtmosphereLayer
      aria-label="Club Hero"
      style={{
        borderWidth: 'var(--lf-border-width-hair)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        background: 'var(--lf-color-bg-panel)',
        borderRadius: 'var(--lf-radius-sm)',
        padding: 'var(--lf-space-5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--lf-space-4)',
        }}
      >
        <ClubCrest
          shortName={club.shortName}
          clubName={club.name}
          crestTemplateId={club.crestTemplateId}
          accentColor={club.primaryColor}
          size="xl"
        />
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <p
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              margin: 0,
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-gold)',
            }}
          >
            Twój klub
          </p>
          <h1
            className="font-[family-name:var(--font-ui)] font-bold"
            style={{
              margin: 0,
              marginTop: 'var(--lf-space-1)',
              fontSize: 'var(--lf-type-hero)',
              lineHeight: 1.1,
              color: 'var(--lf-color-text-primary)',
            }}
          >
            {club.name}
          </h1>
          <p
            style={{
              margin: 0,
              marginTop: 'var(--lf-space-2)',
              fontSize: 'var(--lf-type-caption)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            {status.stadium} · {status.league} · {status.seasonLabel} · {status.dayLabel}
          </p>
        </div>
      </div>
    </AtmosphereLayer>
  );
}

function LastMatchStrip({ title, detail }: { title: string; detail: string }) {
  return (
    <section
      aria-label={title}
      style={{
        borderWidth: 'var(--lf-border-width-hair)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        borderLeftWidth: 'var(--lf-border-width-thick)',
        borderLeftColor: 'var(--lf-color-border-gold)',
        background: 'var(--lf-color-bg-panel-alt)',
        borderRadius: 'var(--lf-radius-sm)',
        padding: 'var(--lf-space-3) var(--lf-space-4)',
      }}
    >
      <p
        className="font-[family-name:var(--font-ui)] font-semibold uppercase"
        style={{
          margin: 0,
          fontSize: 'var(--lf-type-label)',
          letterSpacing: 'var(--lf-type-tracking-label)',
          color: 'var(--lf-color-text-gold)',
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: 0,
          marginTop: 'var(--lf-space-1)',
          fontSize: 'var(--lf-type-body)',
          color: 'var(--lf-color-text-primary)',
          fontWeight: 600,
        }}
      >
        {detail}
      </p>
    </section>
  );
}

function PrimaryCta({ cta }: { cta: HubCta }) {
  return (
    <div>
      <Link
        href={cta.href}
        data-hub-primary-cta={cta.id}
        className="font-[family-name:var(--font-ui)] font-semibold"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '12rem',
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-gold)',
          background: 'var(--lf-color-gold-soft)',
          color: 'var(--lf-color-gold-base)',
          fontSize: 'var(--lf-type-body)',
          padding: 'var(--lf-space-3) var(--lf-space-5)',
          borderRadius: 'var(--lf-radius-sm)',
          textDecoration: 'none',
        }}
      >
        {cta.label}
      </Link>
    </div>
  );
}

function SecondaryRow({ actions }: { actions: HubCta[] }) {
  if (actions.length === 0) return null;
  return (
    <div
      aria-label="Akcje dodatkowe"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--lf-space-2)' }}
    >
      {actions.map((cta) =>
        cta.access === 'soft_locked' ? (
          <span
            key={cta.id}
            title="Odblokuje się wkrótce"
            style={{
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-subtle)',
              background: 'var(--lf-color-bg-inset)',
              color: 'var(--lf-color-text-faint)',
              fontSize: 'var(--lf-type-caption)',
              padding: 'var(--lf-space-2) var(--lf-space-3)',
              borderRadius: 'var(--lf-radius-sm)',
              cursor: 'default',
            }}
          >
            {cta.label} · wkrótce
          </span>
        ) : (
          <Link
            key={cta.id}
            href={cta.href}
            style={{
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-strong)',
              background: 'var(--lf-color-bg-panel-alt)',
              color: 'var(--lf-color-text-secondary)',
              fontSize: 'var(--lf-type-caption)',
              padding: 'var(--lf-space-2) var(--lf-space-3)',
              borderRadius: 'var(--lf-radius-sm)',
              textDecoration: 'none',
            }}
          >
            {cta.label}
          </Link>
        ),
      )}
    </div>
  );
}

function LightStatus({ status }: { status: ReturnType<typeof buildLightStatus> }) {
  return (
    <section
      aria-label="Status klubu"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--lf-space-4)',
        fontSize: 'var(--lf-type-caption)',
        color: 'var(--lf-color-text-muted)',
      }}
    >
      <StatusChip label="Poziom" value={status.clubLevelLabel} />
      <StatusChip label="Liga" value={status.league} />
      <StatusChip label="Stadion" value={status.stadium} />
    </section>
  );
}

function StatusChip({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span style={{ color: 'var(--lf-color-text-faint)' }}>{label} </span>
      <strong style={{ color: 'var(--lf-color-text-primary)', fontWeight: 600 }}>{value}</strong>
    </span>
  );
}

function WelcomeMessage({ message }: { message: ReturnType<typeof buildWelcomeMessage> }) {
  return (
    <section
      aria-label="Wiadomość"
      style={{
        borderWidth: 'var(--lf-border-width-hair)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        background: 'var(--lf-color-bg-panel)',
        borderRadius: 'var(--lf-radius-sm)',
        padding: 'var(--lf-space-4)',
      }}
    >
      <p
        className="font-[family-name:var(--font-ui)] font-semibold uppercase"
        style={{
          margin: 0,
          fontSize: 'var(--lf-type-label)',
          letterSpacing: 'var(--lf-type-tracking-label)',
          color: 'var(--lf-color-text-faint)',
        }}
      >
        Wiadomość · {message.from}
      </p>
      <h2
        className="font-[family-name:var(--font-ui)] font-semibold"
        style={{
          margin: 0,
          marginTop: 'var(--lf-space-1)',
          fontSize: 'var(--lf-type-h2)',
          color: 'var(--lf-color-text-primary)',
        }}
      >
        {message.subject}
      </h2>
      <p
        style={{
          margin: 0,
          marginTop: 'var(--lf-space-2)',
          fontSize: 'var(--lf-type-body)',
          color: 'var(--lf-color-text-muted)',
          maxWidth: '40rem',
        }}
      >
        {message.body}
      </p>
    </section>
  );
}
