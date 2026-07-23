'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';

import { NextMatchHero } from '@/components/fixtures/NextMatchHero';
import { ClubCrest } from '@/components/assets';
import {
  COMPETITION_LABEL,
  FIXTURES,
  STATUS_LABEL,
  type CompetitionFilter,
  type Fixture,
  type MatchStatus,
  getNextFixture,
} from '@/data/fixtures';
import { dashboardMock } from '@/data/mock';

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

function statusStyle(status: MatchStatus): { border: string; bg: string; text: string } {
  switch (status) {
    case 'upcoming':
      return {
        border: 'var(--lf-color-status-warn)',
        bg: 'var(--lf-color-status-warn-soft)',
        text: 'var(--lf-color-status-warn)',
      };
    case 'live':
      return {
        border: 'var(--lf-color-status-live)',
        bg: 'var(--lf-color-status-danger-soft)',
        text: 'var(--lf-color-status-live)',
      };
    case 'played':
      return {
        border: 'var(--lf-color-border-subtle)',
        bg: 'var(--lf-color-bg-inset)',
        text: 'var(--lf-color-text-muted)',
      };
    case 'scheduled':
      return {
        border: 'var(--lf-color-status-info)',
        bg: 'var(--lf-color-bg-inset)',
        text: 'var(--lf-color-status-info)',
      };
  }
}

function resultStyle(result?: 'W' | 'R' | 'P') {
  if (result === 'W') {
    return {
      border: 'var(--lf-color-status-ok)',
      bg: 'var(--lf-color-status-ok-soft)',
      text: 'var(--lf-color-status-ok)',
    };
  }
  if (result === 'P') {
    return {
      border: 'var(--lf-color-status-danger)',
      bg: 'var(--lf-color-status-danger-soft)',
      text: 'var(--lf-color-status-danger)',
    };
  }
  return {
    border: 'var(--lf-color-border-subtle)',
    bg: 'var(--lf-color-bg-inset)',
    text: 'var(--lf-color-text-muted)',
  };
}

function preMatchHref(f: Fixture): string | null {
  if (f.status === 'played') return null;
  if (f.status === 'live') return `/match/${f.id}/live`;
  return `/match/${f.id}`;
}

export function FixturesView() {
  const router = useRouter();
  const [competition, setCompetition] = useState<CompetitionFilter>('ALL');
  const next = getNextFixture();

  const rows = useMemo(() => {
    let list = [...FIXTURES];
    if (competition !== 'ALL') list = list.filter((f) => f.competition === competition);
    return list.sort((a, b) => a.day - b.day);
  }, [competition]);

  const upcoming = rows.filter((f) => f.status !== 'played');
  const played = rows.filter((f) => f.status === 'played').sort((a, b) => b.day - a.day);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-4)' }}>
      <header
        style={{
          borderBottomWidth: 'var(--lf-border-width-hair)',
          borderBottomStyle: 'solid',
          borderBottomColor: 'var(--lf-color-border-subtle)',
          paddingBottom: 'var(--lf-space-2)',
        }}
      >
        <h1
          className="font-[family-name:var(--font-ui)] font-semibold"
          style={{ margin: 0, fontSize: 'var(--lf-type-h1)', color: 'var(--lf-color-text-primary)' }}
        >
          Terminarz
        </h1>
        <p
          style={{
            margin: 0,
            marginTop: 'var(--lf-space-1)',
            fontSize: 'var(--lf-type-caption)',
            color: 'var(--lf-color-text-muted)',
          }}
        >
          {dashboardMock.club.division} · sezonowe spotkania
        </p>
      </header>

      <NextMatchHero fixture={next} />

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
            Rozgrywki
          </span>
          <select
            value={competition}
            onChange={(e) => setCompetition(e.target.value as CompetitionFilter)}
            style={controlStyle}
          >
            <option value="ALL">Wszystkie</option>
            <option value="league">{COMPETITION_LABEL.league}</option>
            <option value="cup">{COMPETITION_LABEL.cup}</option>
            <option value="friendly">{COMPETITION_LABEL.friendly}</option>
          </select>
        </label>
      </div>

      <FixtureTable
        title="Nadchodzące"
        rows={upcoming}
        empty="Brak nadchodzących meczów dla filtra."
        onOpen={(f) => {
          const href = preMatchHref(f);
          if (href) router.push(href);
        }}
      />

      <FixtureTable
        title="Rozegrane"
        rows={played}
        empty="Brak rozegranych meczów dla filtra."
        onOpen={() => undefined}
        played
      />
    </div>
  );
}

function FixtureTable({
  title,
  rows,
  empty,
  onOpen,
  played = false,
}: {
  title: string;
  rows: Fixture[];
  empty: string;
  onOpen: (f: Fixture) => void;
  played?: boolean;
}) {
  return (
    <section
      style={{
        borderWidth: 'var(--lf-border-width-hair)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        background: 'var(--lf-color-bg-panel)',
        borderRadius: 'var(--lf-radius-sm)',
        overflow: 'auto',
      }}
    >
      <header
        style={{
          borderBottomWidth: 'var(--lf-border-width-hair)',
          borderBottomStyle: 'solid',
          borderBottomColor: 'var(--lf-color-border-subtle)',
          background: 'var(--lf-color-bg-panel-alt)',
          padding: 'var(--lf-space-2) var(--lf-space-3)',
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
          {title}
        </h2>
      </header>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--lf-type-table)' }}>
        <thead>
          <tr style={{ background: 'var(--lf-color-bg-inset)' }}>
            {['Termin', 'Przeciwnik', 'Rozgrywki', 'Boisko', played ? 'Wynik' : 'Godzina', 'Status'].map(
              (h) => (
                <th
                  key={h}
                  className="font-[family-name:var(--font-ui)] font-semibold uppercase"
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 'var(--lf-z-sticky)',
                    padding: 'var(--lf-space-2)',
                    fontSize: 'var(--lf-type-label)',
                    letterSpacing: 'var(--lf-type-tracking-label)',
                    color: 'var(--lf-color-text-faint)',
                    textAlign: 'left',
                    background: 'var(--lf-color-bg-inset)',
                  }}
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => {
            const st = statusStyle(f.status);
            const rs = resultStyle(f.result);
            const clickable = !played && f.status !== 'played';
            return (
              <tr
                key={f.id}
                tabIndex={clickable ? 0 : undefined}
                role={clickable ? 'link' : undefined}
                onClick={() => clickable && onOpen(f)}
                onKeyDown={(e) => {
                  if (!clickable) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpen(f);
                  }
                }}
                style={{
                  borderBottomWidth: 'var(--lf-border-width-hair)',
                  borderBottomStyle: 'solid',
                  borderBottomColor: 'var(--lf-color-border-subtle)',
                  cursor: clickable ? 'pointer' : 'default',
                }}
                onMouseEnter={(e) => {
                  if (clickable) e.currentTarget.style.background = 'var(--lf-color-bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <td style={{ padding: 'var(--lf-space-2)', color: 'var(--lf-color-text-muted)' }}>
                  {f.whenLabel}
                </td>
                <td
                  style={{
                    padding: 'var(--lf-space-2)',
                    fontWeight: 600,
                    color: 'var(--lf-color-text-primary)',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--lf-space-2)',
                    }}
                  >
                    <ClubCrest shortName={f.opponentShort} clubName={f.opponent} size="sm" />
                    {f.opponent}
                  </span>
                </td>
                <td style={{ padding: 'var(--lf-space-2)' }}>{COMPETITION_LABEL[f.competition]}</td>
                <td style={{ padding: 'var(--lf-space-2)' }}>
                  <span
                    className="font-[family-name:var(--font-ui)] font-semibold uppercase"
                    style={{
                      fontSize: 'var(--lf-type-label)',
                      padding: '0 var(--lf-space-1)',
                      borderWidth: 'var(--lf-border-width-hair)',
                      borderStyle: 'solid',
                      borderRadius: 'var(--lf-radius-xs)',
                      borderColor: f.home
                        ? 'var(--lf-color-status-ok)'
                        : 'var(--lf-color-status-info)',
                      background: f.home
                        ? 'var(--lf-color-status-ok-soft)'
                        : 'var(--lf-color-bg-inset)',
                      color: f.home ? 'var(--lf-color-status-ok)' : 'var(--lf-color-status-info)',
                    }}
                  >
                    {f.home ? 'Dom' : 'Wyjazd'}
                  </span>
                </td>
                <td className="tabular-nums" style={{ padding: 'var(--lf-space-2)' }}>
                  {played ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--lf-space-2)' }}>
                      {f.result ? (
                        <span
                          className="font-[family-name:var(--font-ui)] font-semibold uppercase"
                          style={{
                            fontSize: 'var(--lf-type-label)',
                            padding: '0 var(--lf-space-1)',
                            borderWidth: 'var(--lf-border-width-hair)',
                            borderStyle: 'solid',
                            borderRadius: 'var(--lf-radius-xs)',
                            borderColor: rs.border,
                            background: rs.bg,
                            color: rs.text,
                          }}
                        >
                          {f.result}
                        </span>
                      ) : null}
                      {f.score}
                    </span>
                  ) : (
                    f.kickoff ?? '—'
                  )}
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
                      borderColor: st.border,
                      background: st.bg,
                      color: st.text,
                    }}
                  >
                    {STATUS_LABEL[f.status]}
                  </span>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                style={{
                  padding: 'var(--lf-space-5)',
                  textAlign: 'center',
                  color: 'var(--lf-color-text-muted)',
                }}
              >
                {empty}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}
