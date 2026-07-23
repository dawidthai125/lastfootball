import { describe, expect, it } from 'vitest';

import {
  createBench,
  createKickoffCommand,
  createLineup,
  createMatch,
  createPlayer,
  createSubstitutePlayerCommand,
} from '../../index';
import { attributePlayerForEvent } from './attribute-player';

function makeSession(halfDurationMs = 2_000, halfTimeDurationMs = 200) {
  const homeIds = Array.from({ length: 11 }, (_, i) => `h${i}`);
  const awayIds = Array.from({ length: 11 }, (_, i) => `a${i}`);
  const benchHome = ['h-bench'];
  const players = [
    ...homeIds.map((id, i) =>
      createPlayer({
        id,
        teamId: 'home',
        side: 'home',
        name: `H${i}`,
        shirtNumber: i + 1,
        preferredRole: 'CM',
      }),
    ),
    ...awayIds.map((id, i) =>
      createPlayer({
        id,
        teamId: 'away',
        side: 'away',
        name: `A${i}`,
        shirtNumber: i + 1,
        preferredRole: 'CM',
      }),
    ),
    createPlayer({
      id: 'h-bench',
      teamId: 'home',
      side: 'home',
      name: 'HB',
      shirtNumber: 12,
      preferredRole: 'ST',
    }),
  ];

  return createMatch({
    seed: 7,
    homeTeamId: 'home',
    awayTeamId: 'away',
    homeLineup: createLineup({ side: 'home', formationCode: '4-4-2', playerIds: homeIds }),
    awayLineup: createLineup({ side: 'away', formationCode: '4-4-2', playerIds: awayIds }),
    homeBench: createBench('home', benchHome),
    awayBench: createBench('away', []),
    players,
    settings: { halfDurationMs, halfTimeDurationMs, enableExtraTime: false, enablePenalties: false },
  });
}

function openPlay(session: ReturnType<typeof makeSession>) {
  session.start();
  session.step();
  session.dispatch(createKickoffCommand({ tick: session.context().tick, source: 'system' }));
  session.step();
}

function playerRow(
  session: ReturnType<typeof makeSession>,
  playerId: string,
) {
  return session.getMatchState().statistics.players.find((p) => p.playerId === playerId);
}

describe('LFE-PLAYER-MATCH-DATA-01', () => {
  it('T1: createMatch initializes statistics.players for full roster', () => {
    const s = makeSession();
    const state = s.getMatchState();
    expect(state.statistics.players).toHaveLength(state.players.length);
    expect(state.statistics.players).toHaveLength(23);
    for (const row of state.statistics.players) {
      expect(row.goals).toBe(0);
      expect(row.shots).toBe(0);
      expect(row.foulsCommitted).toBe(0);
      expect(row.assists).toBe(0);
      expect(row.minutesPlayed).toBe(0);
      const p = state.players.find((x) => x.id === row.playerId);
      expect(p?.side).toBe(row.side);
    }
  });

  it('T2: attributePlayerForEvent is deterministic', () => {
    const s = makeSession();
    openPlay(s);
    const state = s.getMatchState();
    const a = attributePlayerForEvent(state, 'home', 'SHOT', 42);
    const b = attributePlayerForEvent(state, 'home', 'SHOT', 42);
    const c = attributePlayerForEvent(state, 'home', 'SHOT', 43);
    expect(a).toBeDefined();
    expect(a).toBe(b);
    expect(c).toBeDefined();
    // different tick may differ; still always from home lineup
    expect(state.homeLineup.slots.some((slot) => slot.playerId === a)).toBe(true);
    expect(state.homeLineup.slots.some((slot) => slot.playerId === c)).toBe(true);
  });

  it('T3: same seed keeps score, team stats, and event-type sequence identical across runs', () => {
    const a = makeSession(4_000, 100);
    const b = makeSession(4_000, 100);
    openPlay(a);
    openPlay(b);
    a.run(150);
    b.run(150);
    expect(a.getMatchState().score).toEqual(b.getMatchState().score);
    expect(a.getMatchState().statistics.home).toEqual(b.getMatchState().statistics.home);
    expect(a.getMatchState().statistics.away).toEqual(b.getMatchState().statistics.away);
    expect(a.context().events.history().map((e) => e.type)).toEqual(
      b.context().events.history().map((e) => e.type),
    );
  });

  it('T4–T7: GOAL/SHOT share actor; FOUL attributes fouler; player counters bump', () => {
    const s = makeSession(12_000, 100);
    openPlay(s);
    s.run(800);

    const hist = s.context().events.history();
    const shots = hist.filter((e) => e.type === 'SHOT');
    const goals = hist.filter((e) => e.type === 'GOAL');
    const fouls = hist.filter((e) => e.type === 'FOUL');

    expect(shots.length + goals.length + fouls.length).toBeGreaterThan(0);

    for (const e of shots) {
      const payload = e.payload as { side: 'home' | 'away'; playerId?: string };
      expect(payload.side).toBeDefined();
      expect(payload.playerId).toBeDefined();
      const row = playerRow(s, payload.playerId!);
      expect(row).toBeDefined();
      expect(row!.side).toBe(payload.side);
    }

    for (const e of goals) {
      const payload = e.payload as { side: 'home' | 'away'; playerId?: string };
      expect(payload.playerId).toBeDefined();
      const row = playerRow(s, payload.playerId!);
      expect(row!.goals).toBeGreaterThan(0);
      expect(row!.side).toBe(payload.side);
    }

    for (const e of fouls) {
      const payload = e.payload as { against: 'home' | 'away'; playerId?: string };
      expect(payload.against).toBeDefined();
      expect(payload.playerId).toBeDefined();
      const row = playerRow(s, payload.playerId!);
      expect(row!.foulsCommitted).toBeGreaterThan(0);
      expect(row!.side).toBe(payload.against === 'home' ? 'away' : 'home');
    }

    // Same tick ladder: SHOT then GOAL share playerId when both present consecutively for side
    for (let i = 0; i < hist.length - 1; i++) {
      if (hist[i]!.type === 'SHOT' && hist[i + 1]!.type === 'GOAL') {
        const shotP = (hist[i]!.payload as { playerId?: string }).playerId;
        const goalP = (hist[i + 1]!.payload as { playerId?: string }).playerId;
        expect(shotP).toBe(goalP);
      }
    }

    const home = s.getMatchState().statistics.home;
    const away = s.getMatchState().statistics.away;
    const playerGoals = s
      .getMatchState()
      .statistics.players.reduce((n, p) => n + p.goals, 0);
    const playerShots = s
      .getMatchState()
      .statistics.players.reduce((n, p) => n + p.shots, 0);
    const playerFouls = s
      .getMatchState()
      .statistics.players.reduce((n, p) => n + p.foulsCommitted, 0);

    expect(playerGoals).toBe(home.goals + away.goals);
    expect(playerShots).toBe(home.shots + away.shots);
    expect(playerFouls).toBe(home.fouls + away.fouls);
  });

  it('T9: after substitution, new XI player can be attributed; prior goals kept', () => {
    const s = makeSession(8_000, 100);
    openPlay(s);
    s.run(200);

    const goalsBefore = s
      .getMatchState()
      .statistics.players.map((p) => ({ id: p.playerId, goals: p.goals }));

    const outId = s.getMatchState().homeLineup.slots[10]!.playerId;
    s.dispatch(
      createSubstitutePlayerCommand({
        tick: s.context().tick,
        source: 'user',
        side: 'home',
        playerOutId: outId,
        playerInId: 'h-bench',
      }),
    );
    s.step();

    expect(s.getMatchState().homeLineup.slots.some((x) => x.playerId === 'h-bench')).toBe(
      true,
    );
    // Prior goal counters unchanged for all rows that had goals
    for (const g of goalsBefore) {
      expect(playerRow(s, g.id)!.goals).toBe(g.goals);
    }

    s.run(400);
    // Bench player now on pitch may receive events; roster row still exists
    expect(playerRow(s, 'h-bench')).toBeDefined();
    expect(playerRow(s, outId)).toBeDefined();
  });

  it('T10: OUT fields stay zero after play', () => {
    const s = makeSession(5_000, 100);
    openPlay(s);
    s.run(200);
    for (const row of s.getMatchState().statistics.players) {
      expect(row.assists).toBe(0);
      expect(row.passesAttempted).toBe(0);
      expect(row.passesCompleted).toBe(0);
      expect(row.tackles).toBe(0);
      expect(row.yellowCards).toBe(0);
      expect(row.redCards).toBe(0);
      expect(row.minutesPlayed).toBe(0);
    }
  });
});
