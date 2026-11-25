import type { FixtureDto } from '@/lib/fixtures/types';

/** Stake line on the pre-match screen. League keeps the club's tier name. */
export function preMatchStakeValue(
  competition: FixtureDto['competition'],
  leagueLabel: string,
): string {
  if (competition === 'human') return 'Liga ludzi';
  if (competition === 'challenge') return 'Wyzwanie';
  if (competition === 'cup') return 'Puchar';
  return leagueLabel;
}

/** League weather names the club's tier. Other competitions stay neutral. */
export function preMatchWeatherDetail(
  competition: FixtureDto['competition'],
  leagueGenitive: string,
): string {
  if (competition !== 'league') return 'Bez wpływu na mecz';
  return `Warunki typowe dla ${leagueGenitive}`;
}

/** Weather has no effect. The sentence names the competition the player is about to play. */
export function preMatchWeatherNote(competition: FixtureDto['competition']): string {
  const kind =
    competition === 'human'
      ? 'Liga ludzi'
      : competition === 'challenge'
        ? 'Wyzwanie'
        : competition === 'cup'
          ? 'Puchar'
          : 'Mecz ligowy';
  return `${kind} — pogoda nie wpływa na wynik`;
}
