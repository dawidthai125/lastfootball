import { describe, expect, it } from 'vitest';

import {
  acceptMatchNote,
  composeMatchNote,
  matchNoteProviders,
  type MatchNoteFacts,
} from './match-note';

const facts: MatchNoteFacts = {
  homeName: 'Lastovia',
  awayName: 'Orzeł',
  homeScore: 1,
  awayScore: 0,
  homeShots: 9,
  awayShots: 3,
  homePasses: 140,
  awayPasses: 100,
  goals: [{ minute: "80'", side: 'home', text: 'Gol Lastovia' }],
  why: 'Mecz otworzył się późno.',
};

function jsonResponse(content: string, status = 200): Response {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status });
}

describe('matchNoteProviders', () => {
  it('skips a short key and keeps xAI before Groq before Gemini', () => {
    expect(matchNoteProviders({})).toEqual([]);
    const list = matchNoteProviders({
      GEMINI_API_KEY: 'gemini-key-ok',
      GROQ_API_KEY: 'groq-key-ok',
      XAI_API_KEY: 'xai-key-ok',
      TAVILY_API_KEY: 'tavily-key-ok',
    });
    expect(list.map((provider) => provider.id)).toEqual(['xai', 'groq', 'gemini']);
    expect(list[0]?.model).toBe('grok-4.7');
    expect(list[1]?.model).toBe('openai/gpt-oss-20b');
    expect(list[2]?.model).toBe('gemini-3.5-flash-lite');
  });
});

describe('acceptMatchNote', () => {
  it('keeps two sentences that name a club and the real score', () => {
    expect(acceptMatchNote('Lastovia wygrała 1:0. Gola dała końcówka.', facts)).toBe(
      'Lastovia wygrała 1:0. Gola dała końcówka.',
    );
  });

  it('drops a note that invents another score', () => {
    expect(acceptMatchNote('Lastovia wygrała 4:0 po jednostronnym meczu.', facts)).toBeNull();
  });

  it('drops a note that names neither club', () => {
    expect(acceptMatchNote('Gospodarze wygrali po późnym golu w końcówce.', facts)).toBeNull();
  });
});

describe('composeMatchNote', () => {
  it('uses the next provider when the first answer invents a score', async () => {
    const calls: string[] = [];
    const fetchFn = (async (url: RequestInfo | URL) => {
      calls.push(String(url));
      if (String(url).includes('api.x.ai')) return jsonResponse('Lastovia rozbiła rywala 5:0.');
      return jsonResponse('Orzeł przegrał 1:0. Lastovia miała więcej strzałów.');
    }) as typeof fetch;
    const note = await composeMatchNote(
      facts,
      matchNoteProviders({ XAI_API_KEY: 'xai-key-ok', GROQ_API_KEY: 'groq-key-ok' }),
      fetchFn,
    );
    expect(note).toBe('Orzeł przegrał 1:0. Lastovia miała więcej strzałów.');
    expect(calls).toHaveLength(2);
  });

  it('returns null when every provider fails', async () => {
    const fetchFn = (async () => new Response('no', { status: 500 })) as typeof fetch;
    const note = await composeMatchNote(
      facts,
      matchNoteProviders({ XAI_API_KEY: 'xai-key-ok' }),
      fetchFn,
    );
    expect(note).toBeNull();
  });
});
