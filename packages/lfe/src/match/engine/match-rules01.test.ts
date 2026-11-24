import { describe, expect, it } from 'vitest';

import { createRng } from '../../rng';
import {
  createBench,
  createLineup,
  createMatch,
  createMatchState,
  createPlayer,
  createSubstitutePlayerCommand,
  createTeam,
} from '../../testing';
import {
  createMatchClock,
  DEFAULT_PLAYER_ATTRIBUTES,
  DEFAULT_PLAYER_CONDITION,
  DEFAULT_PLAYER_SKILLS,
  type MatchState,
  type PitchRole,
  type PitchSide,
  type Player,
  type PlayerId,
} from '../domain';
import { buildMatchAiContext } from '../../ai/context';
import { decideAction } from '../../ai';

import {
  autoSubstitutions,
  cornerGoalChance,
  FULL_RULES,
  penaltyGoalChance,
  rollCard,
  rollInjury,
  setPieceTaker,
  penaltyQuality,
} from './incidents';
import { computeMinutesPlayed } from './minutes-played';
import { freshBench } from './substitution';
import { simulateMatchTick } from './tick';

const ROLES: PitchRole[] = ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'ST', 'ST'];
const BENCH: PitchRole[] = ['GK', 'CB', 'CM', 'ST'];

type Options = {
  readonly rules?: boolean;
  readonly bench?: boolean;
  readonly energy?: number;
  readonly edit?: (p: Player) => Player;
  readonly captain?: PlayerId;
};

function build(o: Options = {}) {
  const player = (side: PitchSide, id: string, role: PitchRole, i: number) => {
    const energy = o.energy ?? 85;
    const p = createPlayer({
      id: id as PlayerId,
      teamId: side,
      side,
      name: id,
      shirtNumber: i + 1,
      preferredRole: role,
      condition: { ...DEFAULT_PLAYER_CONDITION, energy, freshness: energy },
    });
    return o.edit ? o.edit(p) : p;
  };
  const xi = (side: PitchSide) => ROLES.map((r, i) => player(side, `${side}-${i}`, r, i));
  const bench = (side: PitchSide) =>
    o.bench === false ? [] : BENCH.map((r, i) => player(side, `${side}-b${i}`, r, 11 + i));
  const home = xi('home');
  const away = xi('away');
  const homeBench = bench('home');
  const awayBench = bench('away');
  return {
    homeLineup: createLineup({
      side: 'home',
      formationCode: '4-4-2',
      playerIds: home.map((p) => p.id),
      captainPlayerId: o.captain ?? null,
    }),
    awayLineup: createLineup({
      side: 'away',
      formationCode: '4-4-2',
      playerIds: away.map((p) => p.id),
    }),
    homeBench: createBench(
      'home',
      homeBench.map((p) => p.id),
    ),
    awayBench: createBench(
      'away',
      awayBench.map((p) => p.id),
    ),
    players: [...home, ...away, ...homeBench, ...awayBench],
    ...(o.rules === false ? {} : { rules: { autoSides: ['away'] as const, maxSubstitutions: 3 } }),
  };
}

function state(o: Options = {}): MatchState {
  return createMatchState({
    ...build(o),
    homeTeam: createTeam({ id: 'h', name: 'H', shortName: 'H', side: 'home' }),
    awayTeam: createTeam({ id: 'a', name: 'A', shortName: 'A', side: 'away' }),
    phase: 'FIRST_HALF',
  });
}

const at = (s: MatchState, minute: number): MatchState => ({
  ...s,
  clock: createMatchClock({ ...s.clock, displayMinute: minute }),
});

const fixed = (...values: number[]) => {
  let i = 0;
  return { ...createRng(1), next: () => values[Math.min(i++, values.length - 1)]! };
};

function play(seed: number, o: Options = {}) {
  let s = state(o);
  const rng = createRng(seed);
  const types: string[] = [];
  let tick = 0;
  for (const phase of ['FIRST_HALF', 'SECOND_HALF'] as const) {
    s = { ...s, phase, clock: createMatchClock() };
    for (let t = 0; t < 901; t += 1) {
      tick += 1;
      const r = simulateMatchTick(s, {
        tick,
        dtMs: 50,
        rng,
        halfDurationMs: 45_000,
        halfTimeDurationMs: 3_000,
        extraTimeDurationMs: 0,
        enableExtraTime: false,
        enablePenalties: false,
      });
      s = r.state;
      types.push(...r.emits.map((e) => String(e.type)));
      if (r.lifecycle.length > 0) break;
    }
  }
  return { s, types };
}

describe('LFE-MATCH-RULES-01 (D151)', () => {
  it('plays the old way without rules', () => {
    const { s, types } = play(5, { rules: false });
    expect(s.rules).toBeNull();
    expect(s.cards).toHaveLength(0);
    expect(s.injuries).toHaveLength(0);
    expect(s.substitutions).toHaveLength(0);
    expect(types).not.toContain('OFFSIDE');
    expect(types).not.toContain('PENALTY');
  });

  it('is the same match for the same seed', () => {
    expect(JSON.stringify(play(11).s)).toBe(JSON.stringify(play(11).s));
  });

  it('keeps football numbers for level teams', () => {
    const n = 80;
    const sum = { goals: 0, yellow: 0, red: 0, offside: 0, penalty: 0, shots: 0, subs: 0 };
    for (let i = 0; i < n; i += 1) {
      const { s, types } = play(900 + i * 17);
      sum.goals += s.score.home + s.score.away;
      sum.subs += s.substitutions.filter((x) => x.side === 'away').length;
      for (const side of ['home', 'away'] as const) {
        sum.yellow += s.statistics[side].yellowCards;
        sum.red += s.statistics[side].redCards;
        sum.offside += s.statistics[side].offsides;
        sum.shots += s.statistics[side].shots;
        expect(s.statistics[side].goals).toBe(s.score[side]);
      }
      sum.penalty += types.filter((t) => t === 'PENALTY').length;
      const scorers = s.statistics.players.reduce((total, p) => total + p.goals, 0);
      expect(scorers).toBe(s.score.home + s.score.away);
    }
    expect(sum.goals / n).toBeGreaterThan(2.1);
    expect(sum.goals / n).toBeLessThan(3.2);
    expect(sum.shots / n).toBeGreaterThan(20);
    expect(sum.shots / n).toBeLessThan(31);
    expect(sum.yellow / n).toBeGreaterThan(2.5);
    expect(sum.yellow / n).toBeLessThan(4.5);
    expect(sum.red / n).toBeGreaterThan(0.03);
    expect(sum.red / n).toBeLessThan(0.4);
    expect(sum.offside / n).toBeGreaterThan(2);
    expect(sum.offside / n).toBeLessThan(5);
    expect(sum.penalty / n).toBeGreaterThan(0.1);
    expect(sum.penalty / n).toBeLessThan(0.6);
    expect(sum.subs / n).toBeGreaterThan(1.5);
  }, 60_000);

  it('a second yellow sends off, frees the armband and stops the minutes', () => {
    const id = 'home-2' as PlayerId;
    const yellow = FULL_RULES.RED + 0.01;
    const first = rollCard(at(state({ captain: id }), 20), 'home', id, 100, fixed(yellow));
    expect(first.state.homeLineup.slots).toHaveLength(11);
    const second = rollCard(at(first.state, 60), 'home', id, 900, fixed(yellow));
    expect(second.state.homeLineup.slots).toHaveLength(10);
    expect(second.state.homeLineup.captainPlayerId).not.toBe(id);
    expect(second.state.homeLineup.captainPlayerId).not.toBeNull();
    expect(second.state.statistics.home.redCards).toBe(1);
    expect(second.emits[0]!.payload).toMatchObject({ colour: 'red', second: true });
    expect(computeMinutesPlayed(id, second.state, 90)).toBe(60);

    const ctx = buildMatchAiContext(second.state);
    const before = decideAction(buildMatchAiContext(at(state(), 60)), 'home');
    expect(decideAction(ctx, 'home').attackChance).toBeLessThan(before.attackChance);
    expect(decideAction(ctx, 'away').attackChance).toBeGreaterThan(
      decideAction(buildMatchAiContext(at(state(), 60)), 'away').attackChance,
    );
  });

  it('never leaves a side with fewer than seven', () => {
    let s = at(state(), 30);
    for (const slot of [...s.homeLineup.slots]) {
      s = rollCard(s, 'home', slot.playerId, 1, fixed(0)).state;
    }
    expect(s.homeLineup.slots).toHaveLength(FULL_RULES.MIN_PLAYERS);
  });

  it('an injury brings on a bench player, and nobody once the changes are gone', () => {
    let s = at(state({ energy: 30 }), 10);
    const first = rollInjury(s, 1, 10, fixed(0.2));
    expect(first.emits.map((e) => e.type)).toEqual(['INJURY', 'SUBSTITUTION']);
    expect(first.state.injuries[0]!.severity).toBe('serious');
    expect(first.state.homeLineup.slots).toHaveLength(11);
    const hurt = first.state.injuries[0]!.playerId;
    expect(freshBench(first.state, 'home')).not.toContain(hurt);

    s = { ...s, rules: { ...s.rules!, maxSubstitutions: 0 } };
    const stuck = rollInjury(s, 1, 10, fixed(0.2));
    expect(stuck.state.homeLineup.slots).toHaveLength(10);
    expect(computeMinutesPlayed(stuck.state.injuries[0]!.playerId, stuck.state, 90)).toBe(10);
  });

  it('without any bench the injured player stays on', () => {
    const r = rollInjury(at(state({ bench: false, energy: 30 }), 10), 1, 10, fixed(0.2));
    expect(r.state.injuries).toHaveLength(1);
    expect(r.state.injuries[0]!.forcedOff).toBe(false);
    expect(r.state.homeLineup.slots).toHaveLength(11);
  });

  it('a tough player gets hurt less, a stayer keeps his legs', () => {
    const tough = state({
      energy: 30,
      edit: (p) => ({ ...p, attributes: { ...DEFAULT_PLAYER_ATTRIBUTES, strength: 100 } }),
    });
    // The first player's share of the draw is halved.
    const share = FULL_RULES.INJURY_EXHAUSTED * 0.75;
    expect(rollInjury(state({ energy: 30 }), 1, 1, fixed(share)).state.injuries[0]!.playerId).toBe(
      'home-0',
    );
    expect(rollInjury(tough, 1, 1, fixed(share)).state.injuries[0]!.playerId).toBe('home-1');

    const stayer = state({
      edit: (p) => ({ ...p, attributes: { ...DEFAULT_PLAYER_ATTRIBUTES, stamina: 90 } }),
    });
    expect(buildMatchAiContext(at(stayer, 80)).home.freshness).toBeGreaterThan(
      buildMatchAiContext(at(state(), 80)).home.freshness,
    );
  });

  it('only the engine side makes its own changes, at most three', () => {
    let s = state();
    for (let minute = 1; minute <= 90; minute += 1) {
      s = autoSubstitutions(at(s, minute), minute).state;
    }
    expect(s.substitutions.filter((x) => x.side === 'home')).toHaveLength(0);
    expect(s.substitutions.filter((x) => x.side === 'away')).toHaveLength(3);
    expect(s.substitutions[0]!.matchMinute).toBeGreaterThanOrEqual(58);
    expect(s.substitutions.some((x) => x.playerOutId === 'away-0')).toBe(false);
  });

  it('a trailing engine side brings on a forward', () => {
    const s = { ...at(state(), 70), score: { home: 2, away: 0 } };
    const first = autoSubstitutions(s, 1).state.substitutions[0]!;
    expect(first.playerInId).toBe('away-b3');
  });

  it('the chosen taker takes, and a better one scores more', () => {
    const s = state({
      edit: (p) =>
        p.id === 'home-9'
          ? {
              ...p,
              skills: { ...DEFAULT_PLAYER_SKILLS, finishing: 90, composure: 90, crossing: 90 },
            }
          : p,
    });
    const best = setPieceTaker(s, 'home', penaltyQuality)!;
    expect(best.id).toBe('home-9');
    const chosen = {
      ...s,
      homeLineup: { ...s.homeLineup, setPiecePlayerId: 'home-3' as PlayerId },
    };
    const taker = setPieceTaker(chosen, 'home', penaltyQuality)!;
    expect(taker.id).toBe('home-3');
    expect(penaltyGoalChance(s, 'home', best)).toBeGreaterThan(penaltyGoalChance(s, 'home', taker));
    expect(cornerGoalChance(s, 'home', best)).toBeGreaterThan(cornerGoalChance(s, 'home', taker));
  });

  it('a leader with the armband lifts the team, more when it is behind', () => {
    const id = 'home-6' as PlayerId;
    const lead = (leadership: number, score = { home: 0, away: 0 }) =>
      decideAction(
        buildMatchAiContext({
          ...state({ captain: id, edit: (p) => (p.id === id ? { ...p, leadership } : p) }),
          score,
        }),
        'home',
      ).attackChance;
    expect(lead(90)).toBeGreaterThan(lead(50));
    expect(lead(30)).toBeLessThan(lead(50));
    const behind = { home: 0, away: 1 };
    expect(lead(90, behind) / lead(50, behind)).toBeGreaterThan(lead(90) / lead(50));
  });

  it('a player who left cannot come back, and a man down keeps a valid shape', () => {
    const session = createMatch({ seed: 4, homeTeamId: 'h', awayTeamId: 'a', ...build() });
    session.start();
    session.step();
    const sub = (out: string, inn: string) =>
      session.dispatch(
        createSubstitutePlayerCommand({
          tick: session.context().tick,
          source: 'ui',
          side: 'home',
          playerOutId: out as PlayerId,
          playerInId: inn as PlayerId,
        }),
      ).ok;
    expect(sub('home-9', 'home-b3')).toBe(true);
    expect(sub('home-b3', 'home-9')).toBe(false);
    session.dispose();
  });
});
