'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';

import { NextMatchHero } from '@/components/fixtures/NextMatchHero';
import { ClubCrest } from '@/components/assets';
import {
  COMPETITION_LABEL,
  STATUS_LABEL,
  type CompetitionFilter,
  type Fixture,
  type MatchStatus,
} from '@/data/fixtures';

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

function preMatchHref(f: Fixture): string | null {
  if (f.status === 'played') return null;
  if (f.status === 'live') return `/match/${f.id}/live`;
  if (f.status === 'upcoming') return `/match/${f.id}`;
  return null;
}

export function FixturesView({
  fixtures,
  clubName,
  clubShortName,
  leagueLabel,
}: {
  fixtures: readonly Fixture[];
  clubName: string;
  clubShortName: string;
  leagueLabel: string;
}) {
  const router = useRouter();
  const [competition, setCompetition] = useState<CompetitionFilter>('ALL');
  const next = fixtures.find((f) => f.status === 'upcoming') ?? null;

  const rows = useMemo(() => {
    let list = [...fixtures];
    if (competition !== 'ALL') list = list.filter((f) => f.competition === competition);
    return list.sort((a, b) => a.day - b.day);
  }, [fixtures, competition]);

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
          style={{
            margin: 0,
            fontSize: 'var(--lf-type-h1)',
            color: 'var(--lf-color-text-primary)',
          }}
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
          {leagueLabel} · {fixtures.length} spotkań (Thin A)
        </p>
      </header>

      {next ? (
        <NextMatchHero fixture={next} clubName={clubName} clubShortName={clubShortName} />
      ) : null}

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
          </select>
        </label>
      </div>

      <FixtureTable
        title="Nadchodzące"
        rows={upcoming}
        empty="Brak nadchodzących meczów."
        clubShortName={clubShortName}
        onOpen={(f) => {
          const href = preMatchHref(f);
          if (href) router.push(href);
        }}
      />
      <FixtureTable
        title="Rozegrane"
        rows={played}
        empty="Brak rozegranych meczów ligowych."
        clubShortName={clubShortName}
        onOpen={() => undefined}
      />
    </div>
  );
}

function FixtureTable({
  title,
  rows,
  empty,
  clubShortName,
  onOpen,
}: {
  title: string;
  rows: Fixture[];
  empty: string;
  clubShortName: string;
  onOpen: (f: Fixture) => void;
}) {
  return (
    <section
      style={{
        borderWidth: 'var(--lf-border-width-hair)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        background: 'var(--lf-color-bg-panel)',
        borderRadius: 'var(--lf-radius-sm)',
        overflow: 'hidden',
      }}
    >
      <h2
        className="font-[family-name:var(--font-ui)] font-semibold"
        style={{
          margin: 0,
          padding: 'var(--lf-space-3) var(--lf-space-4)',
          fontSize: 'var(--lf-type-h2)',
          color: 'var(--lf-color-text-primary)',
          borderBottomWidth: 'var(--lf-border-width-hair)',
          borderBottomStyle: 'solid',
          borderBottomColor: 'var(--lf-color-border-subtle)',
        }}
      >
        {title}
      </h2>
      {rows.length === 0 ? (
        <p
          style={{
            margin: 0,
            padding: 'var(--lf-space-4)',
            color: 'var(--lf-color-text-muted)',
            fontSize: 'var(--lf-type-caption)',
          }}
        >
          {empty}
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {rows.map((f) => {
            const st = statusStyle(f.status);
            const clickable = Boolean(preMatchHref(f));
            return (
              <li
                key={f.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto auto',
                  gap: 'var(--lf-space-3)',
                  alignItems: 'center',
                  padding: 'var(--lf-space-3) var(--lf-space-4)',
                  borderTopWidth: 'var(--lf-border-width-hair)',
                  borderTopStyle: 'solid',
                  borderTopColor: 'var(--lf-color-border-subtle)',
                  cursor: clickable ? 'pointer' : 'default',
                }}
                onClick={() => clickable && onOpen(f)}
                onKeyDown={(e) => {
                  if (clickable && (e.key === 'Enter' || e.key === ' ')) onOpen(f);
                }}
                role={clickable ? 'link' : undefined}
                tabIndex={clickable ? 0 : undefined}
              >
                <ClubCrest shortName={f.opponentShort} clubName={f.opponent} size="sm" />
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--lf-type-body)',
                      color: 'var(--lf-color-text-primary)',
                      fontWeight: 600,
                    }}
                  >
                    {f.home
                      ? `${clubShortName} vs ${f.opponent}`
                      : `${f.opponent} vs ${clubShortName}`}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--lf-type-caption)',
                      color: 'var(--lf-color-text-muted)',
                    }}
                  >
                    {f.competitionLabel} · {f.whenLabel}
                  </p>
                </div>
                <span
                  style={{
                    borderWidth: 'var(--lf-border-width-hair)',
                    borderStyle: 'solid',
                    borderColor: st.border,
                    background: st.bg,
                    color: st.text,
                    fontSize: 'var(--lf-type-label)',
                    padding: 'var(--lf-space-1) var(--lf-space-2)',
                    borderRadius: 'var(--lf-radius-sm)',
                  }}
                >
                  {STATUS_LABEL[f.status]}
                </span>
                <span
                  style={{
                    fontSize: 'var(--lf-type-body)',
                    fontWeight: 600,
                    color: 'var(--lf-color-text-primary)',
                    minWidth: '3rem',
                    textAlign: 'right',
                  }}
                >
                  {f.score ?? '—'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
