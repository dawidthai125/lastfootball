import Link from 'next/link';

import { ClubCrest } from '@/components/assets';
import type { ClubProfileDto } from '@/lib/club';
import { UI_COPY } from '@/lib/ui/copy';

/**
 * Club identity card — presentation only (LFE-CLUB-01 · D50).
 * Renders ClubProfileDto as-is — no business logic / sort / filter.
 */
export function ClubProfileView({ profile }: { profile: ClubProfileDto }) {
  const { identity, starter, organizationLabel, cashLabel, leaguePositionLabel, links } = profile;

  return (
    <div data-lf-impl="LFE-CLUB-01">
      <header className="mb-3">
        <h1
          className="font-[family-name:var(--font-display)] font-bold"
          style={{ fontSize: 'var(--lf-type-title)', color: 'var(--lf-color-text-primary)' }}
        >
          {UI_COPY.clubTitle}
        </h1>
        <p
          className="mt-1 font-[family-name:var(--font-ui)]"
          style={{ fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-muted)' }}
        >
          {UI_COPY.clubSubtitle}
        </p>
      </header>

      <section
        className="mb-3 flex flex-wrap items-center gap-3 border p-3"
        style={{
          borderColor: 'var(--lf-color-border-subtle)',
          background: 'var(--lf-color-bg-panel)',
          borderRadius: 'var(--lf-radius-sm)',
        }}
        aria-label={identity.name}
      >
        <ClubCrest
          shortName={identity.shortName}
          clubName={identity.name}
          crestTemplateId={identity.crestTemplateId}
          accentColor={identity.primaryColor}
          size="xl"
        />
        <div className="min-w-0 flex-1">
          <p
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-gold)',
            }}
          >
            {identity.shortName}
          </p>
          <h2
            className="font-[family-name:var(--font-ui)] font-bold"
            style={{
              marginTop: 'var(--lf-space-1)',
              fontSize: 'var(--lf-type-hero)',
              lineHeight: 1.1,
              color: 'var(--lf-color-text-primary)',
            }}
          >
            {identity.name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2" aria-hidden>
            <span
              className="inline-block h-3 w-6 rounded-sm border"
              style={{
                background: identity.primaryColor,
                borderColor: 'var(--lf-color-border-subtle)',
              }}
            />
            <span
              className="inline-block h-3 w-6 rounded-sm border"
              style={{
                background: identity.secondaryColor,
                borderColor: 'var(--lf-color-border-subtle)',
              }}
            />
          </div>
        </div>
      </section>

      <dl
        className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4"
        style={{ fontSize: 'var(--lf-type-caption)' }}
      >
        <div
          className="border p-2"
          style={{
            borderColor: 'var(--lf-color-border-subtle)',
            background: 'var(--lf-color-bg-panel)',
            borderRadius: 'var(--lf-radius-sm)',
          }}
        >
          <dt style={{ color: 'var(--lf-color-text-faint)' }}>{UI_COPY.clubLeagueLabel}</dt>
          <dd className="mt-0.5 font-medium" style={{ color: 'var(--lf-color-text-primary)' }}>
            {starter.leagueLabel}
          </dd>
        </div>
        <div
          className="border p-2"
          style={{
            borderColor: 'var(--lf-color-border-subtle)',
            background: 'var(--lf-color-bg-panel)',
            borderRadius: 'var(--lf-radius-sm)',
          }}
        >
          <dt style={{ color: 'var(--lf-color-text-faint)' }}>{UI_COPY.clubStadiumLabel}</dt>
          <dd className="mt-0.5 font-medium" style={{ color: 'var(--lf-color-text-primary)' }}>
            {starter.stadiumLabel}
          </dd>
          <dd className="mt-0.5" style={{ color: 'var(--lf-color-text-muted)' }}>
            {starter.stadiumCapacityLabel}
          </dd>
        </div>
        <div
          className="border p-2"
          style={{
            borderColor: 'var(--lf-color-border-subtle)',
            background: 'var(--lf-color-bg-panel)',
            borderRadius: 'var(--lf-radius-sm)',
          }}
        >
          <dt style={{ color: 'var(--lf-color-text-faint)' }}>{UI_COPY.clubOrganizationLabel}</dt>
          <dd className="mt-0.5 font-medium" style={{ color: 'var(--lf-color-text-gold)' }}>
            {organizationLabel}
          </dd>
        </div>
        <div
          className="border p-2"
          style={{
            borderColor: 'var(--lf-color-border-subtle)',
            background: 'var(--lf-color-bg-panel)',
            borderRadius: 'var(--lf-radius-sm)',
          }}
        >
          <dt style={{ color: 'var(--lf-color-text-faint)' }}>{UI_COPY.clubCashLabel}</dt>
          <dd
            className="mt-0.5 font-medium tabular-nums"
            style={{ color: 'var(--lf-color-text-primary)' }}
          >
            {cashLabel}
          </dd>
          {leaguePositionLabel ? (
            <>
              <dt className="mt-2" style={{ color: 'var(--lf-color-text-faint)' }}>
                {UI_COPY.clubLeaguePositionLabel}
              </dt>
              <dd className="mt-0.5" style={{ color: 'var(--lf-color-text-muted)' }}>
                {leaguePositionLabel}
              </dd>
            </>
          ) : null}
        </div>
      </dl>

      <nav aria-label={UI_COPY.clubLinksLabel}>
        <p
          className="mb-1.5 font-[family-name:var(--font-ui)] font-semibold uppercase"
          style={{
            fontSize: 'var(--lf-type-label)',
            letterSpacing: 'var(--lf-type-tracking-label)',
            color: 'var(--lf-color-text-muted)',
          }}
        >
          {UI_COPY.clubLinksLabel}
        </p>
        <ul className="flex flex-wrap gap-2">
          {links.map((link) => (
            <li key={link.id}>
              <Link
                href={link.href}
                className="inline-block border px-2.5 py-1.5 no-underline"
                style={{
                  borderColor: 'var(--lf-color-border-strong)',
                  background: 'var(--lf-color-bg-panel-alt)',
                  color: 'var(--lf-color-text-secondary)',
                  fontSize: 'var(--lf-type-caption)',
                  borderRadius: 'var(--lf-radius-sm)',
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
