/** Club names other people see. Catches the plain cases; the rest is for reports (D150). */

const LEET: Readonly<Record<string, string>> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
};

/** Refused anywhere in the name, also with spaces or digits between the letters. */
const ANYWHERE = [
  'kurw',
  'jeban',
  'jebac',
  'pierdol',
  'spierdal',
  'wypierdal',
  'skurwysyn',
  'pizd',
  'huje',
  'chuj',
  'cwel',
  'pedal',
  'ciota',
  'szmat',
  'dziwk',
  'czarnuch',
  'zydzisko',
  'jebzyd',
  'hitler',
  'himmler',
  'heilhit',
  'nazist',
  'naziol',
  'auschwitz',
  'holokaust',
  'holocaust',
  'swastyk',
  'kkk',
  'pedofil',
  'gwalt',
  'isis',
  'fuck',
  'nigger',
  'nigga',
  'faggot',
  'bitch',
  'cunt',
  'whore',
  'rapist',
] as const;

/** Refused as a whole word only: inside other words they are harmless. */
const WORDS = [
  'huj',
  'hui',
  'cipa',
  'cipka',
  'kutas',
  'dupa',
  'penis',
  'porno',
  'sex',
  'anal',
  'nazi',
  'sieg',
  'heil',
  'ss',
  'zyd',
  'gay',
  'fag',
  'shit',
  'dick',
  'cock',
  'admin',
  'administrator',
  'moderator',
  'lastfootball',
] as const;

const REFUSED_WHOLE = new Set(['klub usuniety', 'last football', 'lastfootball', 'brak nazwy']);

function plain(value: string): string {
  return value.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/\p{M}/gu, '');
}

const unleet = (value: string) => value.replace(/[0-9]/g, (digit) => LEET[digit] ?? digit);

export function isNameAllowed(raw: string): boolean {
  const text = plain(raw);
  const words = text.split(/[^\p{L}0-9]+/u).filter(Boolean);
  if (REFUSED_WHOLE.has(words.join(' '))) return false;
  for (const variant of [text, unleet(text)]) {
    const tight = variant.replace(/[^\p{L}0-9]/gu, '');
    if (ANYWHERE.some((part) => tight.includes(part))) return false;
  }
  return !words.some((word) =>
    [word, unleet(word)].some((form) => (WORDS as readonly string[]).includes(form)),
  );
}
