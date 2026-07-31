import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { ECONOMY_THIN } from '@/lib/finance/types';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import {
  isAllowedAgreedAmount,
  listAllowedAgreedAmounts,
  NEGOTIATION_THIN,
} from '@/lib/transfers/resolve-negotiation';

/** Canonical migration for TRANSFER_FEE / NEGOTIATION_THIN SQL helpers (LFE-TRANSFERS-09). */
const PARITY_MIGRATION = '20260730150000_transfer_fee_parity_helpers.sql';

function readParitySql(): string {
  return readFileSync(join(process.cwd(), '../../supabase/migrations', PARITY_MIGRATION), 'utf8');
}

function extractFnBody(sql: string, fnName: string): string {
  const re = new RegExp(
    `create or replace function public\\.${fnName}\\([\\s\\S]*?\\)\\s+returns[\\s\\S]*?as \\$\\$([\\s\\S]*?)\\$\\$;`,
    'i',
  );
  const m = sql.match(re);
  if (!m?.[1]) {
    throw new Error(`Missing SQL function body: ${fnName}`);
  }
  return m[1];
}

/** Mirror of SQL derive_transfer_fee_thin using the same integer arithmetic. */
function sqlDeriveFeeMirror(skill: number, age: number): number {
  const { SKILL_MULT, AGE_BONUS, AGE_REF, FLOOR, ROUND } = ECONOMY_THIN.TRANSFER_FEE;
  const raw = skill * SKILL_MULT + Math.max(0, AGE_REF - age) * AGE_BONUS;
  return Math.max(FLOOR, Math.round(raw / ROUND) * ROUND);
}

describe('LFE-TRANSFERS-09 parity gate (TD-01)', () => {
  it('SQL migration markers match ECONOMY_THIN.TRANSFER_FEE', () => {
    const sql = readParitySql();
    const fee = ECONOMY_THIN.TRANSFER_FEE;
    expect(sql).toContain('TRANSFER_FEE_SSOT:');
    expect(sql).toContain(`SKILL_MULT=${fee.SKILL_MULT}`);
    expect(sql).toContain(`AGE_BONUS=${fee.AGE_BONUS}`);
    expect(sql).toContain(`AGE_REF=${fee.AGE_REF}`);
    expect(sql).toContain(`FLOOR=${fee.FLOOR}`);
    expect(sql).toContain(`ROUND=${fee.ROUND}`);

    const feeBody = extractFnBody(sql, 'derive_transfer_fee_thin');
    expect(feeBody).toContain(String(fee.SKILL_MULT));
    expect(feeBody).toContain(String(fee.AGE_BONUS));
    expect(feeBody).toContain(String(fee.AGE_REF));
    expect(feeBody).toContain(String(fee.FLOOR));
    expect(feeBody).toContain(String(fee.ROUND));
  });

  it('SQL migration markers match NEGOTIATION_THIN presets', () => {
    const sql = readParitySql();
    expect(sql).toContain('NEGOTIATION_THIN_SSOT:');
    expect(sql).toContain(`LOW=${NEGOTIATION_THIN.PRESET_LOW_PCT}`);
    expect(sql).toContain(`NORMAL=${NEGOTIATION_THIN.PRESET_NORMAL_PCT}`);
    expect(sql).toContain(`HIGH=${NEGOTIATION_THIN.PRESET_HIGH_PCT}`);
    expect(sql).toContain(`COUNTER=${NEGOTIATION_THIN.COUNTER_PCT}`);

    const allowBody = extractFnBody(sql, 'is_allowed_transfer_amount_thin');
    expect(allowBody).toContain(String(NEGOTIATION_THIN.PRESET_LOW_PCT));
    expect(allowBody).toContain(String(NEGOTIATION_THIN.PRESET_NORMAL_PCT));
    expect(allowBody).toContain(String(NEGOTIATION_THIN.PRESET_HIGH_PCT));
    expect(allowBody).toContain(String(NEGOTIATION_THIN.COUNTER_PCT));
  });

  it('RPC bodies call helpers (no inline fee formula)', () => {
    const sql = readParitySql();
    const counterBody = extractFnBody(sql, 'counter_live_transfer_offer');
    const settleBody = extractFnBody(sql, 'complete_live_h2h_transfer');

    for (const body of [counterBody, settleBody]) {
      expect(body).toContain('derive_transfer_fee_thin');
      expect(body).toContain('is_allowed_transfer_amount_thin');
      expect(body).not.toMatch(/skill\s*\*\s*2000/);
      expect(body).not.toMatch(/\*\s*90\)::numeric/);
    }
  });

  it('deriveTransferFee matches SQL mirror for skill/age matrix', () => {
    const pairs: Array<[number, number]> = [
      [40, 18],
      [50, 22],
      [60, 24],
      [70, 28],
      [80, 30],
      [90, 33],
      [55, 30],
      [1, 40],
    ];
    for (const [skill, age] of pairs) {
      const ts = deriveTransferFee(skill, age);
      expect(ts).toBe(sqlDeriveFeeMirror(skill, age));
      expect(isAllowedAgreedAmount(ts, ts)).toBe(true);
      expect(listAllowedAgreedAmounts(ts)).toHaveLength(4);
    }
  });
});

describe('LFE-TRANSFERS-09 single live settle invoke (TD-02)', () => {
  it('Instant Buy calls completeTransferBuy once and never completeTransferSell', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/lib/transfers/actions-live-instant.ts'),
      'utf8',
    );
    const start = src.indexOf('export async function buyLiveTransferPlayer');
    expect(start).toBeGreaterThan(-1);
    const fn = src.slice(start);
    expect(fn.match(/completeTransferBuy\(/g)?.length).toBe(1);
    expect(fn).not.toContain('completeTransferSell(');
  });

  it('Accept opening uses Sell only; countered uses Buy only (no double call)', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/lib/transfers/actions-live-offers.ts'),
      'utf8',
    );
    const start = src.indexOf('export async function acceptLiveTransferOffer');
    const end = src.indexOf('export async function counterLiveTransferOffer');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const fn = src.slice(start, end);
    expect(fn.match(/completeTransferSell\(/g)?.length).toBe(1);
    expect(fn.match(/completeTransferBuy\(/g)?.length).toBe(1);
    expect(fn).toContain("offer.phase === 'opening'");
    expect(fn).not.toContain('stub-');
  });

  it('complete-deal keeps Single Settlement Path (no completeLiveTransfer export)', () => {
    const src = readFileSync(join(process.cwd(), 'src/lib/transfers/complete-deal.ts'), 'utf8');
    expect(src).toContain('export async function completeTransferBuy');
    expect(src).toContain('export async function completeTransferSell');
    expect(src).not.toMatch(/export\s+async\s+function\s+completeLiveTransfer/);
  });
});
