'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';

import { AtmosphereLayer, ClubCrest, LiveEventIcon } from '@/components/assets';
import type { LiveEventKind, LiveMatchBundle } from '@/data/fixtures';
import type { ClubDto } from '@/lib/club/types';
import { createMatchCanvasRenderer, type MatchCanvasRendererApi } from '@/gameplay/canvas';
import { MATCH_CANVAS_ROOT_ID } from '@/gameplay/canvas-host';
import { useLiveMatchRuntime } from '@/gameplay/use-live-match-runtime';
import type { ReplaySpeed } from '@/gameplay/replay';
import { dashboardMock } from '@/data/mock';
import {
  buildPostMatchSummary,
  findReplayIndexForEvent,
  isMatchFinished,
  PostMatchView,
  type PostMatchTimelineItem,
} from '@/components/match/post-match';
import { CompleteFirstMatchButton } from '@/components/onboarding/CompleteFirstMatchButton';

/**
 * Live Match UI — broadcast chrome + Canvas + Post Match (after MATCH_END).
 * Reads MatchState / EventBus via LiveMatchRuntime; commands go through CommandBus.
 * Canvas / Replay never mutate MatchState.
 */
export function LiveMatchFoundation({
  bundle,
  club = null,
  firstMatch = false,
}: {
  bundle: LiveMatchBundle;
  club?: ClubDto | null;
  firstMatch?: boolean;
}) {
  const { fixture } = bundle;
  const { snapshot, dispatchUiCommand, runtime } = useLiveMatchRuntime(fixture, bundle, club);
  const us = club ?? dashboardMock.club;
  const homeName = fixture.home ? us.name : fixture.opponent;
  const awayName = fixture.home ? fixture.opponent : us.name;
  const homeShort = fixture.home ? us.shortName : fixture.opponentShort;
  const awayShort = fixture.home ? fixture.opponentShort : us.shortName;

  const [viewMode, setViewMode] = useState(bundle.viewModes[0]?.id ?? 'tactical');
  const [commandId, setCommandId] = useState(bundle.commands[0]?.id ?? '');
  const [feedFilter, setFeedFilter] = useState<'all' | LiveEventKind>('all');
  const [rightTab, setRightTab] = useState<'commands' | 'stats' | 'subs'>('commands');
  const [postMatchOpen, setPostMatchOpen] = useState(false);

  const finished = snapshot
    ? isMatchFinished(snapshot.matchState, snapshot.events)
    : false;

  useEffect(() => {
    if (finished) setPostMatchOpen(true);
  }, [finished]);

  useEffect(() => {
    if (!runtime || postMatchOpen) return;
    const renderer = createMatchCanvasRenderer({
      viewMode,
      playbackMode: snapshot?.replay.source === 'replay' ? 'replay' : 'live',
    });
    runtime.canvasHost.attachRenderer(renderer);
    if (snapshot?.replay.source === 'live') {
      runtime.canvasHost.pushFrame();
    } else {
      const model = runtime.replay.getCurrentModel();
      if (model) runtime.canvasHost.present(model);
    }
    return () => {
      runtime.canvasHost.attachRenderer(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [runtime, viewMode, postMatchOpen]);

  useEffect(() => {
    if (!runtime || postMatchOpen || !snapshot) return;
    const renderer = runtime.canvasHost.getRenderer() as MatchCanvasRendererApi | null;
    renderer?.setPlaybackMode?.(snapshot.replay.source === 'replay' ? 'replay' : 'live');
  }, [runtime, snapshot?.replay.source, postMatchOpen, snapshot]);

  if (!runtime || !snapshot) {
    return (
      <p style={{ color: 'var(--lf-color-text-muted)', padding: 'var(--lf-space-5)' }}>
        Ładowanie meczu…
      </p>
    );
  }

  const replay = snapshot.replay;
  const isReplay = replay.source === 'replay';
  const replayRatio = replay.length <= 1 ? 0 : clampPct((replay.index / (replay.length - 1)) * 100);

  const postSummary = buildPostMatchSummary({
    matchState: snapshot.matchState,
    events: snapshot.events,
    homeName,
    awayName,
    homeShort,
    awayShort,
  });

  const openReplayAt = (item?: PostMatchTimelineItem) => {
    setPostMatchOpen(false);
    if (item) {
      const idx = findReplayIndexForEvent(runtime.replayBuffer, item.tick, item.type);
      runtime.enterReplay('start');
      runtime.replaySeek(idx);
      return;
    }
    runtime.enterReplay('start');
    runtime.replayPlay();
  };

  if (postMatchOpen && finished) {
    return (
      <PostMatchView
        summary={postSummary}
        replayFrames={replay.length}
        onOpenReplay={() => openReplayAt()}
        onJumpToEvent={(item) => openReplayAt(item)}
        onDismiss={() => setPostMatchOpen(false)}
        continueSlot={firstMatch ? <CompleteFirstMatchButton /> : undefined}
      />
    );
  }

  const events =
    feedFilter === 'all' ? snapshot.feed : snapshot.feed.filter((e) => e.kind === feedFilter);

  const playheadPct = clampPct((snapshot.matchState.clock.displayMinute / 90) * 100);
  const goalMarkers = snapshot.feed.filter((e) => e.kind === 'goal' || e.highlight);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--lf-space-3)',
        minHeight: 'calc(100dvh - var(--lf-shell-topbar) - var(--lf-space-6))',
      }}
    >
      {/* Broadcast scorebug */}
      <header
        role="status"
        aria-label="Scorebug"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(7rem, 11rem) minmax(0, 1fr) minmax(8rem, 12rem)',
          gap: 'var(--lf-space-3)',
          alignItems: 'center',
          borderTopWidth: 'var(--lf-border-width-hair)',
          borderBottomWidth: 'var(--lf-border-width-hair)',
          borderLeftWidth: 'var(--lf-border-width-thick)',
          borderRightWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-subtle)',
          borderLeftColor: 'var(--lf-color-status-live)',
          background:
            'linear-gradient(180deg, var(--lf-color-bg-panel-alt) 0%, var(--lf-color-bg-void) 100%)',
          padding: 'var(--lf-space-2) var(--lf-space-4)',
          borderRadius: 'var(--lf-radius-sm)',
          boxShadow: 'inset 0 -1px 0 var(--lf-color-border-gold)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-1)' }}>
          <span
            className="inline-flex items-center font-[family-name:var(--font-ui)] font-bold uppercase"
            style={{
              alignSelf: 'flex-start',
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              padding: 'var(--lf-space-1) var(--lf-space-2)',
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: isReplay ? 'var(--lf-color-border-gold)' : 'var(--lf-color-status-live)',
              background: isReplay
                ? 'var(--lf-color-gold-soft)'
                : 'var(--lf-color-status-danger-soft)',
              color: isReplay ? 'var(--lf-color-text-gold)' : 'var(--lf-color-status-live)',
              borderRadius: 'var(--lf-radius-sm)',
              gap: 'var(--lf-space-1)',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: 'var(--lf-radius-xs)',
                background: isReplay ? 'var(--lf-color-gold-base)' : 'var(--lf-color-status-live)',
              }}
            />
            {isReplay ? 'Replay' : 'Live'}
          </span>
          <span
            className="tabular-nums"
            style={{ fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-muted)' }}
          >
            {bundle.viewers} widzów
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 'var(--lf-space-3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 'var(--lf-space-2)',
              minWidth: 0,
            }}
          >
            <span
              className="truncate font-[family-name:var(--font-ui)] font-semibold"
              style={{
                fontSize: 'var(--lf-type-h2)',
                color: 'var(--lf-color-text-primary)',
                textAlign: 'right',
              }}
            >
              {homeName}
            </span>
            <ClubCrest shortName={homeShort} clubName={homeName} size="md" />
            <span
              className="font-[family-name:var(--font-ui)] font-bold tabular-nums"
              style={{
                fontSize: 'var(--lf-type-hero)',
                lineHeight: 1,
                color: 'var(--lf-color-text-primary)',
                minWidth: '1.5ch',
                textAlign: 'center',
              }}
            >
              {snapshot.homeScore}
            </span>
          </div>

          <div style={{ textAlign: 'center', paddingInline: 'var(--lf-space-2)' }}>
            <div
              className="font-[family-name:var(--font-ui)] font-bold tabular-nums"
              style={{
                fontSize: 'var(--lf-type-h1)',
                color: 'var(--lf-color-text-gold)',
                lineHeight: 1,
                letterSpacing: '0.04em',
              }}
            >
              {snapshot.clockLabel}
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
              {snapshot.periodLabel}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 'var(--lf-space-2)',
              minWidth: 0,
            }}
          >
            <span
              className="font-[family-name:var(--font-ui)] font-bold tabular-nums"
              style={{
                fontSize: 'var(--lf-type-hero)',
                lineHeight: 1,
                color: 'var(--lf-color-text-primary)',
                minWidth: '1.5ch',
                textAlign: 'center',
              }}
            >
              {snapshot.awayScore}
            </span>
            <ClubCrest shortName={awayShort} clubName={awayName} size="md" />
            <span
              className="truncate font-[family-name:var(--font-ui)] font-semibold"
              style={{ fontSize: 'var(--lf-type-h2)', color: 'var(--lf-color-text-primary)' }}
            >
              {awayName}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: 0 }}>
          <div
            className="truncate font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-gold)',
            }}
          >
            {fixture.competitionLabel}
          </div>
          <div
            className="truncate"
            style={{
              marginTop: '2px',
              fontSize: 'var(--lf-type-caption)',
              color: 'var(--lf-color-text-secondary)',
            }}
          >
            {fixture.stadium}
          </div>
          <div style={{ fontSize: 'var(--lf-type-label)', color: 'var(--lf-color-text-faint)' }}>
            {bundle.weather} · {bundle.stadiumCapacity}
          </div>
        </div>
      </header>

      {/* Main 3-column stage */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(13rem, 17rem) minmax(0, 1fr) minmax(13rem, 17rem)',
          gap: 'var(--lf-space-3)',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Event feed */}
        <section
          aria-label="Commentary feed"
          className="lf-section-shell"
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            maxHeight: 'calc(100dvh - var(--lf-shell-topbar) - var(--lf-space-8) * 3)',
            borderLeftColor: 'var(--lf-color-status-live)',
          }}
        >
          <header
            className="lf-section-shell__header"
            style={{ flexWrap: 'wrap', gap: 'var(--lf-space-2)' }}
          >
            <h2 className="lf-section-shell__title">Event feed</h2>
            <div style={{ display: 'flex', gap: 'var(--lf-space-1)', flexWrap: 'wrap' }}>
              {(
                [
                  ['all', 'All'],
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
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--lf-space-1)',
            }}
          >
            {events.map((e) => (
              <li
                key={e.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.6rem 1.25rem minmax(0, 1fr)',
                  gap: 'var(--lf-space-2)',
                  alignItems: 'start',
                  padding: 'var(--lf-space-2)',
                  borderLeftWidth: 'var(--lf-border-width-thick)',
                  borderLeftStyle: 'solid',
                  borderLeftColor: e.highlight
                    ? 'var(--lf-color-status-live)'
                    : e.kind === 'goal'
                      ? 'var(--lf-color-gold-base)'
                      : 'var(--lf-color-border-subtle)',
                  background: e.highlight
                    ? 'var(--lf-color-status-danger-soft)'
                    : 'var(--lf-color-bg-inset)',
                  fontSize: 'var(--lf-type-caption)',
                }}
              >
                <span
                  className="font-[family-name:var(--font-ui)] font-semibold tabular-nums"
                  style={{ color: 'var(--lf-color-text-gold)' }}
                >
                  {e.minute}
                </span>
                <LiveEventIcon
                  kind={e.kind}
                  highlight={Boolean(e.highlight)}
                  size={14}
                  title={e.kind}
                />
                <span
                  style={{
                    color: e.highlight
                      ? 'var(--lf-color-text-primary)'
                      : 'var(--lf-color-text-secondary)',
                    fontWeight: e.highlight || e.kind === 'goal' ? 600 : 400,
                  }}
                >
                  {e.text}
                </span>
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--lf-space-3)',
            minHeight: 0,
          }}
        >
          <div
            id={MATCH_CANVAS_ROOT_ID}
            data-lf-canvas-host="true"
            data-match-id={fixture.id}
            data-match-phase={snapshot.matchState.phase}
            data-match-tick={snapshot.matchState.tick}
            data-view-mode={viewMode}
            aria-label="Obszar boiska (Canvas host)"
            style={{
              flex: 1,
              minHeight: 'calc(var(--lf-space-8) * 8)',
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-subtle)',
              background: 'var(--lf-color-bg-void)',
              borderRadius: 'var(--lf-radius-sm)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <AtmosphereLayer
              layers={['floodlight', 'vignette', 'grain']}
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
            />
            {/* Canvas 2D renderer mounts a <canvas> into this host (z-index 1). */}

            <div
              style={{
                position: 'absolute',
                left: 'var(--lf-space-4)',
                right: 'var(--lf-space-4)',
                bottom: 'var(--lf-space-4)',
                zIndex: 2,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--lf-space-1)',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--lf-space-1)' }}>
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
              <div
                className="font-[family-name:var(--font-ui)]"
                style={{
                  fontSize: 'var(--lf-type-label)',
                  letterSpacing: 'var(--lf-type-tracking-label)',
                  textTransform: 'uppercase',
                  color: 'var(--lf-color-text-faint)',
                  background: 'rgba(3, 5, 10, 0.65)',
                  padding: 'var(--lf-space-1) var(--lf-space-2)',
                  borderRadius: 'var(--lf-radius-sm)',
                  borderWidth: 'var(--lf-border-width-hair)',
                  borderStyle: 'solid',
                  borderColor: 'var(--lf-color-border-subtle)',
                }}
              >
                {isReplay ? 'REPLAY' : 'LIVE'} · {snapshot.matchState.phase} · tick{' '}
                {snapshot.matchState.tick}
                {isReplay
                  ? ` · ${replay.index + 1}/${replay.length}`
                  : ` · ${runtime.session.status}`}
              </div>
            </div>
          </div>

          {/* Timeline with event markers */}
          <section
            aria-label="Timeline"
            className="lf-section-shell"
            style={{ padding: 'var(--lf-space-3)' }}
          >
            <div className="lf-section-shell__title" style={{ marginBottom: 'var(--lf-space-2)' }}>
              Timeline
            </div>
            <div
              style={{
                position: 'relative',
                height: 'var(--lf-space-4)',
                background: 'var(--lf-color-bg-inset)',
                borderRadius: 'var(--lf-radius-xs)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${playheadPct}%`,
                  background:
                    'linear-gradient(90deg, var(--lf-color-status-danger-soft), rgba(196, 163, 90, 0.25))',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: `${playheadPct}%`,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: 'var(--lf-color-gold-base)',
                  transform: 'translateX(-1px)',
                }}
                title={`Minuta ${snapshot.clockLabel}`}
              />
              {goalMarkers.map((e) => (
                <span
                  key={`tl-${e.id}`}
                  title={`${e.minute} ${e.text}`}
                  style={{
                    position: 'absolute',
                    left: `${minuteLabelToPct(e.minute)}%`,
                    top: '50%',
                    width: 8,
                    height: 8,
                    borderRadius: 'var(--lf-radius-xs)',
                    background:
                      e.kind === 'goal'
                        ? 'var(--lf-color-text-gold)'
                        : 'var(--lf-color-status-live)',
                    border: '1px solid var(--lf-color-bg-void)',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                  }}
                />
              ))}
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
              <span>HT</span>
              <span>90′</span>
            </div>
          </section>

          {/* Replay controls — recorded frames only, no Engine */}
          <section
            aria-label="Replay"
            className="lf-section-shell"
            style={{ padding: 'var(--lf-space-3)' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 'var(--lf-space-2)',
                gap: 'var(--lf-space-2)',
              }}
            >
              <div className="lf-section-shell__title">Replay</div>
              <div
                style={{
                  fontSize: 'var(--lf-type-label)',
                  color: 'var(--lf-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--lf-type-tracking-label)',
                }}
              >
                {isReplay ? replay.status : 'live buffer'} · {replay.length} klatek
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, replay.length - 1)}
              value={replay.index}
              aria-label="Replay seek"
              disabled={replay.length === 0}
              onChange={(e) => runtime.replaySeek(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--lf-color-gold-base)',
                marginBottom: 'var(--lf-space-2)',
              }}
            />
            <div
              style={{
                height: 3,
                background: 'var(--lf-color-bg-inset)',
                borderRadius: 'var(--lf-radius-xs)',
                marginBottom: 'var(--lf-space-2)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${replayRatio}%`,
                  height: '100%',
                  background: 'var(--lf-color-gold-base)',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--lf-space-1)',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                style={chipStyle(false)}
                onClick={() => runtime.enterReplay('start')}
                disabled={replay.length === 0}
              >
                Wejdź
              </button>
              <button
                type="button"
                style={chipStyle(replay.status === 'playing')}
                onClick={() =>
                  replay.status === 'playing' ? runtime.replayPause() : runtime.replayPlay()
                }
                disabled={replay.length === 0}
              >
                {replay.status === 'playing' ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                style={chipStyle(false)}
                onClick={() => runtime.replayStop()}
                disabled={replay.length === 0}
              >
                Stop
              </button>
              {([0.5, 1, 2, 4] as ReplaySpeed[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  style={chipStyle(replay.speed === s)}
                  onClick={() => runtime.replaySetSpeed(s)}
                >
                  {s}×
                </button>
              ))}
              <button
                type="button"
                style={chipStyle(!isReplay)}
                onClick={() => runtime.exitReplay()}
                disabled={!isReplay}
              >
                Wróć do Live
              </button>
              {finished ? (
                <button
                  type="button"
                  style={chipStyle(false)}
                  onClick={() => setPostMatchOpen(true)}
                >
                  Post Match
                </button>
              ) : null}
            </div>
          </section>

          {/* Momentum */}
          <section
            aria-label="Momentum"
            className="lf-section-shell"
            style={{ padding: 'var(--lf-space-3)' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 'var(--lf-space-2)',
              }}
            >
              <div className="lf-section-shell__title">Momentum</div>
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--lf-space-3)',
                  fontSize: 'var(--lf-type-label)',
                }}
              >
                <span style={{ color: 'var(--lf-color-status-danger)' }}>{homeShort}</span>
                <span style={{ color: 'var(--lf-color-text-gold)' }}>{awayShort}</span>
              </div>
            </div>
            <MomentumChart values={bundle.momentum} />
          </section>
        </div>

        {/* Right column */}
        <aside
          aria-label="Panel komend i kontekst"
          className="lf-section-shell"
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            maxHeight: 'calc(100dvh - var(--lf-shell-topbar) - var(--lf-space-8) * 3)',
          }}
        >
          <div
            className="lf-section-shell__header"
            style={{ flexWrap: 'wrap', gap: 'var(--lf-space-1)' }}
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
                          fontWeight: active ? 600 : 400,
                          padding: 'var(--lf-space-2)',
                          borderRadius: 'var(--lf-radius-sm)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          minHeight: 'var(--lf-space-8)',
                        }}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => dispatchUiCommand(commandId)}
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
                    cursor: 'pointer',
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
                  CommandBus → MatchState · pressing {snapshot.tactics.pressing} · tempo{' '}
                  {snapshot.tactics.tempo} · mentalność {snapshot.tactics.mentality}
                </p>
                <div style={{ marginTop: 'var(--lf-space-4)' }}>
                  <div
                    className="lf-section-shell__title"
                    style={{ marginBottom: 'var(--lf-space-2)' }}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-3)' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 'var(--lf-type-label)',
                    letterSpacing: 'var(--lf-type-tracking-label)',
                    textTransform: 'uppercase',
                    color: 'var(--lf-color-text-faint)',
                  }}
                >
                  <span>{homeShort}</span>
                  <span>Statystyki</span>
                  <span>{awayShort}</span>
                </div>
                {snapshot.stats.map((s) => (
                  <StatDualBar key={s.label} label={s.label} home={s.home} away={s.away} />
                ))}
              </div>
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
                  <strong
                    className="tabular-nums"
                    style={{ color: 'var(--lf-color-text-primary)' }}
                  >
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

      {/* Possession footer — broadcast bar */}
      <footer
        aria-label="Possession"
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0, 1fr) auto',
          gap: 'var(--lf-space-3)',
          alignItems: 'center',
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-subtle)',
          background: 'var(--lf-color-bg-panel)',
          borderRadius: 'var(--lf-radius-sm)',
          padding: 'var(--lf-space-2) var(--lf-space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--lf-space-2)' }}>
          <ClubCrest shortName={homeShort} clubName={homeName} size="sm" />
          <span
            className="font-[family-name:var(--font-ui)] font-bold tabular-nums"
            style={{ color: 'var(--lf-color-status-danger)', fontSize: 'var(--lf-type-h2)' }}
          >
            {snapshot.possession.home}%
          </span>
        </div>

        <div>
          <div
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              textAlign: 'center',
              marginBottom: 'var(--lf-space-1)',
              fontSize: 'var(--lf-type-label)',
              letterSpacing: 'var(--lf-type-tracking-label)',
              color: 'var(--lf-color-text-faint)',
            }}
          >
            Posiadanie
          </div>
          <div
            style={{
              display: 'flex',
              height: 'var(--lf-space-3)',
              borderRadius: 'var(--lf-radius-xs)',
              overflow: 'hidden',
              background: 'var(--lf-color-bg-inset)',
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-subtle)',
            }}
          >
            <div
              style={{
                width: `${snapshot.possession.home}%`,
                background: 'var(--lf-color-status-danger)',
              }}
            />
            <div
              style={{
                width: `${snapshot.possession.away}%`,
                background: 'var(--lf-color-gold-base)',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--lf-space-2)' }}>
          <span
            className="font-[family-name:var(--font-ui)] font-bold tabular-nums"
            style={{ color: 'var(--lf-color-text-gold)', fontSize: 'var(--lf-type-h2)' }}
          >
            {snapshot.possession.away}%
          </span>
          <ClubCrest shortName={awayShort} clubName={awayName} size="sm" />
        </div>
      </footer>
    </div>
  );
}

function StatDualBar({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  const homePct = (home / total) * 100;
  const awayPct = (away / total) * 100;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 'var(--lf-space-1)',
          fontSize: 'var(--lf-type-caption)',
        }}
      >
        <span
          className="font-semibold tabular-nums"
          style={{ color: 'var(--lf-color-status-danger)' }}
        >
          {home}
        </span>
        <span style={{ color: 'var(--lf-color-text-muted)' }}>{label}</span>
        <span className="font-semibold tabular-nums" style={{ color: 'var(--lf-color-text-gold)' }}>
          {away}
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
        <div style={{ width: `${homePct}%`, background: 'var(--lf-color-status-danger)' }} />
        <div style={{ width: `${awayPct}%`, background: 'var(--lf-color-gold-base)' }} />
      </div>
    </div>
  );
}

function chipStyle(active: boolean): CSSProperties {
  return {
    borderWidth: 'var(--lf-border-width-hair)',
    borderStyle: 'solid',
    borderColor: active ? 'var(--lf-color-border-gold)' : 'var(--lf-color-border-subtle)',
    background: active ? 'var(--lf-color-gold-soft)' : 'rgba(3, 5, 10, 0.55)',
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

function clampPct(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function minuteLabelToPct(minuteLabel: string): number {
  const n = Number.parseInt(minuteLabel, 10);
  if (Number.isNaN(n)) return 0;
  return clampPct((n / 90) * 100);
}

function MomentumChart({ values }: { values: number[] }) {
  const w = 100;
  const h = 36;
  const mid = h / 2;

  const homeArea = buildAreaPath(values, w, h, true);
  const awayArea = buildAreaPath(values, w, h, false);
  const homeLine = values
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
      style={{
        width: '100%',
        height: 'calc(var(--lf-space-8) + var(--lf-space-2))',
        display: 'block',
      }}
      aria-hidden
    >
      <line
        x1="0"
        y1={mid}
        x2={w}
        y2={mid}
        stroke="var(--lf-color-border-subtle)"
        strokeWidth="0.5"
      />
      <path d={homeArea} fill="var(--lf-color-status-danger)" opacity="0.28" />
      <path d={awayArea} fill="var(--lf-color-gold-base)" opacity="0.22" />
      <polyline
        fill="none"
        stroke="var(--lf-color-status-danger)"
        strokeWidth="1.25"
        points={homeLine}
      />
      <polyline
        fill="none"
        stroke="var(--lf-color-gold-base)"
        strokeWidth="1.25"
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

function buildAreaPath(values: number[], w: number, h: number, home: boolean): string {
  if (values.length === 0) return '';
  const pts = values.map((v, i) => {
    const x = values.length <= 1 ? 0 : (i / (values.length - 1)) * w;
    const y = home ? h - (v / 100) * h : h - ((100 - v) / 100) * h;
    return { x, y };
  });
  const mid = h / 2;
  let d = `M 0 ${mid}`;
  for (const p of pts) d += ` L ${p.x} ${p.y}`;
  d += ` L ${w} ${mid} Z`;
  return d;
}
