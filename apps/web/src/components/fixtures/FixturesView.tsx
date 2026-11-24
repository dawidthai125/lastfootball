'use client';

import { useMemo, useState, type CSSProperties } from 'react';

import { NextMatchHero } from '@/components/fixtures/NextMatchHero';
import { ClubCrest } from '@/components/assets';
import {
  COMPETITION_LABEL,
  STATUS_LABEL,
  type CompetitionFilter,
  type Fixture,
  type MatchStatus,
} from '@/data/fixtures';
import { pickCalendarHero } from '@/lib/fixtures/calendar-hero';
import {
  calendarFixtureHref,
  fixtureKickoffSentence,
  playedMatchHref,
  type CalendarHrefStatus,
} from '@/lib/fixtures/calendar-href';
import type { KickoffCompetition } from '@/lib/fixtures/kickoff-gate';

export { playedMatchHref };

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

function gateCompetition(f: Fixture): KickoffCompetition {
  if (f.kickoffCompetition) return f.kickoffCompetition;
  if (f.competition === 'cup') return 'cup';
  if (f.competition === 'friendly') return 'challenge';
  return 'league';
}

function rowHref(
  f: Fixture,
  gate: {
    readonly matchesBlocked: boolean;
    readonly lastPlayedAt: string | null;
    readonly lastChallengeAt: string | null;
    readonly now: Date;
  },
): string | null {
  const status: CalendarHrefStatus = f.status;
  return calendarFixtureHref({
    id: f.id,
    status,
    competition: gateCompetition(f),
    matchesBlocked: gate.matchesBlocked,
    lastPlayedAt: gate.lastPlayedAt,
    lastChallengeAt: gate.lastChallengeAt,
    now: gate.now,
  });
}

export function FixturesView({
  fixtures,
  clubName,
  clubShortName,
  leagueLabel,
  kickoffSentence,
  matchesBlocked,
  lastPlayedAt,
  lastChallengeAt,
  kickoffNow,
}: {
  fixtures: readonly Fixture[];
  clubName: string;
  clubShortName: string;
  leagueLabel: string;
  /** kickoffBlockReason for the default hero. Null when that kickoff may start. */
  kickoffSentence: string | null;
  matchesBlocked: boolean;
  lastPlayedAt: string | null;
  lastChallengeAt: string | null;
  /** Server clock. The client does not sample a second Warsaw day. */
  kickoffNow: string;
}) {
  const [competition, setCompetition] = useState<CompetitionFilter>('ALL');
  const now = useMemo(() => new Date(kickoffNow), [kickoffNow]);
  const gate = useMemo(
    () => ({ matchesBlocked, lastPlayedAt, lastChallengeAt, now }),
    [matchesBlocked, lastPlayedAt, lastChallengeAt, now],
  );
  const next = pickCalendarHero(fixtures, competition);
  const heroSentence =
    competition === 'cup' && next
      ? fixtureKickoffSentence({
          matchesBlocked,
          competition: gateCompetition(next),
          lastPlayedAt,
          now,
        })
      : kickoffSentence;

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
          {leagueLabel} · mecze ligi:{' '}
          {fixtures.filter((f) => f.kickoffCompetition === 'league').length}
        </p>
      </header>

      {next ? (
        <NextMatchHero
          fixture={next}
          clubName={clubName}
          clubShortName={clubShortName}
          kickoffSentence={heroSentence}
        />
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
            <option value="cup">{COMPETITION_LABEL.cup}</option>
          </select>
        </label>
      </div>

      <FixtureTable
        title="Nadchodzące"
        rows={upcoming}
        empty="Brak nadchodzących meczów."
        clubShortName={clubShortName}
        hrefFor={(f) => rowHref(f, gate)}
      />
      <FixtureTable
        title="Rozegrane"
        rows={played}
        empty={
          competition === 'cup'
            ? 'Brak rozegranych meczów pucharowych.'
            : 'Brak rozegranych meczów ligowych.'
        }
        clubShortName={clubShortName}
        hrefFor={(f) => rowHref(f, gate)}
      />
    </div>
  );
}

const rowGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto auto',
  gap: 'var(--lf-space-3)',
  alignItems: 'center',
  padding: 'var(--lf-space-3) var(--lf-space-4)',
  color: 'inherit',
  textDecoration: 'none',
};

function FixtureTable({
  title,
  rows,
  empty,
  clubShortName,
  hrefFor,
}: {
  title: string;
  rows: Fixture[];
  empty: string;
  clubShortName: string;
  hrefFor: (f: Fixture) => string | null;
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
            const href = hrefFor(f);
            const body = (
              <>
                <ClubCrest shortName={f.opponentShort} clubName={f.opponent} size="sm" />
                <div style={{ minWidth: 0 }}>
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
                  {f.status === 'played' && f.matchNote ? (
                    <p
                      style={{
                        margin: 0,
                        overflow: 'hidden',
                        fontSize: 'var(--lf-type-caption)',
                        color: 'var(--lf-color-text-muted)',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {f.matchNote}
                    </p>
                  ) : null}
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
              </>
            );
            return (
              <li
                key={f.id}
                style={{
                  borderTopWidth: 'var(--lf-border-width-hair)',
                  borderTopStyle: 'solid',
                  borderTopColor: 'var(--lf-color-border-subtle)',
                }}
              >
                {href ? (
                  <a href={href} style={{ ...rowGrid, cursor: 'pointer' }}>
                    {body}
                  </a>
                ) : (
                  <div style={rowGrid}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
