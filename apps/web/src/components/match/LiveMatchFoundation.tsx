'use client';

import Link from 'next/link';
import { useState, type CSSProperties } from 'react';

import { CrestMonogram } from '@/components/match/CrestMonogram';
import type { LiveEventKind, LiveMatchBundle } from '@/data/fixtures';
import { dashboardMock } from '@/data/mock';

/**
 * Live Match UI — full chrome for LFE-UI-01 mockup-17.
 * `#lf-match-canvas-root` is the future Canvas host. No engine logic here.
 */
export function LiveMatchFoundation({ bundle }: { bundle: LiveMatchBundle }) {
  const { fixture } = bundle;
  const us = dashboardMock.club;
  const homeName = fixture.home ? us.name : fixture.opponent;
  const awayName = fixture.home ? fixture.opponent : us.name;
  const homeShort = fixture.home ? us.shortName : fixture.opponentShort;
  const awayShort = fixture.home ? fixture.opponentShort : us.shortName;

  const [viewMode, setViewMode] = useState(bundle.viewModes[0]?.id ?? 'tactical');
  const [commandId, setCommandId] = useState(bundle.commands[0]?.id ?? '');
  const [feedFilter, setFeedFilter] = useState<'all' | LiveEventKind>('all');
  const [rightTab, setRightTab] = useState<'commands' | 'stats' | 'subs'>('commands');

  const events =
    feedFilter === 'all'
      ? bundle.events
      : bundle.events.filter((e) => e.kind === feedFilter);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--lf-space-3)',
        minHeight: 'calc(100dvh - var(--lf-shell-topbar) - var(--lf-space-8))',
      }}
    >
      {/* Scorebug */}
      <header
        role="status"
        aria-label="Scorebug"
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0, 1fr) auto',
          gap: 'var(--lf-space-4)',
          alignItems: 'center',
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-subtle)',
          background: 'var(--lf-color-bg-panel)',
          padding: 'var(--lf-space-3) var(--lf-space-4)',
          borderRadius: 'var(--lf-radius-sm)',
        }}
      >
        <div style={{ fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-muted)' }}>
          <span
            className="font-[family-name:var(--font-ui)] font-bold uppercase"
            style={{
              marginRight: 'var(--lf-space-2)',
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              padding: 'var(--lf-space-1) var(--lf-space-2)',
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-status-live)',
              background: 'var(--lf-color-status-danger-soft)',
              color: 'var(--lf-color-status-live)',
              borderRadius: 'var(--lf-radius-sm)',
            }}
          >
            Live
          </span>
          {bundle.viewers} oglądających
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--lf-space-4)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--lf-space-2)' }}>
            <CrestMonogram initials={homeShort} size="md" />
            <span
              className="font-[family-name:var(--font-ui)] font-semibold"
              style={{ fontSize: 'var(--lf-type-h2)', color: 'var(--lf-color-text-primary)' }}
            >
              {homeName}
            </span>
            <span
              className="tabular-nums font-[family-name:var(--font-ui)] font-bold"
              style={{ fontSize: 'var(--lf-type-h1)', color: 'var(--lf-color-text-gold)' }}
            >
              {bundle.homeScore}
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              className="tabular-nums font-[family-name:var(--font-ui)] font-bold"
              style={{ fontSize: 'var(--lf-type-h1)', color: 'var(--lf-color-text-gold)', lineHeight: 1 }}
            >
              {bundle.clock}
            </div>
            <div
              className="font-[family-name:var(--font-ui)] font-semibold uppercase"
              style={{
                marginTop: 'var(--lf-space-1)',
                fontSize: 'var(--lf-type-label)',
                letterSpacing: 'var(--lf-type-tracking-label)',
                color: 'var(--lf-color-text-muted)',
              }}
            >
              {bundle.period}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--lf-space-2)' }}>
            <span
              className="tabular-nums font-[family-name:var(--font-ui)] font-bold"
              style={{ fontSize: 'var(--lf-type-h1)', color: 'var(--lf-color-text-gold)' }}
            >
              {bundle.awayScore}
            </span>
            <span
              className="font-[family-name:var(--font-ui)] font-semibold"
              style={{ fontSize: 'var(--lf-type-h2)', color: 'var(--lf-color-text-primary)' }}
            >
              {awayName}
            </span>
            <CrestMonogram initials={awayShort} size="md" />
          </div>
        </div>

        <div
          style={{
            textAlign: 'right',
            fontSize: 'var(--lf-type-caption)',
            color: 'var(--lf-color-text-muted)',
          }}
        >
          <div>{bundle.weather}</div>
          <div>
            {fixture.stadium} · {bundle.stadiumCapacity}
          </div>
        </div>
      </header>

      {/* Main 3-column stage */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(12rem, 16rem) minmax(0, 1fr) minmax(12rem, 16rem)',
          gap: 'var(--lf-space-3)',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Commentary / event feed */}
        <section
          aria-label="Commentary feed"
          style={{
            borderWidth: 'var(--lf-border-width-hair)',
            borderStyle: 'solid',
            borderColor: 'var(--lf-color-border-subtle)',
            background: 'var(--lf-color-bg-panel)',
            borderRadius: 'var(--lf-radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            maxHeight: 'calc(100dvh - var(--lf-shell-topbar) - var(--lf-space-8) * 3)',
          }}
        >
          <header
            style={{
              padding: 'var(--lf-space-2) var(--lf-space-3)',
              borderBottomWidth: 'var(--lf-border-width-hair)',
              borderBottomStyle: 'solid',
              borderBottomColor: 'var(--lf-color-border-subtle)',
              background: 'var(--lf-color-bg-panel-alt)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--lf-space-1)',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2
              className="font-[family-name:var(--font-ui)] font-semibold uppercase"
              style={{
                margin: 0,
                fontSize: 'var(--lf-type-label)',
                letterSpacing: 'var(--lf-type-tracking-label)',
                color: 'var(--lf-color-text-gold)',
              }}
            >
              Feed
            </h2>
            <div style={{ display: 'flex', gap: 'var(--lf-space-1)', flexWrap: 'wrap' }}>
              {(
                [
                  ['all', 'Wszystkie'],
                  ['goal', 'Gole'],
                  ['card', 'Kartki'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFeedFilter(id)}
                  style={chipStyle(feedFilter === id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </header>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 'var(--lf-space-2)',
              overflow: 'auto',
              flex: 1,
            }}
          >
            {events.map((e) => (
              <li
                key={e.id}
                style={{
                  padding: 'var(--lf-space-2)',
                  marginBottom: 'var(--lf-space-1)',
                  borderWidth: 'var(--lf-border-width-hair)',
                  borderStyle: 'solid',
                  borderColor: e.highlight
                    ? 'var(--lf-color-status-danger)'
                    : 'var(--lf-color-border-subtle)',
                  background: e.highlight
                    ? 'var(--lf-color-status-danger-soft)'
                    : 'var(--lf-color-bg-inset)',
                  borderRadius: 'var(--lf-radius-sm)',
                  fontSize: 'var(--lf-type-caption)',
                }}
              >
                <span
                  className="tabular-nums font-[family-name:var(--font-ui)] font-semibold"
                  style={{ color: 'var(--lf-color-text-gold)', marginRight: 'var(--lf-space-2)' }}
                >
                  {e.minute}
                </span>
                <span style={{ color: 'var(--lf-color-text-secondary)' }}>{e.text}</span>
              </li>
            ))}
            {events.length === 0 ? (
              <li
                style={{
                  padding: 'var(--lf-space-3)',
                  color: 'var(--lf-color-text-muted)',
                  fontSize: 'var(--lf-type-caption)',
                }}
              >
                Brak zdarzeń dla filtra.
              </li>
            ) : null}
          </ul>
        </section>

        {/* Canvas + timeline + momentum */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-3)', minHeight: 0 }}>
          <div
            id="lf-match-canvas-root"
            data-lf-canvas-host="true"
            data-match-id={fixture.id}
            data-view-mode={viewMode}
            aria-label="Obszar boiska (Canvas host)"
            style={{
              flex: 1,
              minHeight: 'calc(var(--lf-space-8) * 7)',
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-subtle)',
              background: 'var(--lf-color-bg-void)',
              borderRadius: 'var(--lf-radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 'var(--lf-space-4)',
                borderWidth: 'var(--lf-border-width-hair)',
                borderStyle: 'dashed',
                borderColor: 'var(--lf-color-pitch)',
                opacity: 'var(--lf-opacity-muted)',
                borderRadius: 'var(--lf-radius-sm)',
              }}
            />
            <p
              style={{
                margin: 0,
                position: 'relative',
                textAlign: 'center',
                fontSize: 'var(--lf-type-caption)',
                color: 'var(--lf-color-text-muted)',
                maxWidth: 'calc(var(--lf-space-8) * 6)',
                padding: 'var(--lf-space-4)',
              }}
            >
              Host Canvas:{' '}
              <code style={{ color: 'var(--lf-color-text-gold)' }}>#lf-match-canvas-root</code>
              <br />
              Tryb UI: {bundle.viewModes.find((m) => m.id === viewMode)?.label ?? viewMode}. Silnik
              LFE niepodłączony.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--lf-space-1)',
            }}
          >
            {bundle.viewModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setViewMode(m.id)}
                style={chipStyle(viewMode === m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <section
            aria-label="Timeline"
            style={{
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-subtle)',
              background: 'var(--lf-color-bg-panel)',
              borderRadius: 'var(--lf-radius-sm)',
              padding: 'var(--lf-space-2) var(--lf-space-3)',
            }}
          >
            <div
              className="font-[family-name:var(--font-ui)] font-semibold uppercase"
              style={{
                fontSize: 'var(--lf-type-label)',
                letterSpacing: 'var(--lf-type-tracking-label)',
                color: 'var(--lf-color-text-gold)',
                marginBottom: 'var(--lf-space-2)',
              }}
            >
              Timeline
            </div>
            <div
              style={{
                position: 'relative',
                height: 'var(--lf-space-3)',
                background: 'var(--lf-color-bg-inset)',
                borderRadius: 'var(--lf-radius-xs)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 'var(--lf-space-1)',
                  background: 'var(--lf-color-gold-base)',
                  borderRadius: 'var(--lf-radius-xs)',
                }}
                title="Aktualna minuta (placeholder)"
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 'var(--lf-space-1)',
                fontSize: 'var(--lf-type-label)',
                color: 'var(--lf-color-text-faint)',
              }}
            >
              <span>0′</span>
              <span>45′</span>
              <span>90′</span>
            </div>
          </section>

          {/* Momentum */}
          <section
            aria-label="Momentum"
            style={{
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-subtle)',
              background: 'var(--lf-color-bg-panel)',
              borderRadius: 'var(--lf-radius-sm)',
              padding: 'var(--lf-space-2) var(--lf-space-3)',
            }}
          >
            <div
              className="font-[family-name:var(--font-ui)] font-semibold uppercase"
              style={{
                fontSize: 'var(--lf-type-label)',
                letterSpacing: 'var(--lf-type-tracking-label)',
                color: 'var(--lf-color-text-gold)',
                marginBottom: 'var(--lf-space-2)',
              }}
            >
              Momentum
            </div>
            <MomentumChart values={bundle.momentum} />
          </section>
        </div>

        {/* Right column */}
        <aside
          aria-label="Panel komend i kontekst"
          style={{
            borderWidth: 'var(--lf-border-width-hair)',
            borderStyle: 'solid',
            borderColor: 'var(--lf-color-border-subtle)',
            background: 'var(--lf-color-bg-panel)',
            borderRadius: 'var(--lf-radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            maxHeight: 'calc(100dvh - var(--lf-shell-topbar) - var(--lf-space-8) * 3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 'var(--lf-space-1)',
              padding: 'var(--lf-space-2)',
              borderBottomWidth: 'var(--lf-border-width-hair)',
              borderBottomStyle: 'solid',
              borderBottomColor: 'var(--lf-color-border-subtle)',
              background: 'var(--lf-color-bg-panel-alt)',
              flexWrap: 'wrap',
            }}
          >
            {(
              [
                ['commands', 'Komendy'],
                ['stats', 'Statystyki'],
                ['subs', 'Zmiany'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setRightTab(id)}
                style={chipStyle(rightTab === id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: 'var(--lf-space-3)', overflow: 'auto', flex: 1 }}>
            {rightTab === 'commands' ? (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--lf-space-2)',
                  }}
                >
                  {bundle.commands.map((c) => {
                    const active = commandId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCommandId(c.id)}
                        style={{
                          borderWidth: 'var(--lf-border-width-hair)',
                          borderStyle: 'solid',
                          borderColor: active
                            ? 'var(--lf-color-status-live)'
                            : 'var(--lf-color-border-subtle)',
                          background: active
                            ? 'var(--lf-color-status-danger-soft)'
                            : 'var(--lf-color-bg-inset)',
                          color: active
                            ? 'var(--lf-color-status-live)'
                            : 'var(--lf-color-text-secondary)',
                          fontSize: 'var(--lf-type-caption)',
                          padding: 'var(--lf-space-2)',
                          borderRadius: 'var(--lf-radius-sm)',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  disabled
                  style={{
                    marginTop: 'var(--lf-space-3)',
                    width: '100%',
                    borderWidth: 'var(--lf-border-width-hair)',
                    borderStyle: 'solid',
                    borderColor: 'var(--lf-color-border-gold)',
                    background: 'var(--lf-color-gold-soft)',
                    color: 'var(--lf-color-gold-base)',
                    fontSize: 'var(--lf-type-body)',
                    fontWeight: 600,
                    padding: 'var(--lf-space-2)',
                    borderRadius: 'var(--lf-radius-sm)',
                    opacity: 'var(--lf-opacity-disabled)',
                    cursor: 'not-allowed',
                  }}
                >
                  Zastosuj zmiany
                </button>
                <p
                  style={{
                    margin: 'var(--lf-space-2) 0 0',
                    fontSize: 'var(--lf-type-label)',
                    color: 'var(--lf-color-text-faint)',
                  }}
                >
                  CommandBus LFE — UI gotowe, bez silnika
                </p>
                <div style={{ marginTop: 'var(--lf-space-4)' }}>
                  <div
                    className="font-[family-name:var(--font-ui)] font-semibold uppercase"
                    style={{
                      fontSize: 'var(--lf-type-label)',
                      letterSpacing: 'var(--lf-type-tracking-label)',
                      color: 'var(--lf-color-text-gold)',
                      marginBottom: 'var(--lf-space-2)',
                    }}
                  >
                    Instrukcje
                  </div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {bundle.instructions.map((ins) => (
                      <li
                        key={ins.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 'var(--lf-space-2)',
                          padding: 'var(--lf-space-2) 0',
                          borderBottomWidth: 'var(--lf-border-width-hair)',
                          borderBottomStyle: 'solid',
                          borderBottomColor: 'var(--lf-color-border-subtle)',
                          fontSize: 'var(--lf-type-caption)',
                        }}
                      >
                        <span style={{ color: 'var(--lf-color-text-muted)' }}>{ins.label}</span>
                        <span
                          style={{
                            color: ins.on
                              ? 'var(--lf-color-status-ok)'
                              : 'var(--lf-color-text-secondary)',
                          }}
                        >
                          {ins.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}

            {rightTab === 'stats' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--lf-type-table)' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Stat</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>{homeShort}</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>{awayShort}</th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.stats.map((s) => (
                    <tr key={s.label}>
                      <td style={tdStyle}>{s.label}</td>
                      <td className="tabular-nums" style={{ ...tdStyle, textAlign: 'right' }}>
                        {s.home}
                      </td>
                      <td className="tabular-nums" style={{ ...tdStyle, textAlign: 'right' }}>
                        {s.away}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            {rightTab === 'subs' ? (
              <>
                <p
                  style={{
                    margin: 0,
                    marginBottom: 'var(--lf-space-3)',
                    fontSize: 'var(--lf-type-caption)',
                    color: 'var(--lf-color-text-muted)',
                  }}
                >
                  Pozostałe zmiany:{' '}
                  <strong className="tabular-nums" style={{ color: 'var(--lf-color-text-primary)' }}>
                    {bundle.subs.remaining}
                  </strong>
                </p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {bundle.subs.bench.map((b) => (
                    <li
                      key={b.name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: 'var(--lf-space-2) 0',
                        borderBottomWidth: 'var(--lf-border-width-hair)',
                        borderBottomStyle: 'solid',
                        borderBottomColor: 'var(--lf-color-border-subtle)',
                        fontSize: 'var(--lf-type-caption)',
                      }}
                    >
                      <span style={{ color: 'var(--lf-color-text-primary)' }}>{b.name}</span>
                      <span style={{ color: 'var(--lf-color-text-gold)' }}>{b.pos}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled
                  style={{
                    marginTop: 'var(--lf-space-3)',
                    width: '100%',
                    borderWidth: 'var(--lf-border-width-hair)',
                    borderStyle: 'solid',
                    borderColor: 'var(--lf-color-border-subtle)',
                    background: 'var(--lf-color-bg-inset)',
                    color: 'var(--lf-color-text-faint)',
                    fontSize: 'var(--lf-type-caption)',
                    padding: 'var(--lf-space-2)',
                    borderRadius: 'var(--lf-radius-sm)',
                    opacity: 'var(--lf-opacity-disabled)',
                    cursor: 'not-allowed',
                  }}
                >
                  Wykonaj zmianę (silnik)
                </button>
              </>
            ) : null}
          </div>

          <div
            style={{
              padding: 'var(--lf-space-2) var(--lf-space-3)',
              borderTopWidth: 'var(--lf-border-width-hair)',
              borderTopStyle: 'solid',
              borderTopColor: 'var(--lf-color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--lf-space-1)',
            }}
          >
            <Link
              href={`/match/${fixture.id}`}
              style={{ fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-gold)' }}
            >
              ← Pre Match
            </Link>
            <Link
              href="/matches"
              style={{ fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-muted)' }}
            >
              Terminarz
            </Link>
          </div>
        </aside>
      </div>

      {/* Possession footer */}
      <footer
        aria-label="Possession"
        style={{
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-subtle)',
          background: 'var(--lf-color-bg-panel)',
          borderRadius: 'var(--lf-radius-sm)',
          padding: 'var(--lf-space-2) var(--lf-space-3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 'var(--lf-space-1)',
            fontSize: 'var(--lf-type-caption)',
          }}
        >
          <span className="tabular-nums" style={{ color: 'var(--lf-color-status-danger)' }}>
            {homeShort} {bundle.possession.home}%
          </span>
          <span
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-faint)',
            }}
          >
            Posiadanie
          </span>
          <span className="tabular-nums" style={{ color: 'var(--lf-color-text-gold)' }}>
            {bundle.possession.away}% {awayShort}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            height: 'var(--lf-space-2)',
            borderRadius: 'var(--lf-radius-xs)',
            overflow: 'hidden',
            background: 'var(--lf-color-bg-inset)',
          }}
        >
          <div
            style={{
              width: `${bundle.possession.home}%`,
              background: 'var(--lf-color-status-danger)',
            }}
          />
          <div
            style={{
              width: `${bundle.possession.away}%`,
              background: 'var(--lf-color-gold-base)',
            }}
          />
        </div>
      </footer>
    </div>
  );
}

function chipStyle(active: boolean): CSSProperties {
  return {
    borderWidth: 'var(--lf-border-width-hair)',
    borderStyle: 'solid',
    borderColor: active ? 'var(--lf-color-border-gold)' : 'var(--lf-color-border-subtle)',
    background: active ? 'var(--lf-color-gold-soft)' : 'var(--lf-color-bg-inset)',
    color: active ? 'var(--lf-color-gold-base)' : 'var(--lf-color-text-muted)',
    fontSize: 'var(--lf-type-label)',
    letterSpacing: 'var(--lf-type-tracking-label)',
    textTransform: 'uppercase' as const,
    padding: 'var(--lf-space-1) var(--lf-space-2)',
    borderRadius: 'var(--lf-radius-sm)',
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    fontWeight: 600,
  };
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: 'var(--lf-space-1) 0',
  fontSize: 'var(--lf-type-label)',
  letterSpacing: 'var(--lf-type-tracking-label)',
  color: 'var(--lf-color-text-faint)',
  textTransform: 'uppercase',
  fontWeight: 600,
};

const tdStyle: CSSProperties = {
  padding: 'var(--lf-space-2) 0',
  borderBottomWidth: 'var(--lf-border-width-hair)',
  borderBottomStyle: 'solid',
  borderBottomColor: 'var(--lf-color-border-subtle)',
  color: 'var(--lf-color-text-secondary)',
};

function MomentumChart({ values }: { values: number[] }) {
  const w = 100;
  const h = 28;
  const pts = values
    .map((v, i) => {
      const x = values.length <= 1 ? 0 : (i / (values.length - 1)) * w;
      const y = h - (v / 100) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: 'var(--lf-space-8)', display: 'block' }}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="var(--lf-color-gold-base)"
        strokeWidth="1"
        points={pts}
      />
      <polyline
        fill="none"
        stroke="var(--lf-color-status-danger)"
        strokeWidth="1"
        opacity="var(--lf-opacity-muted)"
        points={values
          .map((v, i) => {
            const x = values.length <= 1 ? 0 : (i / (values.length - 1)) * w;
            const y = h - ((100 - v) / 100) * h;
            return `${x},${y}`;
          })
          .join(' ')}
      />
    </svg>
  );
}
