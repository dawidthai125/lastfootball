import Link from 'next/link';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatMoney } from '@/data/mock';
import { STATUS_LABEL, type SquadPlayer } from '@/data/squad';
import { SectionShell } from '@/components/panel/SectionShell';

function statusTone(status: SquadPlayer['status']): {
  border: string;
  bg: string;
  text: string;
} {
  switch (status) {
    case 'ready':
      return {
        border: 'var(--lf-color-status-ok)',
        bg: 'var(--lf-color-status-ok-soft)',
        text: 'var(--lf-color-status-ok)',
      };
    case 'injured':
      return {
        border: 'var(--lf-color-status-danger)',
        bg: 'var(--lf-color-status-danger-soft)',
        text: 'var(--lf-color-status-danger)',
      };
    case 'tired':
      return {
        border: 'var(--lf-color-status-warn)',
        bg: 'var(--lf-color-status-warn-soft)',
        text: 'var(--lf-color-status-warn)',
      };
    case 'suspended':
      return {
        border: 'var(--lf-color-border-strong)',
        bg: 'var(--lf-color-bg-inset)',
        text: 'var(--lf-color-text-muted)',
      };
  }
}

export function PlayerHero({ player }: { player: SquadPlayer }) {
  const tone = statusTone(player.status);

  return (
    <section
      aria-label="Player Hero"
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
        <div
          className="font-[family-name:var(--font-ui)] font-bold"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'calc(var(--lf-space-8) + var(--lf-space-6))',
            height: 'calc(var(--lf-space-8) + var(--lf-space-6))',
            flexShrink: 0,
            background: 'var(--lf-color-gold-soft)',
            borderWidth: 'var(--lf-border-width-hair)',
            borderStyle: 'solid',
            borderColor: 'var(--lf-color-border-gold)',
            color: 'var(--lf-color-gold-base)',
            fontSize: 'var(--lf-type-h1)',
            borderRadius: 'var(--lf-radius-sm)',
          }}
        >
          {player.position}
        </div>

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
            Zawodnik · {player.nationality}
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
            {player.name}
          </h1>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--lf-space-3)',
              marginTop: 'var(--lf-space-3)',
              fontSize: 'var(--lf-type-caption)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            <span>
              Wiek{' '}
              <strong className="tabular-nums" style={{ color: 'var(--lf-color-text-primary)' }}>
                {player.age}
              </strong>
            </span>
            <span>
              Forma{' '}
              <strong className="tabular-nums" style={{ color: 'var(--lf-color-status-ok)' }}>
                {player.form}
              </strong>
            </span>
            <span>
              Energia{' '}
              <strong className="tabular-nums" style={{ color: 'var(--lf-color-text-primary)' }}>
                {player.energy}
              </strong>
            </span>
            <span>
              Umiejętność{' '}
              <strong className="tabular-nums" style={{ color: 'var(--lf-color-text-gold)' }}>
                {player.skill}
              </strong>
            </span>
          </div>
        </div>

        <span
          className="font-[family-name:var(--font-ui)] font-semibold uppercase"
          style={{
            fontSize: 'var(--lf-type-label)',
            letterSpacing: 'var(--lf-type-tracking-label)',
            padding: 'var(--lf-space-1) var(--lf-space-2)',
            borderWidth: 'var(--lf-border-width-hair)',
            borderStyle: 'solid',
            borderRadius: 'var(--lf-radius-sm)',
            borderColor: tone.border,
            background: tone.bg,
            color: tone.text,
            flexShrink: 0,
          }}
        >
          {STATUS_LABEL[player.status]}
        </span>
      </div>
    </section>
  );
}

export function PlayerAttributes({ player }: { player: SquadPlayer }) {
  return (
    <SectionShell title="Atrybuty">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-3)' }}>
        {player.attributes.map((a) => (
          <ProgressBar key={a.label} label={a.label} value={a.value} tone="gold" />
        ))}
      </div>
    </SectionShell>
  );
}

export function PlayerContract({ player }: { player: SquadPlayer }) {
  const c = player.contract;
  const rows = [
    { label: 'Wynagrodzenie', value: `${formatMoney(c.wage)} / tydz.` },
    { label: 'Do', value: c.until },
    { label: 'Klauzula', value: formatMoney(c.clause) },
    { label: 'Rola', value: c.role },
  ];

  return (
    <SectionShell title="Kontrakt">
      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 'var(--lf-space-3)',
          margin: 0,
        }}
      >
        {rows.map((r) => (
          <div key={r.label}>
            <dt
              className="font-[family-name:var(--font-ui)] font-semibold uppercase"
              style={{
                fontSize: 'var(--lf-type-label)',
                letterSpacing: 'var(--lf-type-tracking-label)',
                color: 'var(--lf-color-text-faint)',
              }}
            >
              {r.label}
            </dt>
            <dd
              className="tabular-nums"
              style={{
                margin: 0,
                marginTop: 'var(--lf-space-1)',
                fontSize: 'var(--lf-type-body)',
                color: 'var(--lf-color-text-primary)',
              }}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </SectionShell>
  );
}

export function PlayerHistory({ player }: { player: SquadPlayer }) {
  return (
    <SectionShell title="Historia">
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {player.history.map((line) => (
          <li
            key={line}
            style={{
              borderBottomWidth: 'var(--lf-border-width-hair)',
              borderBottomStyle: 'solid',
              borderBottomColor: 'var(--lf-color-border-subtle)',
              paddingBlock: 'var(--lf-space-2)',
              fontSize: 'var(--lf-type-table)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            {line}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function PlayerActions({ player }: { player: SquadPlayer }) {
  const actions = [
    { href: '/training', label: 'Trening', primary: false },
    { href: `/transfers?list=${player.id}`, label: 'Wystaw', primary: false },
    { href: `/transfers?offer=${player.id}`, label: 'Oferta', primary: true },
  ];

  return (
    <div
      aria-label="Akcje zawodnika"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--lf-space-2)',
        borderWidth: 'var(--lf-border-width-hair)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        background: 'var(--lf-color-bg-panel)',
        padding: 'var(--lf-space-3)',
        borderRadius: 'var(--lf-radius-sm)',
      }}
    >
      {actions.map((a) => (
        <Link
          key={a.label}
          href={a.href}
          style={{
            borderWidth: 'var(--lf-border-width-hair)',
            borderStyle: 'solid',
            borderColor: a.primary ? 'var(--lf-color-border-gold)' : 'var(--lf-color-border-strong)',
            background: a.primary ? 'var(--lf-color-gold-soft)' : 'var(--lf-color-bg-panel-alt)',
            color: a.primary ? 'var(--lf-color-gold-base)' : 'var(--lf-color-text-secondary)',
            fontSize: 'var(--lf-type-caption)',
            fontWeight: a.primary ? 600 : 400,
            padding: 'var(--lf-space-2) var(--lf-space-3)',
            borderRadius: 'var(--lf-radius-sm)',
          }}
        >
          {a.label}
        </Link>
      ))}
    </div>
  );
}
