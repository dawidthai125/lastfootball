import type { Personality } from '@/lib/squad/depth';
import { resolveDressingConflict, type DressingPlayer } from '@/lib/squad/dressing-room';

/** Same threshold as dressing-room conflict (SSOT for low-morale attention). */
export const MORALE_ATTENTION = 45;

export type MoraleHintPlayer = {
  readonly id: string;
  readonly name: string;
  readonly morale?: number | null;
  readonly personality?: string | null;
  readonly starter: boolean;
  readonly status?: string;
};

function asPersonality(value: string | null | undefined): Personality {
  if (value === 'lider' || value === 'wybuchowy' || value === 'spokojny') return value;
  return 'spokojny';
}

function toDressingPlayer(p: MoraleHintPlayer): DressingPlayer | null {
  if (p.status === 'DEPARTED') return null;
  return {
    id: p.id,
    name: p.name,
    morale: typeof p.morale === 'number' ? p.morale : 60,
    personality: asPersonality(p.personality),
    starter: p.starter,
  };
}

/**
 * Qualitative morale strip for Training / attention (Information Thin).
 * REUSE resolveDressingConflict — no second conflict rule.
 */
export function resolveMoraleHint(players: readonly MoraleHintPlayer[]): string | null {
  const dressing = players.map(toDressingPlayer).filter((p): p is DressingPlayer => p != null);
  const conflict = resolveDressingConflict(dressing);
  if (conflict) {
    return `${conflict.subject} — zajrzyj do Wiadomości.`;
  }
  const low = dressing
    .filter((p) => p.starter && p.morale < MORALE_ATTENTION)
    .slice()
    .sort((a, b) => a.morale - b.morale || a.id.localeCompare(b.id));
  if (low.length === 0) return null;
  if (low.length === 1) {
    const only = low[0]!;
    return `${only.name}: niskie morale (${only.morale}).`;
  }
  return `${low.length} starterów z niskim morale — sprawdź kadrę.`;
}
