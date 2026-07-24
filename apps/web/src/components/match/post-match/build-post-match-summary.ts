/**
 * LFE-POST-MATCH-01 — pure summary builders from recorded match data.
 * No Engine / AI / Replay module mutations.
 */

import type { EngineEvent, MatchState } from '@lastfootball/lfe';

import type { LiveEventKind } from '@/data/fixtures';
import type { MatchCanvasReadModel } from '@/gameplay/canvas-host';
import type { ReplayBuffer } from '@/gameplay/replay';

export type PostMatchGoal = {
  readonly tick: number;
  readonly minute: string;
  readonly side: 'home' | 'away' | 'unknown';
  readonly text: string;
};

export type PostMatchTimelineItem = {
  readonly tick: number;
  readonly minute: string;
  readonly type: string;
  readonly kind: LiveEventKind;
  readonly text: string;
  readonly highlight: boolean;
  readonly side?: string;
};

export type PostMatchStat = {
  readonly label: string;
  readonly home: number;
  readonly away: number;
};

export type PostMatchSummary = {
  readonly homeName: string;
  readonly awayName: string;
  readonly homeShort: string;
  readonly awayShort: string;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly resultLabel: string;
  readonly goals: readonly PostMatchGoal[];
  readonly timeline: readonly PostMatchTimelineItem[];
  readonly stats: readonly PostMatchStat[];
  readonly possession: { readonly home: number; readonly away: number };
};

const TIMELINE_TYPES = new Set([
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
]);

export type BuildPostMatchInput = {
  readonly matchState: MatchState;
  readonly events: readonly EngineEvent[];
  readonly homeName: string;
  readonly awayName: string;
  readonly homeShort: string;
  readonly awayShort: string;
};

export function buildPostMatchSummary(input: BuildPostMatchInput): PostMatchSummary {
  const { matchState, events, homeName, awayName, homeShort, awayShort } = input;
  const homeScore = matchState.score.home;
  const awayScore = matchState.score.away;

  const goals: PostMatchGoal[] = [];
  const timeline: PostMatchTimelineItem[] = [];

  for (const e of events) {
    const type = String(e.type);
    if (!TIMELINE_TYPES.has(type)) continue;
    if (type === 'SYSTEM') continue;

    const side = eventSide(e);
    const minute = eventMinute(e, matchState.clock.displayMinute);
    const text = humanize(e, side);
    const kind = eventKind(type);
    const highlight = type === 'GOAL';

    timeline.push({
      tick: e.tick,
      minute,
      type,
      kind,
      text,
      highlight,
      side,
    });

    if (type === 'GOAL') {
      goals.push({
        tick: e.tick,
        minute,
        side: side === 'home' || side === 'away' ? side : 'unknown',
        text,
      });
    }
  }

  const homePoss = matchState.statistics.home.possessionTicks;
  const awayPoss = matchState.statistics.away.possessionTicks;
  const totalPoss = homePoss + awayPoss;
  const possession =
    totalPoss === 0
      ? { home: 50, away: 50 }
      : {
          home: Math.round((homePoss / totalPoss) * 100),
          away: Math.round((awayPoss / totalPoss) * 100),
        };

  return {
    homeName,
    awayName,
    homeShort,
    awayShort,
    homeScore,
    awayScore,
    resultLabel: resultLabel(homeScore, awayScore),
    goals,
    timeline,
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
    possession,
  };
}

/**
 * First Replay buffer index where the event tick is present in recorded EventBus history.
 * Read-only — does not mutate Replay Buffer / Controller.
 */
export function findReplayIndexForEvent(
  buffer: Pick<ReplayBuffer, 'toArray' | 'length'>,
  eventTick: number,
  eventType?: string,
): number {
  const frames = buffer.toArray();
  if (frames.length === 0) return 0;

  for (let i = 0; i < frames.length; i++) {
    const hit = frames[i]!.model.events.some((e) => {
      if (e.tick !== eventTick) return false;
      if (eventType && String(e.type) !== eventType) return false;
      return true;
    });
    if (hit) return i;
  }

  for (let i = 0; i < frames.length; i++) {
    if (frames[i]!.model.tick >= eventTick) return i;
  }

  return frames.length - 1;
}

export function isMatchFinished(matchState: MatchState, events: readonly EngineEvent[]): boolean {
  if (matchState.phase === 'FINISHED' || matchState.phase === 'FULL_TIME') return true;
  return events.some((e) => e.type === 'MATCH_END');
}

export function summaryFromReadModel(
  model: MatchCanvasReadModel,
  teams: Pick<BuildPostMatchInput, 'homeName' | 'awayName' | 'homeShort' | 'awayShort'>,
): PostMatchSummary {
  return buildPostMatchSummary({
    matchState: model.matchState,
    events: model.events,
    ...teams,
  });
}

function resultLabel(home: number, away: number): string {
  if (home > away) return 'Zwycięstwo gospodarzy';
  if (home < away) return 'Zwycięstwo gości';
  return 'Remis';
}

function eventSide(e: EngineEvent): string | undefined {
  if (!e.payload || typeof e.payload !== 'object') return undefined;
  if ('side' in e.payload) return String((e.payload as { side: string }).side);
  return undefined;
}

function eventMinute(e: EngineEvent, fallback: number): string {
  const m =
    e.payload && typeof e.payload === 'object' && 'minute' in e.payload
      ? Number((e.payload as { minute: number }).minute)
      : fallback;
  return `${Math.floor(m)}'`;
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

function humanize(e: EngineEvent, side: string | undefined): string {
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
    case 'CARD':
      return 'Kartka.';
    default:
      return String(e.type);
  }
}
