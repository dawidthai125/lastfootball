/** High-level style labels — optional hint for UI / future planners. */
export type TacticStyle = 'balanced' | 'attacking' | 'defensive';

export function styleFromMentality(mentality: number): TacticStyle {
  if (mentality >= 65) return 'attacking';
  if (mentality <= 35) return 'defensive';
  return 'balanced';
}
