'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { PlayerPortrait } from '@/components/assets';
import { EmptyState, LocationHero } from '@/components/ui';
import {
  POSITION_FILTERS,
  STATUS_FILTERS,
  STATUS_LABEL,
  type PlayerStatus,
  type SortKey,
  type SquadPlayerDto,
} from '@/lib/squad';

import './squad-decision.css';

type SquadPlayer = SquadPlayerDto;

/** UI-only attention thresholds (presentation — not domain). */
const ENERGY_ATTENTION = 45;
const FORM_ATTENTION = 50;
const ATTENTION_LIMIT = 5;

function statusColor(status: PlayerStatus): { border: string; bg: string; text: string } {
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

function attentionRank(p: SquadPlayer): number {
  if (p.status === 'DEPARTED') return 999;
  if (p.status === 'INJURED') return 0;
  if (p.status === 'SUSPENDED') return 1;
  if (p.status === 'TIRED') return 2;
  if (p.energy < ENERGY_ATTENTION) return 3;
  if (p.form < FORM_ATTENTION) return 4;
  return 999;
}

function attentionReason(p: SquadPlayer): string {
  if (p.status === 'INJURED' || p.status === 'SUSPENDED' || p.status === 'TIRED') {
    return STATUS_LABEL[p.status];
  }
  if (p.energy < ENERGY_ATTENTION) return `Energia ${p.energy}`;
  if (p.form < FORM_ATTENTION) return `Forma ${p.form}`;
  return STATUS_LABEL[p.status];
}

function comparePlayers(
  a: SquadPlayer,
  b: SquadPlayer,
  sort: SortKey,
  dir: 'asc' | 'desc',
): number {
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

/**
 * Squad Experience — LFE-UI-IMPL-03 / HF-SQD-01.
 * Decision-first presentation; squad DTO / domain unchanged.
 */
export function SquadView({ players }: { players: readonly SquadPlayerDto[] }) {
  if (players.length === 0) {
    return <SquadEmpty />;
  }
  return <SquadRoster players={players} />;
}

function SquadEmpty() {
  return (
    <div className="lf-sq" data-lf-impl="LFE-UI-IMPL-03">
      <LocationHero waId="HERO-004" src="/assets/world-art/hero-004-locker-night.png" priority />
      <EmptyState
        waId="EMP-002"
        illustrationSrc="/assets/world-art/emp-002-empty-locker.png"
        title="Szatnia jest pusta"
        body="Nie ma jeszcze zawodników do przeglądu. Wróć do Hub albo sprawdź trening, gdy kadra będzie dostępna."
        links={[
          { href: '/hub', label: 'Hub' },
          { href: '/training', label: 'Trening' },
        ]}
      />
    </div>
  );
}

function SquadRoster({ players }: { players: readonly SquadPlayerDto[] }) {
  const router = useRouter();
  const [position, setPosition] = useState<(typeof POSITION_FILTERS)[number]>('ALL');
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('ALL');
  const [sort, setSort] = useState<SortKey>('skill');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');

  const squadCounts = useMemo(() => {
    let ready = 0;
    let injured = 0;
    let tired = 0;
    for (const p of players) {
      if (p.status === 'READY') ready += 1;
      else if (p.status === 'INJURED') injured += 1;
      else if (p.status === 'TIRED') tired += 1;
    }
    return { ready, injured, tired, total: players.length };
  }, [players]);

  const attention = useMemo(() => {
    return [...players]
      .map((p) => ({ player: p, rank: attentionRank(p) }))
      .filter((x) => x.rank < 999)
      .sort((a, b) => a.rank - b.rank || a.player.name.localeCompare(b.player.name, 'pl'))
      .slice(0, ATTENTION_LIMIT)
      .map((x) => x.player);
  }, [players]);

  const rows = useMemo(() => {
    let list = [...players];
    if (position !== 'ALL') list = list.filter((p) => p.position === position);
    if (status !== 'ALL') list = list.filter((p) => p.status === status);
    list.sort((a, b) => comparePlayers(a, b, sort, dir));
    return list;
  }, [players, position, status, sort, dir]);

  function openPlayer(id: string) {
    router.push(`/players/${id}`);
  }

  function toggleSort(key: SortKey) {
    if (sort === key) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSort(key);
      setDir(key === 'name' || key === 'position' || key === 'status' ? 'asc' : 'desc');
    }
  }

  return (
    <div className="lf-sq" data-lf-impl="LFE-UI-IMPL-03">
      <LocationHero waId="HERO-004" src="/assets/world-art/hero-004-locker-night.png" priority />
      <div className="lf-sq__axis">
        {/* M1 — Squad Hero (D2) */}
        <header className="lf-sq__hero">
          <p className="lf-sq__eyebrow">Kadra</p>
          <h1 className="lf-sq__question">Który zawodnik wymaga dziś mojej uwagi?</h1>
          <p className="lf-sq__status-line">
            Gotowi <strong>{squadCounts.ready}</strong>
            {' · '}
            Kontuzje <strong>{squadCounts.injured}</strong>
            {' · '}
            Zmęczeni <strong>{squadCounts.tired}</strong>
            {' · '}
            Razem <strong>{squadCounts.total}</strong>
          </p>
        </header>

        {/* M1 — Attention Summary (D3) */}
        <section className="lf-sq__attention" aria-labelledby="lf-sq-attention-title">
          <h2 id="lf-sq-attention-title" className="lf-sq__section-title">
            Wymagają uwagi
          </h2>
          {attention.length === 0 ? (
            <p className="lf-sq__empty">
              Dziś nikt nie wymaga pilnej uwagi — przejrzyj kadrę poniżej.
            </p>
          ) : (
            <ul className="lf-sq__attention-list">
              {attention.map((p) => {
                const sc = statusColor(p.status);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="lf-sq__attention-item"
                      onClick={() => openPlayer(p.id)}
                      aria-label={`Otwórz profil: ${p.name}`}
                    >
                      <PlayerPortrait playerId={p.id} name={p.name} size="sm" />
                      <span className="lf-sq__attention-body">
                        <span className="lf-sq__attention-name">{p.name}</span>
                        <span className="lf-sq__attention-meta">
                          {p.position} · {attentionReason(p)}
                        </span>
                      </span>
                      <span
                        className="lf-sq__chip"
                        style={{
                          borderColor: sc.border,
                          background: sc.bg,
                          color: sc.text,
                        }}
                      >
                        {STATUS_LABEL[p.status]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <Link href="/training" className="lf-sq__soft-link">
            Trening
          </Link>
        </section>
      </div>

      {/* M2/M3 — Browse under decision (D4); cards mobile / table desktop (D6) */}
      <section className="lf-sq__browse" aria-labelledby="lf-sq-browse-title">
        <h2 id="lf-sq-browse-title" className="lf-sq__section-title lf-sq__section-title--muted">
          Pełna kadra
        </h2>
        <p className="lf-sq__empty">
          {rows.length} z {players.length} zawodników
        </p>

        <div className="lf-sq__filters">
          <label className="lf-sq__filter">
            <span className="lf-sq__filter-label">Pozycja</span>
            <select
              className="lf-sq__control"
              value={position}
              onChange={(e) => setPosition(e.target.value as (typeof POSITION_FILTERS)[number])}
            >
              {POSITION_FILTERS.map((p) => (
                <option key={p} value={p}>
                  {p === 'ALL' ? 'Wszystkie' : p}
                </option>
              ))}
            </select>
          </label>

          <label className="lf-sq__filter">
            <span className="lf-sq__filter-label">Status</span>
            <select
              className="lf-sq__control"
              value={status}
              onChange={(e) => setStatus(e.target.value as (typeof STATUS_FILTERS)[number])}
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'Wszystkie' : STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="lf-sq__filter">
            <span className="lf-sq__filter-label">Sortuj</span>
            <select
              className="lf-sq__control"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
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
            className="lf-sq__control lf-sq__dir"
            onClick={() => setDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
          >
            Kierunek: {dir === 'asc' ? 'rosnąco' : 'malejąco'}
          </button>
        </div>

        {/* Mobile cards */}
        <ul className="lf-sq__cards">
          {rows.map((p) => {
            const sc = statusColor(p.status);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  className="lf-sq__card"
                  onClick={() => openPlayer(p.id)}
                  aria-label={`Otwórz profil: ${p.name}`}
                >
                  <PlayerPortrait playerId={p.id} name={p.name} size="sm" />
                  <span className="lf-sq__card-body">
                    <span className="lf-sq__card-name">{p.name}</span>
                    <span className="lf-sq__card-meta">
                      {p.position} · Forma {p.form} · Energia {p.energy} ·{' '}
                      <span className="lf-sq__skill">{p.skill}</span>
                    </span>
                  </span>
                  <span
                    className="lf-sq__chip"
                    style={{
                      borderColor: sc.border,
                      background: sc.bg,
                      color: sc.text,
                    }}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                </button>
              </li>
            );
          })}
          {rows.length === 0 ? (
            <li className="lf-sq__empty">
              Brak zawodników dla wybranych filtrów. Zmień filtry lub wróć do pełnej listy.
            </li>
          ) : null}
        </ul>

        {/* Desktop table */}
        <div className="lf-sq__table-wrap">
          <table className="lf-sq__table">
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
                  <th key={key} style={{ textAlign: align }} onClick={() => toggleSort(key)}>
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
                    onClick={() => openPlayer(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openPlayer(p.id);
                      }
                    }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--lf-color-text-primary)' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--lf-space-2)',
                        }}
                      >
                        <PlayerPortrait playerId={p.id} name={p.name} size="sm" />
                        {p.name}
                      </span>
                    </td>
                    <td>{p.position}</td>
                    <td className="tabular-nums" style={{ textAlign: 'right' }}>
                      {p.age}
                    </td>
                    <td className="tabular-nums" style={{ textAlign: 'right' }}>
                      {p.form}
                    </td>
                    <td className="tabular-nums" style={{ textAlign: 'right' }}>
                      {p.energy}
                    </td>
                    <td className="lf-sq__skill" style={{ textAlign: 'right' }}>
                      {p.skill}
                    </td>
                    <td>
                      <span
                        className="lf-sq__chip"
                        style={{
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
                  <td colSpan={7} className="lf-sq__table-empty">
                    Brak zawodników dla wybranych filtrów. Zmień filtry lub wróć do pełnej listy.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
