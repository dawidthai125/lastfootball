import { describe, expect, it } from 'vitest';

import {
  createBench,
  createKickoffCommand,
  createLineup,
  createMatch,
  createPlayer,
  createSubstitutePlayerCommand,
} from '../../testing';
import { attributeAssistForGoal, attributePlayerForEvent } from './attribute-player';

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
    settings: {
      halfDurationMs,
      halfTimeDurationMs,
      enableExtraTime: false,
      enablePenalties: false,
    },
  });
}

function openPlay(session: ReturnType<typeof makeSession>) {
  session.start();
  session.step();
  session.dispatch(createKickoffCommand({ tick: session.context().tick, source: 'system' }));
  session.step();
}

function playerRow(session: ReturnType<typeof makeSession>, playerId: string) {
  return session.getMatchState().statistics.players.find((p) => p.playerId === playerId);
}

function runToFinished(session: ReturnType<typeof makeSession>, steps = 5_000) {
  openPlay(session);
  session.run(steps);
}

describe('LFE-PLAYER-MATCH-DATA-01 / LFE-RATINGS-V2', () => {
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
    expect(a.getMatchState().statistics.players).toEqual(b.getMatchState().statistics.players);
    expect(
      a
        .context()
        .events.history()
        .map((e) => e.type),
    ).toEqual(
      b
        .context()
        .events.history()
        .map((e) => e.type),
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
      const payload = e.payload as {
        side: 'home' | 'away';
        playerId?: string;
        assistPlayerId?: string;
      };
      expect(payload.playerId).toBeDefined();
      const row = playerRow(s, payload.playerId!);
      expect(row!.goals).toBeGreaterThan(0);
      expect(row!.side).toBe(payload.side);
      if (payload.assistPlayerId !== undefined) {
        expect(payload.assistPlayerId).not.toBe(payload.playerId);
        expect(playerRow(s, payload.assistPlayerId)!.assists).toBeGreaterThan(0);
      }
    }

    for (const e of fouls) {
      const payload = e.payload as { against: 'home' | 'away'; playerId?: string };
      expect(payload.against).toBeDefined();
      expect(payload.playerId).toBeDefined();
      const row = playerRow(s, payload.playerId!);
      expect(row!.foulsCommitted).toBeGreaterThan(0);
      expect(row!.side).toBe(payload.against === 'home' ? 'away' : 'home');
    }

    for (let i = 0; i < hist.length - 1; i++) {
      if (hist[i]!.type === 'SHOT' && hist[i + 1]!.type === 'GOAL') {
        const shotP = (hist[i]!.payload as { playerId?: string }).playerId;
        const goalP = (hist[i + 1]!.payload as { playerId?: string }).playerId;
        expect(shotP).toBe(goalP);
      }
    }

    const home = s.getMatchState().statistics.home;
    const away = s.getMatchState().statistics.away;
    const playerGoals = s.getMatchState().statistics.players.reduce((n, p) => n + p.goals, 0);
    const playerShots = s.getMatchState().statistics.players.reduce((n, p) => n + p.shots, 0);
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

    expect(s.getMatchState().homeLineup.slots.some((x) => x.playerId === 'h-bench')).toBe(true);
    for (const g of goalsBefore) {
      expect(playerRow(s, g.id)!.goals).toBe(g.goals);
    }

    s.run(400);
    expect(playerRow(s, 'h-bench')).toBeDefined();
    expect(playerRow(s, outId)).toBeDefined();
  });

  it('L1–L2: GOAL bumps scorer goals and assist on a different XI player', () => {
    const s = makeSession(12_000, 100);
    openPlay(s);
    s.run(800);

    const goals = s
      .context()
      .events.history()
      .filter((e) => e.type === 'GOAL');
    expect(goals.length).toBeGreaterThan(0);

    for (const e of goals) {
      const payload = e.payload as {
        playerId?: string;
        assistPlayerId?: string;
        side: 'home' | 'away';
      };
      expect(payload.playerId).toBeDefined();
      if (payload.assistPlayerId !== undefined) {
        expect(payload.assistPlayerId).not.toBe(payload.playerId);
        expect(s.getMatchState().players.some((p) => p.id === payload.assistPlayerId)).toBe(true);
      }
    }

    const totalAssists = s.getMatchState().statistics.players.reduce((n, p) => n + p.assists, 0);
    const goalsWithAssist = goals.filter(
      (e) => (e.payload as { assistPlayerId?: string }).assistPlayerId !== undefined,
    ).length;
    expect(totalAssists).toBe(goalsWithAssist);
  });

  it('L2b: attributeAssistForGoal never returns scorer; undefined when XI size 1', () => {
    const s = makeSession();
    openPlay(s);
    const state = s.getMatchState();
    const scorer = state.homeLineup.slots[0]!.playerId;
    const assist = attributeAssistForGoal(state, 'home', scorer, 10);
    expect(assist).toBeDefined();
    expect(assist).not.toBe(scorer);

    const solo = {
      ...state,
      homeLineup: {
        ...state.homeLineup,
        slots: Object.freeze([state.homeLineup.slots[0]!]),
      },
    };
    expect(attributeAssistForGoal(solo, 'home', scorer, 10)).toBeUndefined();
  });

  it('L3: assists are deterministic across identical seeds', () => {
    const a = makeSession(6_000, 100);
    const b = makeSession(6_000, 100);
    openPlay(a);
    openPlay(b);
    a.run(300);
    b.run(300);
    const assistsA = a.getMatchState().statistics.players.map((p) => p.assists);
    const assistsB = b.getMatchState().statistics.players.map((p) => p.assists);
    expect(assistsA).toEqual(assistsB);
  });

  it('L4: after MATCH_END starters have minutesPlayed > 0; unused bench stays 0', () => {
    const s = makeSession(2_000, 100);
    runToFinished(s, 8_000);
    const state = s.getMatchState();
    expect(state.phase === 'FINISHED' || state.phase === 'FULL_TIME').toBe(true);

    for (const slot of [...state.homeLineup.slots, ...state.awayLineup.slots]) {
      expect(playerRow(s, slot.playerId)!.minutesPlayed).toBeGreaterThan(0);
    }
    expect(playerRow(s, 'h-bench')!.minutesPlayed).toBe(0);
  });

  it('L5: SUB freezes out minutes; in can grow after further play', () => {
    const s = makeSession(4_000, 80);
    openPlay(s);
    s.run(120);

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

    const outMinutesAtSub = playerRow(s, outId)!.minutesPlayed;
    const inMinutesAtSub = playerRow(s, 'h-bench')!.minutesPlayed;
    expect(outMinutesAtSub).toBeGreaterThan(0);
    expect(inMinutesAtSub).toBe(0);

    s.run(8_000);

    expect(playerRow(s, outId)!.minutesPlayed).toBe(outMinutesAtSub);
    expect(playerRow(s, 'h-bench')!.minutesPlayed).toBeGreaterThan(inMinutesAtSub);
  });

  it('L6: OUT fields (passes/tackles/cards) stay zero after play', () => {
    const s = makeSession(5_000, 100);
    openPlay(s);
    s.run(200);
    for (const row of s.getMatchState().statistics.players) {
      expect(row.passesAttempted).toBe(0);
      expect(row.passesCompleted).toBe(0);
      expect(row.tackles).toBe(0);
      expect(row.yellowCards).toBe(0);
      expect(row.redCards).toBe(0);
    }
  });
});
