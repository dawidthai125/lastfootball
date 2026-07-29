'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

import { ClubCrest, LiveEventIcon } from '@/components/assets';
import type {
  PostMatchSummary,
  PostMatchTimelineItem,
} from '@/components/match/post-match/build-post-match-summary';
import type { PlayerRatingView } from '@/components/match/post-match/player-ratings';
import { LocationHero } from '@/components/ui';
import { UI_COPY } from '@/lib/ui/copy';

import './post-match.css';

type PostMatchViewProps = {
  readonly summary: PostMatchSummary;
  readonly replayFrames: number;
  readonly onOpenReplay: () => void;
  readonly onJumpToEvent: (item: PostMatchTimelineItem) => void;
  readonly onDismiss?: () => void;
  /** Primary continue CTA (e.g. First Match → Welcome). */
  readonly continueSlot?: ReactNode;
  /** One-line match reward (LFE-ECONOMY-01); league only. */
  readonly rewardLine?: string | null;
};

/**
 * Post Match — HF-MCH-08 fidelity (LFE-UI-IMPL-06).
 * Recorded MatchState / EventBus / Replay Buffer only.
 */
export function PostMatchView({
  summary,
  replayFrames,
  onOpenReplay,
  onJumpToEvent,
  onDismiss,
  continueSlot,
  rewardLine = null,
}: PostMatchViewProps) {
  const mvp =
    summary.mvpPlayerId == null
      ? null
      : ([...summary.ratings.home, ...summary.ratings.away].find(
          (p) => p.playerId === summary.mvpPlayerId,
        ) ?? null);

  const insight = [summary.resultLabel, mvp ? `MVP: ${mvp.name} (${mvp.rating.toFixed(1)})` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="lf-post" data-lf-impl="LFE-UI-IMPL-06" data-mch="SCR-MCH-08">
      <LocationHero
        className="lf-post__hero"
        waId="HERO-003"
        src="/assets/world-art/hero-003-pitch-night.png"
        priority
      />

      <header className="lf-post__decision">
        <p className="lf-post__eyebrow">Po meczu</p>
        <p className="lf-post__insight">{insight}</p>
        {rewardLine ? <p className="lf-post__reward">{rewardLine}</p> : null}

        <div className="lf-post__scoreline">
          <TeamBlock name={summary.homeName} shortName={summary.homeShort} align="end" />
          <div className="lf-post__score">
            {summary.homeScore}
            <span style={{ color: 'var(--lf-color-text-faint)', margin: '0 0.2em' }}>:</span>
            {summary.awayScore}
          </div>
          <TeamBlock name={summary.awayName} shortName={summary.awayShort} align="start" />
        </div>

        <div className="lf-post__actions">
          <div className="lf-post__primary-slot">
            {continueSlot ?? (
              <Link href="/hub" className="lf-post__soft">
                {UI_COPY.hubExit}
              </Link>
            )}
          </div>
          <button
            type="button"
            className="lf-post__soft"
            onClick={onOpenReplay}
            disabled={replayFrames === 0}
          >
            Otwórz Replay
          </button>
          {onDismiss ? (
            <button type="button" className="lf-post__soft" onClick={onDismiss}>
              Pokaż boisko
            </button>
          ) : null}
        </div>
        <p className="lf-post__meta">Bufor Replay · {replayFrames} klatek</p>
      </header>

      <div className="lf-post__context">
        <section className="lf-section-shell" style={{ padding: 'var(--lf-space-3)' }}>
          <h2 className="lf-section-shell__title" style={{ marginBottom: 'var(--lf-space-3)' }}>
            Gole
          </h2>
          {summary.goals.length === 0 ? (
            <p style={{ color: 'var(--lf-color-text-muted)', fontSize: 'var(--lf-type-caption)' }}>
              Brak goli w tym meczu.
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--lf-space-2)',
              }}
            >
              {summary.goals.map((g) => (
                <li key={`goal-${g.tick}-${g.minute}`}>
                  <button
                    type="button"
                    onClick={() =>
                      onJumpToEvent({
                        tick: g.tick,
                        minute: g.minute,
                        type: 'GOAL',
                        kind: 'goal',
                        text: g.text,
                        highlight: true,
                        side: g.side,
                      })
                    }
                    style={eventRow(true)}
                  >
                    <span style={{ color: 'var(--lf-color-text-gold)', fontWeight: 700 }}>
                      {g.minute}
                    </span>
                    <LiveEventIcon kind="goal" highlight size={14} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{g.text}</span>
                    <span
                      style={{
                        color: 'var(--lf-color-text-faint)',
                        fontSize: 'var(--lf-type-label)',
                      }}
                    >
                      REPLAY →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lf-section-shell" style={{ padding: 'var(--lf-space-3)' }}>
          <h2 className="lf-section-shell__title" style={{ marginBottom: 'var(--lf-space-3)' }}>
            Statystyki
          </h2>
          <PossessionBar
            home={summary.possession.home}
            away={summary.possession.away}
            homeShort={summary.homeShort}
            awayShort={summary.awayShort}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--lf-space-3)',
              marginTop: 'var(--lf-space-4)',
            }}
          >
            {summary.stats.map((s) => (
              <StatRow key={s.label} {...s} />
            ))}
          </div>
        </section>
      </div>

      <div className="lf-post__context">
        <RatingsColumn title={`${summary.homeShort} · Oceny`} players={summary.ratings.home} />
        <RatingsColumn title={`${summary.awayShort} · Oceny`} players={summary.ratings.away} />
      </div>

      <section className="lf-section-shell" style={{ padding: 'var(--lf-space-3)' }}>
        <h2 className="lf-section-shell__title" style={{ marginBottom: 'var(--lf-space-3)' }}>
          Oś czasu zdarzeń
        </h2>
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--lf-space-1)',
            maxHeight: 'calc(var(--lf-space-8) * 12)',
            overflowY: 'auto',
          }}
        >
          {summary.timeline.map((item, i) => (
            <li key={`tl-${item.tick}-${item.type}-${i}`}>
              <button
                type="button"
                onClick={() => onJumpToEvent(item)}
                style={eventRow(item.highlight)}
              >
                <span
                  className="font-[family-name:var(--font-ui)] font-semibold tabular-nums"
                  style={{ color: 'var(--lf-color-text-gold)', minWidth: '2.5rem' }}
                >
                  {item.minute}
                </span>
                <LiveEventIcon kind={item.kind} highlight={item.highlight} size={14} />
                <span style={{ flex: 1, textAlign: 'left', fontSize: 'var(--lf-type-caption)' }}>
                  {item.text}
                </span>
                <span
                  style={{
                    fontSize: 'var(--lf-type-label)',
                    color: 'var(--lf-color-text-faint)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--lf-type-tracking-label)',
                  }}
                >
                  {item.type}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function RatingsColumn({
  title,
  players,
}: {
  title: string;
  players: readonly PlayerRatingView[];
}) {
  return (
    <section className="lf-section-shell" style={{ padding: 'var(--lf-space-3)' }}>
      <h2 className="lf-section-shell__title" style={{ marginBottom: 'var(--lf-space-3)' }}>
        {title}
      </h2>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--lf-space-1)',
        }}
      >
        {players.map((p) => (
          <li key={p.playerId} style={ratingRow(p.isMvp)}>
            <span
              className="font-[family-name:var(--font-ui)] font-semibold tabular-nums"
              style={{
                color: 'var(--lf-color-text-faint)',
                minWidth: '1.5rem',
                fontSize: 'var(--lf-type-label)',
              }}
            >
              {p.shirtNumber || '—'}
            </span>
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 'var(--lf-type-caption)',
                color: 'var(--lf-color-text-secondary)',
              }}
            >
              <span className="truncate" style={{ display: 'block' }}>
                {p.name}
              </span>
              <span
                style={{
                  fontSize: 'var(--lf-type-label)',
                  color: 'var(--lf-color-text-faint)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--lf-type-tracking-label)',
                }}
              >
                {p.role}
                {p.isMvp ? ' · MVP' : ''}
              </span>
            </span>
            <span
              className="font-[family-name:var(--font-ui)] font-bold tabular-nums"
              style={{
                color: p.isMvp ? 'var(--lf-color-text-gold)' : ratingColor(p.rating),
                fontSize: 'var(--lf-type-h2)',
                minWidth: '2.5rem',
                textAlign: 'right',
              }}
            >
              {p.rating.toFixed(1)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ratingRow(isMvp: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--lf-space-2)',
    padding: 'var(--lf-space-2) var(--lf-space-3)',
    borderRadius: 'var(--lf-radius-sm)',
    borderWidth: 'var(--lf-border-width-hair)',
    borderStyle: 'solid',
    borderColor: isMvp ? 'var(--lf-color-border-gold)' : 'var(--lf-color-border-subtle)',
    background: isMvp ? 'var(--lf-color-gold-soft)' : 'var(--lf-color-bg-inset)',
  };
}

function ratingColor(rating: number): string {
  if (rating >= 7.0) return 'var(--lf-color-text-primary)';
  if (rating >= 5.5) return 'var(--lf-color-text-secondary)';
  return 'var(--lf-color-text-muted)';
}

function TeamBlock({
  name,
  shortName,
  align,
}: {
  name: string;
  shortName: string;
  align: 'start' | 'end';
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: align === 'end' ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 'var(--lf-space-2)',
        minWidth: 0,
      }}
    >
      <ClubCrest shortName={shortName} clubName={name} size="lg" />
      <div style={{ textAlign: align, minWidth: 0 }}>
        <div
          className="truncate font-[family-name:var(--font-ui)] font-semibold"
          style={{ fontSize: 'var(--lf-type-h2)', color: 'var(--lf-color-text-primary)' }}
        >
          {name}
        </div>
        <div style={{ fontSize: 'var(--lf-type-label)', color: 'var(--lf-color-text-faint)' }}>
          {shortName}
        </div>
      </div>
    </div>
  );
}

function PossessionBar({
  home,
  away,
  homeShort,
  awayShort,
}: {
  home: number;
  away: number;
  homeShort: string;
  awayShort: string;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--lf-type-label)',
          color: 'var(--lf-color-text-muted)',
          marginBottom: 'var(--lf-space-1)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--lf-type-tracking-label)',
        }}
      >
        <span>
          {homeShort} {home}%
        </span>
        <span>Posiadanie</span>
        <span>
          {away}% {awayShort}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          height: 8,
          borderRadius: 'var(--lf-radius-xs)',
          overflow: 'hidden',
          background: 'var(--lf-color-bg-inset)',
        }}
      >
        <div style={{ width: `${home}%`, background: 'var(--lf-color-status-danger)' }} />
        <div style={{ width: `${away}%`, background: 'var(--lf-color-text-gold)' }} />
      </div>
    </div>
  );
}

function StatRow({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  const homePct = (home / total) * 100;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--lf-type-caption)',
          marginBottom: 4,
        }}
      >
        <span className="tabular-nums">{home}</span>
        <span style={{ color: 'var(--lf-color-text-muted)' }}>{label}</span>
        <span className="tabular-nums">{away}</span>
      </div>
      <div
        style={{
          display: 'flex',
          height: 4,
          background: 'var(--lf-color-bg-inset)',
          borderRadius: 'var(--lf-radius-xs)',
          overflow: 'hidden',
        }}
      >
        <div style={{ width: `${homePct}%`, background: 'var(--lf-color-status-danger)' }} />
        <div style={{ flex: 1, background: 'var(--lf-color-text-gold)' }} />
      </div>
    </div>
  );
}

function eventRow(highlight: boolean): CSSProperties {
  return {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--lf-space-2)',
    padding: 'var(--lf-space-2) var(--lf-space-3)',
    borderRadius: 'var(--lf-radius-sm)',
    borderWidth: 'var(--lf-border-width-hair)',
    borderStyle: 'solid',
    borderColor: highlight ? 'var(--lf-color-border-gold)' : 'var(--lf-color-border-subtle)',
    background: highlight ? 'var(--lf-color-status-danger-soft)' : 'var(--lf-color-bg-inset)',
    color: 'var(--lf-color-text-secondary)',
    cursor: 'pointer',
    textAlign: 'left',
  };
}
