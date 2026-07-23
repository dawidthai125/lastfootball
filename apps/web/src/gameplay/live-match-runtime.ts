import type { EngineEvent, MatchSession, MatchState } from '@lastfootball/lfe';
import {
  createKickoffCommand,
  createSetMentalityCommand,
  createSetPressingCommand,
  createSetTempoCommand,
  createSetWidthCommand,
} from '@lastfootball/lfe';

import type { Fixture } from '@/data/fixtures';
import type { LiveEventKind, LiveMatchBundle } from '@/data/fixtures';
import { createSessionFromFixture } from '@/gameplay/create-session-from-fixture';
import {
  createMatchCanvasHost,
  type MatchCanvasHost,
} from '@/gameplay/canvas-host';

export type LiveMatchSnapshot = {
  readonly matchState: MatchState;
  readonly events: EngineEvent[];
  readonly sessionStatus: MatchSession['status'];
  readonly homeScore: number;
  readonly awayScore: number;
  readonly clockLabel: string;
  readonly periodLabel: string;
  readonly possession: { home: number; away: number };
  readonly stats: { label: string; home: number; away: number }[];
  readonly feed: {
    id: string;
    minute: string;
    kind: LiveEventKind;
    text: string;
    highlight?: boolean;
  }[];
  readonly tactics: MatchState['tactics'];
};

const FEED_TYPES = new Set([
  'MATCH_START',
  'HALF_END',
  'MATCH_END',
  'GOAL',
  'SHOT',
  'ATTACK',
  'FOUL',
  'CORNER',
  'CARD',
  'SUBSTITUTION',
  'SYSTEM',
]);

/**
 * Owns MatchSession + Canvas host. UI reads MatchState / EventBus only.
 * Match Engine advances via session.step/run — no UI→Engine imports.
 */
export class LiveMatchRuntime {
  readonly session: MatchSession;
  readonly canvasHost: MatchCanvasHost;
  readonly fixture: Fixture;
  readonly shell: LiveMatchBundle;

  private version = 0;
  private listeners = new Set<() => void>();
  private cachedSnapshot: LiveMatchSnapshot | null = null;
  private cachedVersion = -1;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly ticksPerPulse = 8;

  constructor(fixture: Fixture, shell: LiveMatchBundle) {
    this.fixture = fixture;
    this.shell = shell;
    this.session = createSessionFromFixture(fixture);
    this.canvasHost = createMatchCanvasHost();
    this.canvasHost.bind(this.session);
    this.bootstrapMatch();
    this.startSimulation();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getVersion(): number {
    return this.version;
  }

  getSnapshot(): LiveMatchSnapshot {
    if (this.cachedSnapshot && this.cachedVersion === this.version) {
      return this.cachedSnapshot;
    }
    const snap = this.buildSnapshot();
    this.cachedSnapshot = snap;
    this.cachedVersion = this.version;
    return snap;
  }

  private bootstrapMatch(): void {
    this.session.start();
    this.session.step();
    this.session.dispatch(
      createKickoffCommand({ tick: this.session.context().tick, source: 'system' }),
    );
    this.session.step();
    this.flushEvents();
    this.bump();
  }

  startSimulation(): void {
    if (this.timer !== null) return;
    this.timer = setInterval(() => {
      if (this.session.status === 'paused' || this.session.status === 'disposed') return;
      if (this.session.status === 'stopped') {
        this.stopSimulation();
        return;
      }
      const phase = this.session.getMatchState().phase;
      if (phase === 'FINISHED') {
        this.stopSimulation();
        this.flushEvents();
        this.bump();
        return;
      }
      try {
        this.session.run(this.ticksPerPulse);
      } catch {
        this.stopSimulation();
        return;
      }
      this.flushEvents();
      this.bump();
    }, 50);
  }

  stopSimulation(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private buildSnapshot(): LiveMatchSnapshot {
    const matchState = this.session.getMatchState();
    const events = [...this.session.context().events.history()];
    const homePossTicks = matchState.statistics.home.possessionTicks;
    const awayPossTicks = matchState.statistics.away.possessionTicks;
    const totalPoss = homePossTicks + awayPossTicks;
    const possession =
      totalPoss === 0
        ? { home: 50, away: 50 }
        : {
            home: Math.round((homePossTicks / totalPoss) * 100),
            away: Math.round((awayPossTicks / totalPoss) * 100),
          };

    const feed = events
      .map((e, i) => ({ e, i }))
      .filter(({ e }) => FEED_TYPES.has(String(e.type)))
      .filter(({ e }) => {
        if (e.type !== 'SYSTEM') return true;
        const kind =
          e.payload && typeof e.payload === 'object' && 'kind' in e.payload
            ? String((e.payload as { kind: string }).kind)
            : '';
        return kind !== 'lifecycle' && kind !== 'kickoff';
      })
      .slice(-40)
      .map(({ e, i }) => mapFeedItem(e, i, matchState.clock.displayMinute));

    return {
      matchState,
      events,
      sessionStatus: this.session.status,
      homeScore: matchState.score.home,
      awayScore: matchState.score.away,
      clockLabel: formatClock(matchState.clock.displayMinute),
      periodLabel: mapPeriod(matchState.phase, matchState.clock.period),
      possession,
      stats: [
        {
          label: 'Strzały',
          home: matchState.statistics.home.shots,
          away: matchState.statistics.away.shots,
        },
        {
          label: 'Na bramkę',
          home: matchState.statistics.home.shotsOnTarget,
          away: matchState.statistics.away.shotsOnTarget,
        },
        {
          label: 'Faule',
          home: matchState.statistics.home.fouls,
          away: matchState.statistics.away.fouls,
        },
        {
          label: 'Rożne',
          home: matchState.statistics.home.corners,
          away: matchState.statistics.away.corners,
        },
        {
          label: 'Żółte',
          home: matchState.statistics.home.yellowCards,
          away: matchState.statistics.away.yellowCards,
        },
      ],
      feed,
      tactics: matchState.tactics,
    };
  }

  dispatchUiCommand(commandId: string): void {
    const tick = this.session.context().tick;
    const factories: Record<string, () => Parameters<MatchSession['dispatch']>[0]> = {
      press: () => createSetPressingCommand({ tick, source: 'ui', value: 75 }),
      tempo: () => createSetTempoCommand({ tick, source: 'ui', value: 70 }),
      wide: () => createSetWidthCommand({ tick, source: 'ui', value: 70 }),
      attack: () => createSetMentalityCommand({ tick, source: 'ui', value: 70 }),
      defend: () => createSetMentalityCommand({ tick, source: 'ui', value: 30 }),
      balance: () => createSetMentalityCommand({ tick, source: 'ui', value: 50 }),
    };
    const factory = factories[commandId];
    if (!factory) return;
    this.session.dispatch(factory());
    this.flushEvents();
    this.bump();
  }

  dispose(): void {
    this.stopSimulation();
    this.canvasHost.unbind();
    this.session.dispose();
    this.listeners.clear();
  }

  private flushEvents(): void {
    this.session.context().events.flush();
  }

  private bump(): void {
    this.version += 1;
    for (const l of this.listeners) l();
  }
}

function formatClock(displayMinute: number): string {
  const m = Math.floor(displayMinute);
  const s = Math.floor((displayMinute - m) * 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function mapPeriod(phase: string, period: string): string {
  if (phase === 'FINISHED') return 'Koniec';
  if (phase === 'FULL_TIME') return 'Koniec regulaminowy';
  if (phase === 'PRE_MATCH' || period === 'pre_match') return 'Przed meczem';
  if (period === 'first_half' || phase === 'FIRST_HALF') return '1. połowa';
  if (period === 'second_half' || phase === 'SECOND_HALF') return '2. połowa';
  if (period === 'half_time' || phase === 'HALF_TIME') return 'Przerwa';
  return phase;
}

function mapFeedItem(
  e: EngineEvent,
  index: number,
  minute: number,
): LiveMatchSnapshot['feed'][number] {
  const payloadMinute =
    e.payload && typeof e.payload === 'object' && 'minute' in e.payload
      ? Number((e.payload as { minute: number }).minute)
      : minute;
  return {
    id: `ev-${index}-${e.type}-${e.tick}`,
    minute: `${Math.floor(payloadMinute)}'`,
    kind: eventKind(String(e.type)),
    text: humanizeEvent(e),
    highlight: e.type === 'GOAL',
  };
}

function eventKind(type: string): LiveEventKind {
  switch (type) {
    case 'GOAL':
      return 'goal';
    case 'CARD':
      return 'card';
    case 'SUBSTITUTION':
      return 'sub';
    case 'SHOT':
    case 'ATTACK':
      return 'shot';
    case 'CORNER':
      return 'corner';
    default:
      return 'info';
  }
}

function humanizeEvent(e: EngineEvent): string {
  const side =
    e.payload && typeof e.payload === 'object' && 'side' in e.payload
      ? String((e.payload as { side: string }).side)
      : '';
  switch (e.type) {
    case 'MATCH_START':
      return 'Mecz rozpoczęty.';
    case 'HALF_END':
      return 'Koniec połowy.';
    case 'MATCH_END':
      return 'Koniec meczu.';
    case 'GOAL':
      return `GOL! (${side || 'drużyna'})`;
    case 'SHOT':
      return `Strzał (${side || '—'})`;
    case 'ATTACK':
      return `Atak (${side || '—'})`;
    case 'FOUL':
      return 'Faul.';
    case 'CORNER':
      return `Rzut rożny (${side || '—'})`;
    case 'SUBSTITUTION':
      return 'Zmiana zawodnika.';
    case 'SYSTEM': {
      const kind =
        e.payload && typeof e.payload === 'object' && 'kind' in e.payload
          ? String((e.payload as { kind: string }).kind)
          : 'system';
      if (kind === 'second_half_start') return 'Początek drugiej połowy.';
      return `Komenda: ${kind}`;
    }
    default:
      return String(e.type);
  }
}
