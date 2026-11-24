import type { PlayerRowDto } from '@/lib/squad/types';

/** The database refused a write computed from a player who changed since (SQLSTATE). */
export const SQUAD_MOVED_CODE = 'LFOLD';
export const SQUAD_MOVED_ERROR = 'Kadra zmieniła się w tym czasie. Spróbuj ponownie.';

/**
 * The row as it was read, in database columns. The write goes through only when the player
 * still looks like this. Undefined on a database without these columns.
 */
export function seenState(player: PlayerRowDto): Record<string, unknown> | undefined {
  if (!player.stored) return undefined;
  return {
    energy: player.stored.energy,
    energy_on: player.stored.energyOn,
    status: player.stored.status,
    skill: player.skill,
    ...(typeof player.morale === 'number' ? { morale: player.morale } : {}),
    ...(player.groups
      ? {
          attr_attack: player.groups.attack,
          attr_passing: player.groups.passing,
          attr_defense: player.groups.defense,
          attr_physical: player.groups.physical,
          attr_goalkeeping: player.groups.goalkeeping,
        }
      : {}),
  };
}
