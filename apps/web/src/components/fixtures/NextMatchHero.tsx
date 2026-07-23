import Link from 'next/link';

import { CrestMonogram, FormPills } from '@/components/match/CrestMonogram';
import type { Fixture, PreMatchBundle } from '@/data/fixtures';
import { getPreMatchBundle } from '@/data/fixtures';

type NextMatchHeroProps = {
  fixture: Fixture;
};

export function NextMatchHero({ fixture }: NextMatchHeroProps) {
  const bundle = getPreMatchBundle(fixture.id);
  if (!bundle) return null;

  const home = fixture.home ? bundle.ourTeam : bundle.theirTeam;
  const away = fixture.home ? bundle.theirTeam : bundle.ourTeam;

  return (
    <section
      aria-label="Następny mecz"
      style={{
        borderWidth: 'var(--lf-border-width-hair)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        background: 'var(--lf-color-bg-panel)',
        borderRadius: 'var(--lf-radius-sm)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr) minmax(0, 1fr) minmax(10rem, 14rem)',
          gap: 'var(--lf-space-4)',
          padding: 'var(--lf-space-5)',
          alignItems: 'center',
        }}
      >
        <TeamBlock team={home} side="Dom" />

        <div style={{ textAlign: 'center' }}>
          <p
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              margin: 0,
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-gold)',
            }}
          >
            {fixture.competitionLabel}
          </p>
          <p
            style={{
              margin: 0,
              marginTop: 'var(--lf-space-2)',
              fontSize: 'var(--lf-type-caption)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            {fixture.dateLabel ?? fixture.whenLabel}
          </p>
          <p
            className="font-[family-name:var(--font-ui)] font-bold tabular-nums"
            style={{
              margin: 0,
              marginTop: 'var(--lf-space-1)',
              fontSize: 'var(--lf-type-hero)',
              color: 'var(--lf-color-text-gold)',
              lineHeight: 1,
            }}
          >
            {fixture.kickoff ?? '—'}
          </p>
          <p
            className="font-[family-name:var(--font-ui)] font-bold"
            style={{
              margin: 'var(--lf-space-3) 0',
              fontSize: 'var(--lf-type-h1)',
              color: 'var(--lf-color-text-primary)',
            }}
          >
            VS
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--lf-type-caption)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            {fixture.stadium}
          </p>
          <Link
            href={`/match/${fixture.id}`}
            style={{
              display: 'inline-block',
              marginTop: 'var(--lf-space-4)',
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-gold)',
              background: 'var(--lf-color-gold-soft)',
              color: 'var(--lf-color-gold-base)',
              fontSize: 'var(--lf-type-body)',
              fontWeight: 600,
              padding: 'var(--lf-space-2) var(--lf-space-4)',
              borderRadius: 'var(--lf-radius-sm)',
            }}
          >
            Przygotuj mecz
          </Link>
        </div>

        <TeamBlock team={away} side="Wyjazd" />

        <aside
          aria-label="Szczegóły meczu"
          style={{
            borderWidth: 'var(--lf-border-width-hair)',
            borderStyle: 'solid',
            borderColor: 'var(--lf-color-border-subtle)',
            background: 'var(--lf-color-bg-inset)',
            borderRadius: 'var(--lf-radius-sm)',
            padding: 'var(--lf-space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--lf-space-3)',
            fontSize: 'var(--lf-type-caption)',
          }}
        >
          <MetaRow label="Sędzia" value={bundle.referee} />
          <MetaRow label="Pogoda" value={`${bundle.temperature} · ${bundle.weather}`} />
          <MetaRow label="Frekwencja" value={bundle.attendance} />
          <MetaRow label="Stawka" value={bundle.stakes[0]?.value ?? '—'} />
        </aside>
      </div>
    </section>
  );
}

function TeamBlock({
  team,
  side,
}: {
  team: PreMatchBundle['ourTeam'];
  side: string;
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p
        className="font-[family-name:var(--font-ui)] font-semibold uppercase"
        style={{
          margin: 0,
          marginBottom: 'var(--lf-space-2)',
          fontSize: 'var(--lf-type-label)',
          letterSpacing: 'var(--lf-type-tracking-label)',
          color: 'var(--lf-color-text-faint)',
        }}
      >
        {side}
      </p>
      <CrestMonogram initials={team.shortName} label={team.name} size="lg" />
      <div style={{ marginTop: 'var(--lf-space-3)' }}>
        <FormPills form={team.form} />
      </div>
      <p
        className="tabular-nums"
        style={{
          margin: 0,
          marginTop: 'var(--lf-space-2)',
          fontSize: 'var(--lf-type-caption)',
          color: 'var(--lf-color-text-muted)',
        }}
      >
        {team.place}. miejsce · {team.points} pkt
      </p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="font-[family-name:var(--font-ui)] font-semibold uppercase"
        style={{
          fontSize: 'var(--lf-type-label)',
          letterSpacing: 'var(--lf-type-tracking-label)',
          color: 'var(--lf-color-text-faint)',
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 'var(--lf-space-1)', color: 'var(--lf-color-text-secondary)' }}>{value}</div>
    </div>
  );
}
