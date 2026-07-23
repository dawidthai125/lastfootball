'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';

import {
  POSITION_FILTERS,
  SQUAD_PLAYERS,
  STATUS_FILTERS,
  STATUS_LABEL,
  type PlayerStatus,
  type SortKey,
  type SquadPlayer,
} from '@/data/squad';

const controlStyle: CSSProperties = {
  borderWidth: 'var(--lf-border-width-hair)',
  borderStyle: 'solid',
  borderColor: 'var(--lf-color-border-subtle)',
  background: 'var(--lf-color-bg-inset)',
  color: 'var(--lf-color-text-secondary)',
  fontSize: 'var(--lf-type-table)',
  padding: 'var(--lf-space-1) var(--lf-space-2)',
  borderRadius: 'var(--lf-radius-sm)',
};

function statusColor(status: PlayerStatus): { border: string; bg: string; text: string } {
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

function comparePlayers(a: SquadPlayer, b: SquadPlayer, sort: SortKey, dir: 'asc' | 'desc'): number {
  const mul = dir === 'asc' ? 1 : -1;
  switch (sort) {
    case 'name':
      return mul * a.name.localeCompare(b.name, 'pl');
    case 'position':
      return mul * a.position.localeCompare(b.position, 'pl');
    case 'age':
      return mul * (a.age - b.age);
    case 'form':
      return mul * (a.form - b.form);
    case 'energy':
      return mul * (a.energy - b.energy);
    case 'skill':
      return mul * (a.skill - b.skill);
    case 'status':
      return mul * a.status.localeCompare(b.status);
    default:
      return 0;
  }
}

export function SquadView() {
  const router = useRouter();
  const [position, setPosition] = useState<(typeof POSITION_FILTERS)[number]>('ALL');
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('ALL');
  const [sort, setSort] = useState<SortKey>('skill');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');

  const rows = useMemo(() => {
    let list = [...SQUAD_PLAYERS];
    if (position !== 'ALL') list = list.filter((p) => p.position === position);
    if (status !== 'ALL') list = list.filter((p) => p.status === status);
    list.sort((a, b) => comparePlayers(a, b, sort, dir));
    return list;
  }, [position, status, sort, dir]);

  function toggleSort(key: SortKey) {
    if (sort === key) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSort(key);
      setDir(key === 'name' || key === 'position' || key === 'status' ? 'asc' : 'desc');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-3)' }}>
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 'var(--lf-space-3)',
          borderBottomWidth: 'var(--lf-border-width-hair)',
          borderBottomStyle: 'solid',
          borderBottomColor: 'var(--lf-color-border-subtle)',
          paddingBottom: 'var(--lf-space-2)',
        }}
      >
        <div>
          <h1
            className="font-[family-name:var(--font-ui)] font-semibold"
            style={{ margin: 0, fontSize: 'var(--lf-type-h1)', color: 'var(--lf-color-text-primary)' }}
          >
            Kadra
          </h1>
          <p
            style={{
              margin: 0,
              marginTop: 'var(--lf-space-1)',
              fontSize: 'var(--lf-type-caption)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            Pierwsza drużyna · {rows.length} z {SQUAD_PLAYERS.length} zawodników
          </p>
        </div>
      </header>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--lf-space-3)',
          alignItems: 'flex-end',
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-subtle)',
          background: 'var(--lf-color-bg-panel)',
          padding: 'var(--lf-space-3)',
          borderRadius: 'var(--lf-radius-sm)',
        }}
      >
        <label style={{ display: 'grid', gap: 'var(--lf-space-1)' }}>
          <span
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            Pozycja
          </span>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as (typeof POSITION_FILTERS)[number])}
            style={controlStyle}
          >
            {POSITION_FILTERS.map((p) => (
              <option key={p} value={p}>
                {p === 'ALL' ? 'Wszystkie' : p}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: 'var(--lf-space-1)' }}>
          <span
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            Status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof STATUS_FILTERS)[number])}
            style={controlStyle}
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'Wszystkie' : STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: 'var(--lf-space-1)' }}>
          <span
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            Sortuj
          </span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} style={controlStyle}>
            <option value="skill">Umiejętność</option>
            <option value="form">Forma</option>
            <option value="energy">Energia</option>
            <option value="name">Nazwisko</option>
            <option value="position">Pozycja</option>
            <option value="age">Wiek</option>
            <option value="status">Status</option>
          </select>
        </label>

        <button
          type="button"
          onClick={() => setDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
          style={{
            ...controlStyle,
            borderColor: 'var(--lf-color-border-strong)',
            background: 'var(--lf-color-bg-panel-alt)',
            cursor: 'pointer',
          }}
        >
          Kierunek: {dir === 'asc' ? 'rosnąco' : 'malejąco'}
        </button>
      </div>

      <div
        style={{
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-subtle)',
          background: 'var(--lf-color-bg-panel)',
          borderRadius: 'var(--lf-radius-sm)',
          overflow: 'auto',
          maxHeight: 'calc(100dvh - var(--lf-shell-topbar) - var(--lf-space-8) - var(--lf-space-8))',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'var(--lf-type-table)',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr>
              {(
                [
                  ['name', 'Zawodnik', 'left'],
                  ['position', 'Poz.', 'left'],
                  ['age', 'Wiek', 'right'],
                  ['form', 'Forma', 'right'],
                  ['energy', 'Energia', 'right'],
                  ['skill', 'Umiej.', 'right'],
                  ['status', 'Status', 'left'],
                ] as const
              ).map(([key, label, align]) => (
                <th
                  key={key}
                  className="font-[family-name:var(--font-ui)] font-semibold uppercase"
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 'var(--lf-z-sticky)',
                    background: 'var(--lf-color-bg-inset)',
                    padding: 'var(--lf-space-2)',
                    fontSize: 'var(--lf-type-label)',
                    letterSpacing: 'var(--lf-type-tracking-label)',
                    color: 'var(--lf-color-text-faint)',
                    textAlign: align,
                    borderBottomWidth: 'var(--lf-border-width-hair)',
                    borderBottomStyle: 'solid',
                    borderBottomColor: 'var(--lf-color-border-subtle)',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleSort(key)}
                >
                  {label}
                  {sort === key ? (dir === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const sc = statusColor(p.status);
              return (
                <tr
                  key={p.id}
                  tabIndex={0}
                  role="link"
                  aria-label={`Otwórz profil: ${p.name}`}
                  onClick={() => router.push(`/players/${p.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/players/${p.id}`);
                    }
                  }}
                  style={{
                    borderBottomWidth: 'var(--lf-border-width-hair)',
                    borderBottomStyle: 'solid',
                    borderBottomColor: 'var(--lf-color-border-subtle)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--lf-color-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td
                    style={{
                      padding: 'var(--lf-space-2)',
                      fontWeight: 600,
                      color: 'var(--lf-color-text-primary)',
                    }}
                  >
                    {p.name}
                  </td>
                  <td style={{ padding: 'var(--lf-space-2)' }}>{p.position}</td>
                  <td className="tabular-nums" style={{ padding: 'var(--lf-space-2)', textAlign: 'right' }}>
                    {p.age}
                  </td>
                  <td className="tabular-nums" style={{ padding: 'var(--lf-space-2)', textAlign: 'right' }}>
                    {p.form}
                  </td>
                  <td className="tabular-nums" style={{ padding: 'var(--lf-space-2)', textAlign: 'right' }}>
                    {p.energy}
                  </td>
                  <td
                    className="tabular-nums font-semibold"
                    style={{
                      padding: 'var(--lf-space-2)',
                      textAlign: 'right',
                      color: 'var(--lf-color-text-gold)',
                    }}
                  >
                    {p.skill}
                  </td>
                  <td style={{ padding: 'var(--lf-space-2)' }}>
                    <span
                      className="font-[family-name:var(--font-ui)] font-semibold uppercase"
                      style={{
                        fontSize: 'var(--lf-type-label)',
                        padding: '0 var(--lf-space-1)',
                        borderWidth: 'var(--lf-border-width-hair)',
                        borderStyle: 'solid',
                        borderRadius: 'var(--lf-radius-xs)',
                        borderColor: sc.border,
                        background: sc.bg,
                        color: sc.text,
                      }}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: 'var(--lf-space-5)',
                    textAlign: 'center',
                    color: 'var(--lf-color-text-muted)',
                    fontSize: 'var(--lf-type-body)',
                  }}
                >
                  Brak zawodników dla wybranych filtrów. Zmień filtry lub wróć do pełnej listy.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
