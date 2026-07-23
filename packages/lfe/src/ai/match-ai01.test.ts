import { describe, expect, it } from 'vitest';

import {
  buildMatchAiContext,
  createBench,
  createKickoffCommand,
  createLineup,
  createMatch,
  createMatchState,
  createMatchTactics,
  createPlayer,
  createScore,
  createTeam,
  decideAction,
  decidePossession,
  formationAggressiveness,
  scorePhaseModifier,
} from '../index';

function roster(side: 'home' | 'away', teamId: string, prefix: string) {
  const ids = Array.from({ length: 11 }, (_, i) => `${prefix}${i}`);
  const players = ids.map((id, i) =>
    createPlayer({
      id,
      teamId,
      side,
      name: `${prefix}${i}`,
      shirtNumber: i + 1,
      preferredRole: 'CM',
    }),
  );
  return { ids, players };
}

function makeState(opts?: {
  homeMentality?: number;
  homeScore?: number;
  awayScore?: number;
  formation?: string;
  minute?: number;
}) {
  const home = roster('home', 'home', 'h');
  const away = roster('away', 'away', 'a');
  let state = createMatchState({
    homeTeam: createTeam({ id: 'home', name: 'Home', shortName: 'HOM', side: 'home' }),
    awayTeam: createTeam({ id: 'away', name: 'Away', shortName: 'AWY', side: 'away' }),
    homeLineup: createLineup({
      side: 'home',
      formationCode: opts?.formation ?? '4-4-2',
      playerIds: home.ids,
    }),
    awayLineup: createLineup({
      side: 'away',
      formationCode: '4-4-2',
      playerIds: away.ids,
    }),
    homeBench: createBench('home', []),
    awayBench: createBench('away', []),
    players: [...home.players, ...away.players],
    phase: 'FIRST_HALF',
  });

  state = Object.freeze({
    ...state,
    tactics: createMatchTactics({
      ...state.tactics,
      mentality: opts?.homeMentality ?? 50,
      formationCode: opts?.formation ?? '4-4-2',
    }),
    score: createScore(opts?.homeScore ?? 0, opts?.awayScore ?? 0),
    clock: Object.freeze({
      ...state.clock,
      displayMinute: opts?.minute ?? 10,
      period: 'first_half' as const,
    }),
  });

  return state;
}

describe('MATCH-AI-01', () => {
  it('formationAggressiveness ranks 4-3-3 above 5-4-1', () => {
    expect(formationAggressiveness('4-3-3')).toBeGreaterThan(formationAggressiveness('5-4-1'));
  });

  it('baseline possession ≈ ENGINE-01 default (~0.48)', () => {
    const ctx = buildMatchAiContext(makeState());
    const d = decidePossession(ctx);
    expect(d.homeChance).toBeCloseTo(0.48, 2);
  });

  it('higher mentality increases attack and goal chances', () => {
    const low = decideAction(buildMatchAiContext(makeState({ homeMentality: 30 })), 'home');
    const high = decideAction(buildMatchAiContext(makeState({ homeMentality: 80 })), 'home');
    expect(high.shotChance).toBeGreaterThan(low.shotChance);
    expect(high.goalChance).toBeGreaterThan(low.goalChance);
  });

  it('trailing late boosts attack pressure', () => {
    const level = scorePhaseModifier(buildMatchAiContext(makeState()).home, 20);
    const trailingLate = scorePhaseModifier(
      buildMatchAiContext(makeState({ homeScore: 0, awayScore: 2, minute: 80 })).home,
      80,
    );
    expect(trailingLate).toBeGreaterThan(level);
  });

  it('leading reduces late attack pressure', () => {
    const leadingLate = scorePhaseModifier(
      buildMatchAiContext(makeState({ homeScore: 2, awayScore: 0, minute: 80 })).home,
      80,
    );
    expect(leadingLate).toBeLessThan(0);
  });

  it('engine still deterministic with AI in the loop', () => {
    const mk = () => {
      const homeIds = Array.from({ length: 11 }, (_, i) => `h${i}`);
      const awayIds = Array.from({ length: 11 }, (_, i) => `a${i}`);
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
      ];
      const s = createMatch({
        seed: 7,
        homeTeamId: 'home',
        awayTeamId: 'away',
        homeLineup: createLineup({ side: 'home', formationCode: '4-4-2', playerIds: homeIds }),
        awayLineup: createLineup({ side: 'away', formationCode: '4-4-2', playerIds: awayIds }),
        homeBench: createBench('home', []),
        awayBench: createBench('away', []),
        players,
        settings: {
          halfDurationMs: 3_000,
          halfTimeDurationMs: 100,
          enableExtraTime: false,
          enablePenalties: false,
        },
      });
      s.start();
      s.step();
      s.dispatch(createKickoffCommand({ tick: s.context().tick, source: 'system' }));
      s.step();
      s.run(120);
      return s;
    };

    const a = mk();
    const b = mk();
    expect(a.getMatchState().score).toEqual(b.getMatchState().score);
    expect(a.context().events.history().map((e) => e.type)).toEqual(
      b.context().events.history().map((e) => e.type),
    );
  });
});
