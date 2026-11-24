export type TalkPersonality = 'spokojny' | 'lider' | 'wybuchowy';

export function isTalkPersonality(value: string): value is TalkPersonality {
  return value === 'spokojny' || value === 'lider' || value === 'wybuchowy';
}

export function demandWage(wage: number, personality: TalkPersonality): number {
  if (!Number.isFinite(wage) || wage < 0) return 0;
  const base = Math.trunc(wage);
  if (personality === 'lider') return base + Math.trunc(base * 0.1);
  if (personality === 'wybuchowy') return base + Math.trunc(base * 0.2);
  return base;
}

export type TalkInput = {
  readonly wage: number;
  readonly offer: number;
  readonly personality: TalkPersonality;
  readonly morale: number;
  /** Last club season the contract covers. Null = not known, so it can be agreed now. */
  readonly contractSeason: number | null;
  readonly season: number;
};

export type TalkResult =
  | { readonly ok: true; readonly wage: number; readonly contractSeason: number }
  | { readonly ok: false; readonly reason: string };

const ALREADY = 'Kontrakt jest już przedłużony.';
const LOW_MORALE = 'Za niski nastrój na rozmowę.';
const BAD_OFFER = 'Podaj pensję w euro.';
const LOW_PAY = 'Za niska pensja.';
const HIGH_PAY = 'Za wysoka pensja.';

/** A talk is open in the last two seasons of a contract and covers two more seasons (D139). */
export function contractTalkOpen(contractSeason: number | null, season: number): boolean {
  return contractSeason === null || contractSeason <= season + 1;
}

export function renewedContractSeason(season: number): number {
  return season + 2;
}

export function talkResult(input: TalkInput): TalkResult {
  if (!contractTalkOpen(input.contractSeason, input.season)) return { ok: false, reason: ALREADY };
  if (!Number.isFinite(input.morale) || input.morale < 40) return { ok: false, reason: LOW_MORALE };
  if (!Number.isInteger(input.offer)) return { ok: false, reason: BAD_OFFER };
  const demand = demandWage(input.wage, input.personality);
  if (input.offer < demand) return { ok: false, reason: LOW_PAY };
  if (input.offer > demand + 5000) return { ok: false, reason: HIGH_PAY };
  return { ok: true, wage: input.offer, contractSeason: renewedContractSeason(input.season) };
}
