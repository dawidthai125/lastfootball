import { describe, expect, it, vi } from 'vitest';

import { loadRivalSquad } from '@/lib/rivals/squad';

const rpc = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ rpc }) }));

const POSITIONS = ['BR', 'PO', 'ŚO', 'ŚO', 'LO', 'ŚP', 'ŚP', 'PN', 'ŚP', 'N', 'PN', 'BR', 'N'];

describe('loadRivalSquad', () => {
  it('builds the rival from the groups, as our own side', async () => {
    rpc.mockResolvedValue({
      data: POSITIONS.map((pos, i) => ({
        id: `r${i}`,
        name: `R ${i}`,
        shirt_number: i + 1,
        pos,
        role: pos === 'BR' ? 'GK' : 'CM',
        starter: i < 11,
        captain: false,
        age: 25,
        skill: 80,
        status: 'READY',
        attr_attack: 61,
        attr_passing: 62,
        attr_defense: 63,
        attr_physical: 64,
        attr_goalkeeping: 60,
      })),
      error: null,
    });
    const squad = await loadRivalSquad('rival');
    const groups = { attack: 61, passing: 62, defense: 63, physical: 64, goalkeeping: 60 };
    expect(squad?.xi).toHaveLength(11);
    for (const p of [...squad!.xi, ...squad!.bench]) expect(p.groups).toEqual(groups);
  });
});
