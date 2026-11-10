import type { EngineEvent, FormationCode, MatchSession, MatchState } from '@lastfootball/lfe';
import {
  createChangeFormationCommand,
  createKickoffCommand,
  createPauseMatchCommand,
  createResumeMatchCommand,
  createSetMentalityCommand,
  createSetPressingCommand,
  createSetTempoCommand,
  createSetWidthCommand,
  createSubstitutePlayerCommand,
} from '@lastfootball/lfe';

import type { Fixture } from '@/data/fixtures';
import type { LiveEventKind, LiveMatchBundle } from '@/data/fixtures';
import { createSessionFromFirstMatch } from '@/lib/first-match/create-session';
import { FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { createSessionFromLeagueFixture } from '@/lib/fixtures/create-session';
import type { FixtureDto } from '@/lib/fixtures/types';
import type { ClubDto } from '@/lib/club/types';
import type { RosterPlayerSeed } from '@/lib/squad';
import { createMatchCanvasHost, type MatchCanvasHost } from '@/gameplay/canvas-host';
import type { MatchCanvasRendererApi } from '@/gameplay/canvas';
import {
  createReplayBuffer,
  createReplayController,
  type PlaybackSource,
  type ReplayBuffer,
  type ReplayController,
  type ReplaySpeed,
  type ReplayView,
} from '@/gameplay/replay';

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
  readonly replay: ReplayView;
};

/** Product window from GDD §9.10 while the manager is watching live. */
export const LIVE_SUB_LIMIT = 3;

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
  'FORMATION_CHANGE',
  'SYSTEM',
]);

/** Thrown when a live match has no club session. Seed clubs are not a fallback. */
export class MatchSessionDataError extends Error {
  constructor() {
    super('Mecz wymaga klubu i składu. Nie podstawiam atrapy.');
    this.name = 'MatchSessionDataError';
  }
}

/**
 * Owns MatchSession + Canvas host + Replay buffer/controller.
 * Match Engine advances via session.step/run only in LIVE mode.
 * Replay presents recorded MatchCanvasReadModel — never re-runs Engine.
 */
export class LiveMatchRuntime {
  readonly session: MatchSession;
  readonly canvasHost: MatchCanvasHost;
  readonly fixture: Fixture;
  readonly shell: LiveMatchBundle;
  readonly replayBuffer: ReplayBuffer;
  readonly replay: ReplayController;

  private version = 0;
  private listeners = new Set<() => void>();
  private cachedSnapshot: LiveMatchSnapshot | null = null;
  private cachedVersion = -1;
  private timer: ReturnType<typeof setInterval> | null = null;
  private ticksPerPulse = 1;
  private playbackSource: PlaybackSource = 'live';
  private readonly managerSide: 'home' | 'away';

  constructor(
    fixture: Fixture,
    shell: LiveMatchBundle,
    club?: ClubDto | null,
    leagueFixture?: FixtureDto | null,
    ourXi?: readonly RosterPlayerSeed[] | null,
    ourBench?: readonly RosterPlayerSeed[] | null,
    ourFormation: FormationCode = '4-4-2',
  ) {
    this.fixture = fixture;
    this.shell = shell;
    this.managerSide = fixture.home ? 'home' : 'away';
    this.session = resolveSession(
      fixture,
      club,
      leagueFixture ?? null,
      ourXi ?? null,
      ourBench ?? null,
      ourFormation,
    );
    this.canvasHost = createMatchCanvasHost();
    this.canvasHost.bind(this.session);
    this.replayBuffer = createReplayBuffer({ capacity: 3600 });
    this.replay = createReplayController(this.replayBuffer, {
      onPresent: (model) => {
        if (this.playbackSource === 'replay') {
          this.canvasHost.present(model);
        }
      },
      onChange: () => this.bump(),
      baseIntervalMs: 50,
    });
    this.bootstrapMatch();
  }

  /** Call from useEffect — never start timers during render/useMemo. */
  ensureSimulationRunning(): void {
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
    this.recordAndMaybePresentLive();
    this.bump();
  }

  startSimulation(): void {
    if (this.playbackSource === 'replay') return;
    if (this.timer !== null) return;
    this.timer = setInterval(() => {
      if (this.playbackSource === 'replay') return;
      if (this.session.status === 'paused' || this.session.status === 'disposed') return;
      if (this.session.status === 'stopped') {
        this.stopSimulation();
        return;
      }
      const phase = this.session.getMatchState().phase;
      if (phase === 'FINISHED') {
        this.stopSimulation();
        this.flushEvents();
        this.recordAndMaybePresentLive();
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
      this.recordAndMaybePresentLive();
      this.bump();
    }, 200);
  }

  stopSimulation(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getPlaybackSource(): PlaybackSource {
    return this.playbackSource;
  }

  getReplayView(): ReplayView {
    const model = this.replay.getCurrentModel();
    return {
      source: this.playbackSource,
      status: this.replay.getStatus(),
      index: this.replay.getIndex(),
      length: this.replay.getLength(),
      speed: this.replay.getSpeed(),
      sequence: this.replayBuffer.at(this.replay.getIndex())?.sequence ?? null,
      tick: model?.tick ?? null,
    };
  }

  /** Pause Engine simulation and drive Canvas from Replay Buffer only. */
  enterReplay(seekTo: 'start' | 'end' = 'start'): void {
    if (this.replayBuffer.length === 0) return;
    this.stopSimulation();
    this.playbackSource = 'replay';
    this.applyRendererPlaybackMode('replay');
    if (seekTo === 'end') {
      this.replay.seek(this.replayBuffer.length - 1);
    } else {
      this.replay.stop();
    }
    this.bump();
  }

  /** Leave Replay and resume LIVE Engine simulation (if match not finished). */
  exitReplay(): void {
    this.replay.pause();
    this.playbackSource = 'live';
    this.applyRendererPlaybackMode('live');
    const live = this.canvasHost.getReadModel();
    if (live) this.canvasHost.present(live);
    const phase = this.session.getMatchState().phase;
    if (phase !== 'FINISHED' && this.session.status === 'running') {
      this.startSimulation();
    }
    this.bump();
  }

  replayPlay(): void {
    if (this.playbackSource !== 'replay') this.enterReplay('start');
    this.syncReplayInterp();
    this.replay.play();
  }

  replayPause(): void {
    this.replay.pause();
  }

  replayStop(): void {
    if (this.playbackSource !== 'replay') this.enterReplay('start');
    this.replay.stop();
  }

  replaySeek(index: number): void {
    if (this.playbackSource !== 'replay') this.enterReplay('start');
    this.replay.seek(index);
  }

  replaySeekRatio(ratio: number): void {
    if (this.playbackSource !== 'replay') this.enterReplay('start');
    this.replay.seekRatio(ratio);
  }

  replaySetSpeed(speed: ReplaySpeed): void {
    this.replay.setSpeed(speed);
    this.syncReplayInterp();
  }

  private syncReplayInterp(): void {
    const renderer = this.canvasHost.getRenderer() as MatchCanvasRendererApi | null;
    if (!renderer?.setInterpMs) return;
    const speed = this.replay.getSpeed();
    renderer.setInterpMs(Math.max(16, Math.round(50 / speed)));
  }

  private applyRendererPlaybackMode(mode: 'live' | 'replay'): void {
    const renderer = this.canvasHost.getRenderer() as MatchCanvasRendererApi | null;
    renderer?.setPlaybackMode?.(mode);
  }

  private recordAndMaybePresentLive(): void {
    const model = this.canvasHost.getReadModel();
    if (!model) return;
    this.replayBuffer.append(model);
    if (this.playbackSource === 'live') {
      this.canvasHost.present(model);
    }
  }

  private buildSnapshot(): LiveMatchSnapshot {
    const replayView = this.getReplayView();
    const replayModel = this.playbackSource === 'replay' ? this.replay.getCurrentModel() : null;
    const matchState = replayModel?.matchState ?? this.session.getMatchState();
    const events = replayModel
      ? [...replayModel.events]
      : [...this.session.context().events.history()];
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
      .map(({ e, i }) => mapFeedItem(e, i, matchState.clock.displayMinute, matchState.players));

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
      replay: replayView,
    };
  }

  /** 1 = a full match is about six minutes. 2 and 4 only speed the clock. */
  setWatchSpeed(speed: 1 | 2 | 4): void {
    if (this.playbackSource !== 'live') return;
    this.ticksPerPulse = speed;
    this.bump();
  }

  togglePause(): void {
    if (!this.watchingLive()) return;
    const tick = this.session.context().tick;
    const command =
      this.session.status === 'paused'
        ? createResumeMatchCommand({ tick, source: 'ui' })
        : createPauseMatchCommand({ tick, source: 'ui' });
    this.session.dispatch(command);
    this.bump();
  }

  substitute(playerOutId: string, playerInId: string): { ok: boolean; error?: string } {
    if (!this.watchingLive()) {
      return { ok: false, error: 'Zmiany tylko gdy oglądasz mecz na żywo.' };
    }
    const state = this.session.getMatchState();
    if (state.phase === 'FINISHED' || state.phase === 'FULL_TIME') {
      return { ok: false, error: 'Mecz już się skończył.' };
    }
    const used = state.substitutions.filter((sub) => sub.side === this.managerSide).length;
    if (used >= LIVE_SUB_LIMIT) {
      return { ok: false, error: 'Wykorzystałeś 3 zmiany.' };
    }
    const result = this.session.dispatch(
      createSubstitutePlayerCommand({
        tick: this.session.context().tick,
        source: 'ui',
        side: this.managerSide,
        playerOutId,
        playerInId,
      }),
    );
    if (!result.ok) {
      return { ok: false, error: 'Ta zmiana nie weszła. Wybierz kogoś z boiska i kogoś z ławki.' };
    }
    this.flushEvents();
    this.recordAndMaybePresentLive();
    this.bump();
    return { ok: true };
  }

  dispatchUiCommand(commandId: string): boolean {
    if (!this.watchingLive()) return false;
    const tick = this.session.context().tick;
    const side = this.managerSide;
    const factories: Record<string, () => Parameters<MatchSession['dispatch']>[0]> = {
      press: () => createSetPressingCommand({ tick, source: 'ui', value: 75, side }),
      tempo: () => createSetTempoCommand({ tick, source: 'ui', value: 70, side }),
      wide: () => createSetWidthCommand({ tick, source: 'ui', value: 70, side }),
      attack: () => createSetMentalityCommand({ tick, source: 'ui', value: 70, side }),
      defend: () => createSetMentalityCommand({ tick, source: 'ui', value: 30, side }),
      balance: () => createSetMentalityCommand({ tick, source: 'ui', value: 50, side }),
      'form-442': () =>
        createChangeFormationCommand({ tick, source: 'ui', side, formationCode: '4-4-2' }),
      'form-433': () =>
        createChangeFormationCommand({ tick, source: 'ui', side, formationCode: '4-3-3' }),
    };
    const factory = factories[commandId];
    if (!factory) return false;
    const result = this.session.dispatch(factory());
    if (!result.ok) return false;
    this.flushEvents();
    this.recordAndMaybePresentLive();
    this.bump();
    return true;
  }

  private watchingLive(): boolean {
    return this.playbackSource === 'live' && this.session.status !== 'stopped';
  }

  dispose(): void {
    this.stopSimulation();
    this.replay.dispose();
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
  if (phase === 'EXTRA_TIME' || period === 'extra_time_first' || period === 'extra_time_second') {
    return 'Dogrywka';
  }
  if (phase === 'PENALTIES' || period === 'penalties') return 'Karne';
  return phase;
}

function mapFeedItem(
  e: EngineEvent,
  index: number,
  minute: number,
  players: MatchState['players'],
): LiveMatchSnapshot['feed'][number] {
  const rawMinute =
    e.payload && typeof e.payload === 'object' && 'minute' in e.payload
      ? Number((e.payload as { minute: number }).minute)
      : Number.NaN;
  const payloadMinute = Number.isFinite(rawMinute)
    ? rawMinute
    : e.type === 'MATCH_START'
      ? 0
      : minute;
  return {
    id: `ev-${index}-${e.type}-${e.tick}`,
    minute: `${Math.floor(payloadMinute)}'`,
    kind: eventKind(String(e.type)),
    text: humanizeEvent(e, players),
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

function nameOf(players: MatchState['players'], id: string): string {
  return players.find((player) => player.id === id)?.name ?? 'zawodnik';
}

function humanizeEvent(e: EngineEvent, names: MatchState['players']): string {
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
    case 'FORMATION_CHANGE': {
      const code =
        e.payload && typeof e.payload === 'object' && 'formationCode' in e.payload
          ? String((e.payload as { formationCode: string }).formationCode)
          : '';
      return `Układ ${code || '—'}`;
    }
    case 'SUBSTITUTION': {
      const outId =
        e.payload && typeof e.payload === 'object' && 'playerOutId' in e.payload
          ? String((e.payload as { playerOutId: string }).playerOutId)
          : '';
      const inId =
        e.payload && typeof e.payload === 'object' && 'playerInId' in e.payload
          ? String((e.payload as { playerInId: string }).playerInId)
          : '';
      return `${nameOf(names, outId)} ↔ ${nameOf(names, inId)}`;
    }
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

function resolveSession(
  fixture: Fixture,
  club: ClubDto | null | undefined,
  leagueFixture: FixtureDto | null,
  ourXi: readonly RosterPlayerSeed[] | null,
  ourBench: readonly RosterPlayerSeed[] | null,
  ourFormation: FormationCode,
): MatchSession {
  if (fixture.id === FIRST_MATCH_ID && club && ourXi) {
    return createSessionFromFirstMatch(club, ourXi, ourBench ?? []);
  }
  if (club && leagueFixture && ourXi) {
    return createSessionFromLeagueFixture(club, leagueFixture, ourXi, ourBench ?? [], ourFormation);
  }
  throw new MatchSessionDataError();
}
