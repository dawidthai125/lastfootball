import Link from 'next/link';

import { AtmosphereLayer, ClubCrest, PlayerPortrait } from '@/components/assets';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatMoney } from '@/data/mock';
import { STATUS_LABEL, type SquadPlayerDto } from '@/lib/squad';
import { SectionShell } from '@/components/panel/SectionShell';
import { dashboardMock } from '@/data/mock';

import './squad-decision.css';

type SquadPlayer = SquadPlayerDto;

function statusTone(status: SquadPlayer['status']): {
  border: string;
  bg: string;
  text: string;
} {
  switch (status) {
    case 'READY':
      return {
        border: 'var(--lf-color-status-ok)',
        bg: 'var(--lf-color-status-ok-soft)',
        text: 'var(--lf-color-status-ok)',
      };
    case 'INJURED':
      return {
        border: 'var(--lf-color-status-danger)',
        bg: 'var(--lf-color-status-danger-soft)',
        text: 'var(--lf-color-status-danger)',
      };
    case 'TIRED':
      return {
        border: 'var(--lf-color-status-warn)',
        bg: 'var(--lf-color-status-warn-soft)',
        text: 'var(--lf-color-status-warn)',
      };
    case 'SUSPENDED':
    case 'DEPARTED':
      return {
        border: 'var(--lf-color-border-strong)',
        bg: 'var(--lf-color-bg-inset)',
        text: 'var(--lf-color-text-muted)',
      };
  }
}

/** Hero — identity only (status chip kept as identity signal). */
export function PlayerHero({ player }: { player: SquadPlayer }) {
  const tone = statusTone(player.status);

  return (
    <AtmosphereLayer aria-label="Player Hero" className="lf-sq-detail__hero">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--lf-space-4)',
          padding: 'var(--lf-space-5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--lf-space-2)' }}>
          <PlayerPortrait playerId={player.id} name={player.name} size="lg" />
          <ClubCrest
            shortName={dashboardMock.club.shortName}
            clubName={dashboardMock.club.name}
            size="sm"
          />
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
          <p
            style={{
              margin: 0,
              marginTop: 'var(--lf-space-2)',
              fontSize: 'var(--lf-type-caption)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            Poz.{' '}
            <strong style={{ color: 'var(--lf-color-text-primary)' }}>{player.position}</strong>
            {' · '}
            Wiek{' '}
            <strong className="tabular-nums" style={{ color: 'var(--lf-color-text-primary)' }}>
              {player.age}
            </strong>
          </p>
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
    </AtmosphereLayer>
  );
}

/** Decision row — equal weight paths; back to squad highlighted (not Transfers-first). */
export function PlayerActions({ player }: { player: SquadPlayer }) {
  return (
    <nav className="lf-sq-detail__decisions" aria-label={`Decyzje: ${player.name}`}>
      <Link href="/squad" className="lf-sq-detail__decision lf-sq-detail__decision--back">
        Wróć do kadry
      </Link>
      <Link href="/training" className="lf-sq-detail__decision">
        Trening
      </Link>
      <Link href="/transfers" className="lf-sq-detail__decision">
        Transfery
      </Link>
    </nav>
  );
}

/** Status strip — form / energy / skill (after decision). */
export function PlayerStatus({ player }: { player: SquadPlayer }) {
  return (
    <div className="lf-sq-detail__status" aria-label="Status zawodnika">
      <span>
        Forma <strong>{player.form}</strong>
      </span>
      <span>
        Energia <strong>{player.energy}</strong>
      </span>
      <span>
        Umiejętność <strong style={{ color: 'var(--lf-color-text-gold)' }}>{player.skill}</strong>
      </span>
      <span>
        Potencjał <strong>{player.potentialLabel}</strong>
      </span>
      <span>
        Kariera <strong>{player.careerPhaseLabel}</strong>
      </span>
      <span>
        Status <strong>{STATUS_LABEL[player.status]}</strong>
      </span>
    </div>
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
