import { beforeEach, describe, expect, it, vi } from 'vitest';

const calls: { name: string; args: Record<string, unknown> }[] = [];
let answer: { data: unknown; error: { code: string } | null };

vi.mock('next/cache', () => ({ revalidatePath: () => undefined }));
vi.mock('@/config/env', () => ({ env: { isSupabaseConfigured: true } }));
vi.mock('@/lib/club/get-manager-club', () => ({
  getManagerClub: async () => ({ id: 'club-1', cashBalance: 70_000 }),
}));
vi.mock('@/lib/fixtures', () => ({ listClubFixtures: async () => [] }));
vi.mock('@/lib/hub', () => ({ resolveHubPhase: () => 'SEASON' }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({}) }));
vi.mock('@/lib/supabase/admin', () => ({
  serverDb: (db: unknown) => db,
  tryAdminClient: () => ({
    rpc: async (name: string, args: Record<string, unknown>) => {
      calls.push({ name, args });
      return answer;
    },
  }),
}));

import { declineAcademyIntake, upgradeAcademy } from '@/lib/academy/actions';

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  calls.length = 0;
});

describe('academy actions', () => {
  it('upgrades from the level the page showed', async () => {
    answer = { data: { ok: true, level: 2 }, error: null };
    expect(await upgradeAcademy({}, form({ level: '1' }))).toMatchObject({ ok: true });
    expect(calls).toEqual([
      {
        name: 'upgrade_academy',
        args: {
          p_club_id: 'club-1',
          p_expected_level: 1,
          p_cost: 60_000,
          p_label: 'Akademia · poziom 2',
        },
      },
    ]);
    answer = { data: { ok: false, reason: 'moved' }, error: null };
    expect((await upgradeAcademy({}, form({ level: '0' }))).error).toContain('odśwież');
  });

  it('asks the database for nothing without a level, cash or a next level', async () => {
    for (const level of ['', 'x', '-1', '2', '3']) {
      expect((await upgradeAcademy({}, form(level ? { level } : {}))).error).toBeTruthy();
    }
    expect(calls).toEqual([]);
  });

  it('says so when there was no open intake to decline', async () => {
    answer = { data: true, error: null };
    expect(await declineAcademyIntake({}, form({ seq: '4' }))).toMatchObject({ ok: true });
    answer = { data: null, error: null };
    expect(await declineAcademyIntake({}, form({ seq: '4' }))).toEqual({
      error: 'Ten nabór jest już zamknięty.',
    });
  });
});
