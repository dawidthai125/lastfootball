import { hashSeed } from '@/lib/match/hash-seed';

/** Invented, common-noun surnames. 44 of them, so a club takes its names without a repeat. */
const SURNAMES =
  'Bobrowski Borsuk Brzozowiec Bukowy Chmura Czapla Drozd Dzięcioł Gawron Grabiec Grądowy Grzmot Jarząb Jastrząb Jaworek Jesion Kamyk Kania Klonowy Kłos Kosiarz Krzemień Lipowy Łąkowy Modrzew Mroźny Olcha Orlik Potok Puszczyk Rosiński Rudzik Rzeczny Sarniak Sikora Skała Sójka Strumień Szpak Świerk Topola Wichura Zając Żbik'.split(
    ' ',
  );
const INITIALS = 'ABDFGHJKLMNOPRSTWZ';
/** Coprime with 44: 44 steps never meet. */
const STEPS = [3, 5, 7, 9, 13, 15, 17, 19] as const;

/** Names of one AI club, always the same: the eleven, then its bench (up to 44). Only for display: the match uses ids and skill. */
export function opponentNames(clubId: string, count = 11): readonly string[] {
  const seed = hashSeed(`${clubId}|names`);
  const step = STEPS[(seed >>> 8) % STEPS.length]!;
  return Array.from({ length: count }, (_, i) => {
    const initial = INITIALS[hashSeed(`${clubId}|initial|${i}`) % INITIALS.length]!;
    return `${initial}. ${SURNAMES[((seed % SURNAMES.length) + i * step) % SURNAMES.length]!}`;
  });
}
