/**
 * Post-match note. The model only phrases facts the match already counted.
 * Chain matches Bitek: xAI, then Groq, then Gemini. A bad or empty answer
 * falls through. Tavily is a web search key and is not called here.
 */

export type MatchNoteFacts = {
  readonly homeName: string;
  readonly awayName: string;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly homeShots: number;
  readonly awayShots: number;
  readonly homePasses: number;
  readonly awayPasses: number;
  readonly goals: readonly {
    readonly minute: string;
    readonly side: string;
    readonly text: string;
  }[];
  readonly why: string;
};

export type MatchNoteProvider = {
  readonly id: 'xai' | 'groq' | 'gemini';
  readonly url: string;
  readonly apiKey: string;
  readonly model: string;
  readonly timeoutMs: number;
  readonly reasoningEffort?: 'low';
};

type Env = Record<string, string | undefined>;
type FetchFn = typeof fetch;

const SYSTEM = [
  'Jesteś komentatorem Last Football.',
  'Napisz dwa krótkie zdania po polsku.',
  'Korzystasz tylko z JSON-a.',
  'Nie dodajesz goli, nazwisk, kartek ani wyniku spoza faktów.',
  'Wynik podajesz tylko liczbami z pola wynik.',
  'Bez listy, bez nagłówka, bez adresów.',
].join(' ');

const SCORE = /\b(\d{1,2})\s*[:–-]\s*(\d{1,2})\b/g;

function present(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length >= 8 ? trimmed : null;
}

/** Same models as Bitek chat. A missing key drops that provider. */
export function matchNoteProviders(env: Env): MatchNoteProvider[] {
  const list: MatchNoteProvider[] = [];
  const xai = present(env.XAI_API_KEY);
  if (xai) {
    list.push({
      id: 'xai',
      url: 'https://api.x.ai/v1/chat/completions',
      apiKey: xai,
      model: 'grok-4.7',
      timeoutMs: 8000,
    });
  }
  const groq = present(env.GROQ_API_KEY);
  if (groq) {
    list.push({
      id: 'groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: groq,
      model: 'openai/gpt-oss-20b',
      timeoutMs: 8000,
      reasoningEffort: 'low',
    });
  }
  const gemini = present(env.GEMINI_API_KEY);
  if (gemini) {
    list.push({
      id: 'gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      apiKey: gemini,
      model: 'gemini-3.5-flash-lite',
      timeoutMs: 8000,
      reasoningEffort: 'low',
    });
  }
  return list;
}

export function matchNoteMessages(facts: MatchNoteFacts): {
  role: 'system' | 'user';
  content: string;
}[] {
  return [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: JSON.stringify({
        gospodarze: facts.homeName,
        goscie: facts.awayName,
        wynik: `${facts.homeScore}:${facts.awayScore}`,
        strzaly: [facts.homeShots, facts.awayShots],
        podaniaCelne: [facts.homePasses, facts.awayPasses],
        gole: facts.goals,
        fakt: facts.why,
      }),
    },
  ];
}

/** Keeps a short Polish note that names a club and does not invent the score. */
export function acceptMatchNote(raw: string, facts: MatchNoteFacts): string | null {
  const text = raw.replace(/\s+/g, ' ').trim();
  if (text.length < 20 || text.length > 420) return null;
  if (text.includes('```') || text.includes('http') || text.startsWith('{')) return null;
  const names = [facts.homeName.trim(), facts.awayName.trim()].filter((name) => name.length > 0);
  if (names.length === 0 || !names.some((name) => text.includes(name))) return null;
  for (const match of text.matchAll(SCORE)) {
    const left = Number(match[1]);
    const right = Number(match[2]);
    const sameOrder = left === facts.homeScore && right === facts.awayScore;
    const swapped = left === facts.awayScore && right === facts.homeScore;
    if (!sameOrder && !swapped) return null;
  }
  return text;
}

async function complete(
  provider: MatchNoteProvider,
  facts: MatchNoteFacts,
  fetchFn: FetchFn,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), provider.timeoutMs);
  try {
    const response = await fetchFn(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: matchNoteMessages(facts),
        temperature: 0.4,
        max_tokens: 220,
        ...(provider.reasoningEffort ? { reasoning_effort: provider.reasoningEffort } : {}),
      }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const json = (await response.json()) as {
      choices?: { message?: { content?: unknown } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** First accepted note in provider order. No providers or all failures return null. */
export async function composeMatchNote(
  facts: MatchNoteFacts,
  providers: readonly MatchNoteProvider[],
  fetchFn: FetchFn,
): Promise<string | null> {
  for (const provider of providers) {
    const raw = await complete(provider, facts, fetchFn);
    if (!raw) continue;
    const accepted = acceptMatchNote(raw, facts);
    if (accepted) return accepted;
  }
  return null;
}
