import { describe, expect, it } from 'vitest';

import {
  resolveLeagueStrengthProfile,
  resolveOpponentPlayerSkill,
} from '@/lib/league/league-strength-profile';
import type { LeagueTier } from '@/lib/league/league-tier';
import { LEAGUE_TIERS_ASC } from '@/lib/league/league-tier';
import { mapPlayerSkillToLfeSkills, clampSkill } from '@/lib/match/map-player-skill-to-lfe';
import { seedOpponentSquad } from '@/lib/squad/seed-roster';
import { createSessionFromLeagueFixture } from '@/lib/fixtures/create-session';
import type { ClubDto } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import type { RosterPlayerSeed } from '@/lib/squad/seed-roster';
import type { PitchRole } from '@lastfootball/lfe';

describe('LFE-LEAGUE-WORLD-02 strength profile', () => {
  it('profiles are valid bands and mid rises IV→I', () => {
    const mids: number[] = [];
    for (const tier of LEAGUE_TIERS_ASC) {
      const p = resolveLeagueStrengthProfile(tier);
      expect(p.minSkill).toBeGreaterThanOrEqual(1);
      expect(p.maxSkill).toBeLessThanOrEqual(99);
      expect(p.minSkill).toBeLessThanOrEqual(p.maxSkill);
      mids.push((p.minSkill + p.maxSkill) / 2);
    }
    for (let i = 1; i < mids.length; i += 1) {
      expect(mids[i]!).toBeGreaterThan(mids[i - 1]!);
    }
  });

  it('opponent skill is deterministic and in band', () => {
    const profile = resolveLeagueStrengthProfile('iii');
    const a = resolveOpponentPlayerSkill('opp-wilki-polnocy', 3, profile);
    const b = resolveOpponentPlayerSkill('opp-wilki-polnocy', 3, profile);
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(profile.minSkill);
    expect(a).toBeLessThanOrEqual(profile.maxSkill);
  });

  it('seedOpponentSquad skills respect tier band', () => {
    const tier: LeagueTier = 'i';
    const profile = resolveLeagueStrengthProfile(tier);
    const squad = seedOpponentSquad('opp-stal-brzeg', tier);
    expect(squad).toHaveLength(11);
    for (const p of squad) {
      expect(p.skill).toBeGreaterThanOrEqual(profile.minSkill);
      expect(p.skill).toBeLessThanOrEqual(profile.maxSkill);
    }
    const weak = seedOpponentSquad('opp-stal-brzeg', 'iv');
    const midI = squad.reduce((s, p) => s + (p.skill ?? 0), 0) / squad.length;
    const midIv = weak.reduce((s, p) => s + (p.skill ?? 0), 0) / weak.length;
    expect(midI).toBeGreaterThan(midIv);
  });
});

describe('LFE-LEAGUE-WORLD-02 player skill Thin adapter', () => {
  it('maps uniformly and clamps', () => {
    const skills = mapPlayerSkillToLfeSkills(70);
    expect(skills.finishing).toBe(70);
    expect(skills.gkDiving).toBe(70);
    expect(skills.shortPassing).toBe(70);
    expect(clampSkill(0)).toBe(1);
    expect(clampSkill(200)).toBe(99);
    expect(mapPlayerSkillToLfeSkills(0).finishing).toBe(1);
  });
});

describe('LFE-LEAGUE-WORLD-02 league session skills', () => {
  function club(tier: LeagueTier): ClubDto {
    return {
      id: 'c1',
      ownerId: 'u1',
      name: 'Test FC',
      shortName: 'TFC',
      primaryColor: '#112233',
      secondaryColor: '#445566',
      crestTemplateId: 'crest-a',
      createdAt: '2026-01-01T00:00:00.000Z',
      firstMatchCompletedAt: '2026-07-24T12:00:00.000Z',
      cashBalance: 100_000,
      transferWindowOpen: true,
      lastTrainingOn: null,
      seasonNumber: 1,
      seasonPhase: 'in_season',
      leagueTier: tier,
    };
  }

  function fixture(): FixtureDto {
    return {
      id: 'fx-1',
      clubId: 'c1',
      matchday: 1,
      competition: 'league',
      opponentClubId: 'opp-wilki-polnocy',
      opponent: { id: 'opp-wilki-polnocy', name: 'Wilki Północy', shortName: 'WLP' },
      isHome: true,
      status: 'upcoming',
      homeScore: null,
      awayScore: null,
      playedAt: null,
      createdAt: '2026-07-24T12:00:00.000Z',
    };
  }

  function xi(skill: number): RosterPlayerSeed[] {
    const roles: PitchRole[] = ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'CM', 'RW', 'CM', 'ST', 'LW'];
    return roles.map((role, i) => ({
      id: `p-${i}`,
      name: `P${i}`,
      number: i + 1,
      pos: 'ŚP',
      role,
      starter: true as const,
      skill,
    }));
  }

  it('wires player and AI skills into MatchSession', () => {
    const session = createSessionFromLeagueFixture(club('ii'), fixture(), xi(80));
    const players = session.getMatchState().players;
    const our = players.filter((p) => String(p.id).startsWith('p-'));
    const ai = players.filter((p) => String(p.id).startsWith('o-'));
    expect(our).toHaveLength(11);
    expect(ai).toHaveLength(11);
    for (const p of our) {
      expect(p.skills.finishing).toBe(80);
    }
    const profile = resolveLeagueStrengthProfile('ii');
    for (const p of ai) {
      expect(p.skills.finishing).toBeGreaterThanOrEqual(profile.minSkill);
      expect(p.skills.finishing).toBeLessThanOrEqual(profile.maxSkill);
    }
  });

  it('fails closed when our XI skill is missing', () => {
    const bad = xi(70).map((p, i) => (i === 0 ? { ...p, skill: undefined } : p));
    expect(() => createSessionFromLeagueFixture(club('iv'), fixture(), bad)).toThrow(
      /missing skill/,
    );
  });
});
