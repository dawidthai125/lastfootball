/**
 * One Polish sentence for a live match event.
 * Passes stay out of the spoken feed. The score still comes from the tick engine.
 */

export type CommentaryContext = {
  readonly homeName: string;
  readonly awayName: string;
  readonly playerName?: (id: string) => string;
};

export type CommentaryFeedItem = {
  readonly id: string;
  readonly text: string;
  readonly kind: string;
};

export function commentaryLine(
  event: { readonly type: string; readonly payload?: unknown },
  context: CommentaryContext,
): string {
  const payload = event.payload;
  const side = readSide(payload);
  const team = teamName(side, context);

  switch (event.type) {
    case 'MATCH_START':
      return 'Zaczynamy. Piłka w grze.';
    case 'HALF_END':
      return 'Koniec połowy.';
    case 'MATCH_END':
      return 'Koniec meczu.';
    case 'GOAL':
      return goalLine(payload, team, context);
    case 'SHOT':
      return shotLine(payload, team, context);
    case 'ATTACK':
      return `${team} rusza do ataku.`;
    case 'FOUL':
      return foulLine(payload, context);
    case 'CORNER':
      return `Rzut rożny dla ${team}.`;
    case 'FREE_KICK':
      return setPieceLine('Rzut wolny', payload, team, context);
    case 'PENALTY':
      return setPieceLine('Rzut karny', payload, team, context);
    case 'OFFSIDE':
      return offsideLine(payload, side ? team : null, context);
    case 'CARD':
      return cardLine(payload, context);
    case 'SUBSTITUTION':
      return substitutionLine(payload, team, context);
    case 'FORMATION_CHANGE':
      return formationLine(payload, team);
    case 'INJURY': {
      const player = named(context, readString(payload, 'playerId'));
      if (!player) return 'Kontuzja.';
      return readBool(payload, 'forcedOff')
        ? `Kontuzja. ${player} nie może grać dalej.`
        : `${player} potrzebuje pomocy, ale zostaje na boisku.`;
    }
    case 'VAR':
      return 'Sędzia sprawdza sytuację.';
    case 'SYSTEM':
      return systemLine(payload, context);
    case 'PASS':
      return '';
    default:
      return 'Sytuacja na boisku.';
  }
}

/**
 * The line to read aloud. Goals in the fresh batch win over a newer shot.
 * Every fresh id is marked, so turning the commentator on does not read history
 * and a busy pulse does not queue the whole list.
 */
export function pickCommentaryUtterance(
  feed: readonly CommentaryFeedItem[],
  spokenIds: ReadonlySet<string>,
): { id: string; text: string; markIds: string[] } | null {
  const fresh = feed.filter((item) => !spokenIds.has(item.id) && item.text.trim().length > 0);
  if (fresh.length === 0) return null;
  const goals = fresh.filter((item) => item.kind === 'goal');
  const chosen = goals.length > 0 ? goals[goals.length - 1]! : fresh[fresh.length - 1]!;
  return {
    id: chosen.id,
    text: chosen.text,
    markIds: fresh.map((item) => item.id),
  };
}

export function polishVoice<T extends { readonly lang: string }>(voices: readonly T[]): T | null {
  return voices.find((voice) => voice.lang.toLowerCase().startsWith('pl')) ?? null;
}

function goalLine(payload: unknown, team: string, context: CommentaryContext): string {
  const scorer = named(context, readString(payload, 'playerId'));
  if (!scorer) return `Gol! ${team} zdobywa bramkę.`;
  const assist = named(context, readString(payload, 'assistPlayerId'));
  if (readBool(payload, 'penalty')) return `Gol z karnego! ${scorer} strzela dla ${team}.`;
  if (readBool(payload, 'freeKick')) return `Gol z wolnego! ${scorer} strzela dla ${team}.`;
  const base = readBool(payload, 'header')
    ? `Gol głową po rożnym! ${scorer} strzela dla ${team}.`
    : `Gol! ${scorer} strzela dla ${team}.`;
  return assist ? `${base} Asysta: ${assist}.` : base;
}

function shotLine(payload: unknown, team: string, context: CommentaryContext): string {
  const player = named(context, readString(payload, 'playerId'));
  const who = player ?? team;
  if (readBool(payload, 'penalty') && readBool(payload, 'missed')) {
    return readBool(payload, 'onTarget')
      ? `${who} nie trafia z karnego. Bramkarz broni.`
      : `${who} nie trafia z karnego. Pudło.`;
  }
  return readBool(payload, 'onTarget')
    ? `${who} oddaje strzał w światło bramki.`
    : `${who} oddaje strzał.`;
}

function foulLine(payload: unknown, context: CommentaryContext): string {
  const player = named(context, readString(payload, 'playerId'));
  return player ? `Faul. ${player}.` : 'Faul.';
}

function setPieceLine(
  label: string,
  payload: unknown,
  team: string,
  context: CommentaryContext,
): string {
  const player = named(context, readString(payload, 'playerId'));
  return player ? `${label} dla ${team}. Do piłki podchodzi ${player}.` : `${label} dla ${team}.`;
}

function offsideLine(payload: unknown, team: string | null, context: CommentaryContext): string {
  const player = named(context, readString(payload, 'playerId'));
  if (player) return `Spalony. ${player}.`;
  return team ? `Spalony. ${team}.` : 'Spalony.';
}

function cardLine(payload: unknown, context: CommentaryContext): string {
  const player = named(context, readString(payload, 'playerId'));
  const who = player ? ` dla ${player}` : '';
  const colour = (
    readString(payload, 'colour') ??
    readString(payload, 'color') ??
    readString(payload, 'card') ??
    ''
  ).toLowerCase();
  if (colour === 'red' && readBool(payload, 'second')) {
    return player ? `Druga żółta. ${player} schodzi z boiska.` : 'Druga żółta kartka.';
  }
  if (colour === 'red' || colour === 'red_card') return `Czerwona kartka${who}.`;
  if (colour === 'yellow' || colour === 'yellow_card') return `Żółta kartka${who}.`;
  return player ? `Kartka dla ${player}.` : 'Kartka.';
}

function substitutionLine(payload: unknown, team: string, context: CommentaryContext): string {
  const outName = named(context, readString(payload, 'playerOutId'));
  const inName = named(context, readString(payload, 'playerInId'));
  if (outName && inName && readString(payload, 'reason') === 'injury') {
    return `Za kontuzjowanego wchodzi ${inName}.`;
  }
  if (outName && inName) return `${outName} schodzi. Wchodzi ${inName}.`;
  return `Zmiana w drużynie ${team}.`;
}

function formationLine(payload: unknown, team: string): string {
  const code = readString(payload, 'formationCode');
  return code ? `${team} zmienia ustawienie na ${code}.` : `${team} zmienia ustawienie.`;
}

function systemLine(payload: unknown, context: CommentaryContext): string {
  const kind = readString(payload, 'kind') ?? '';
  const value = readFinite(payload, 'value');
  const rounded = value === null ? null : Math.round(value);
  switch (kind) {
    case 'second_half_start':
      return 'Zaczyna się druga połowa.';
    case 'pressing':
      return rounded === null ? 'Pressing zmieniony.' : `Pressing ustawiony na ${rounded}.`;
    case 'tempo':
      return rounded === null ? 'Tempo zmienione.' : `Tempo ustawione na ${rounded}.`;
    case 'width':
      return rounded === null ? 'Szerokość zmieniona.' : `Szerokość ustawiona na ${rounded}.`;
    case 'mentality':
      return rounded === null ? 'Mentalność zmieniona.' : `Mentalność ustawiona na ${rounded}.`;
    case 'tactics_change':
      return 'Zmiana taktyki.';
    case 'player_instruction':
      return 'Nowa instrukcja dla zawodnika.';
    case 'pause':
      return 'Mecz zatrzymany.';
    case 'resume':
      return 'Gra wznowiona.';
    case 'penalty_decider':
      return `${teamName(readSide(payload), context)} wygrywa w karnych${shootOutScore(payload)}.`;
    default:
      return 'Sytuacja na boisku.';
  }
}

/** " 4:2" from the winner's side. Empty for a match from before the kicks were played. */
export function shootOutScore(payload: unknown): string {
  const kicks = payloadOf(payload)?.shootOut as { home?: unknown; away?: unknown } | undefined;
  if (typeof kicks?.home !== 'number' || typeof kicks.away !== 'number') return '';
  return readSide(payload) === 'away'
    ? ` ${kicks.away}:${kicks.home}`
    : ` ${kicks.home}:${kicks.away}`;
}

function teamName(side: 'home' | 'away' | null, context: CommentaryContext): string {
  if (!side) return 'drużyna';
  const name = (side === 'home' ? context.homeName : context.awayName).trim();
  return name.length > 0 ? name : 'drużyna';
}

function named(context: CommentaryContext, id: string | null): string | null {
  if (!id) return null;
  const name = context.playerName?.(id)?.trim();
  return name && name.length > 0 ? name : null;
}

function payloadOf(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== 'object') return null;
  return payload as Record<string, unknown>;
}

function readString(payload: unknown, key: string): string | null {
  const value = payloadOf(payload)?.[key];
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readSide(payload: unknown): 'home' | 'away' | null {
  const side = readString(payload, 'side');
  return side === 'home' || side === 'away' ? side : null;
}

function readBool(payload: unknown, key: string): boolean {
  return payloadOf(payload)?.[key] === true;
}

function readFinite(payload: unknown, key: string): number | null {
  const value = payloadOf(payload)?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
