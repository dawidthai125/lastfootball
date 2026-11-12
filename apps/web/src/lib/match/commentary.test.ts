import { describe, expect, it } from 'vitest';

import { commentaryLine, pickCommentaryUtterance, polishVoice } from './commentary';

const teams = {
  homeName: 'Lastovia',
  awayName: 'Orzeł',
  playerName: (id: string) =>
    ({ 'home-9': 'Kowalski', 'home-7': 'Nowak', 'away-4': 'Lewy' })[id] ?? 'zawodnik',
};

describe('commentaryLine', () => {
  it('opens the match and closes the half in full sentences', () => {
    expect(commentaryLine({ type: 'MATCH_START' }, teams)).toBe('Zaczynamy. Piłka w grze.');
    expect(commentaryLine({ type: 'HALF_END' }, teams)).toBe('Koniec połowy.');
    expect(commentaryLine({ type: 'MATCH_END' }, teams)).toBe('Koniec meczu.');
    expect(commentaryLine({ type: 'SYSTEM', payload: { kind: 'second_half_start' } }, teams)).toBe(
      'Zaczyna się druga połowa.',
    );
  });

  it('names the scorer, the assist, and the team', () => {
    expect(
      commentaryLine(
        {
          type: 'GOAL',
          payload: { side: 'home', playerId: 'home-9', assistPlayerId: 'home-7' },
        },
        teams,
      ),
    ).toBe('Gol! Kowalski strzela dla Lastovia. Asysta: Nowak.');
  });

  it('falls back to the team when a goal has no scorer', () => {
    expect(commentaryLine({ type: 'GOAL', payload: { side: 'away' } }, teams)).toBe(
      'Gol! Orzeł zdobywa bramkę.',
    );
  });

  it('distinguishes a shot on target from a foul and a corner', () => {
    expect(
      commentaryLine(
        { type: 'SHOT', payload: { side: 'home', playerId: 'home-9', onTarget: true } },
        teams,
      ),
    ).toBe('Kowalski oddaje strzał w światło bramki.');
    expect(commentaryLine({ type: 'SHOT', payload: { side: 'away' } }, teams)).toBe(
      'Orzeł oddaje strzał.',
    );
    expect(commentaryLine({ type: 'FOUL', payload: { playerId: 'away-4' } }, teams)).toBe(
      'Faul. Lewy.',
    );
    expect(commentaryLine({ type: 'FOUL', payload: {} }, teams)).toBe('Faul.');
    expect(commentaryLine({ type: 'CORNER', payload: { side: 'home' } }, teams)).toBe(
      'Rzut rożny dla Lastovia.',
    );
  });

  it('reads a card, a substitution, and a formation change', () => {
    expect(
      commentaryLine({ type: 'CARD', payload: { playerId: 'away-4', colour: 'yellow' } }, teams),
    ).toBe('Żółta kartka dla Lewy.');
    expect(
      commentaryLine(
        {
          type: 'SUBSTITUTION',
          payload: { side: 'home', playerOutId: 'home-9', playerInId: 'home-7' },
        },
        teams,
      ),
    ).toBe('Kowalski schodzi. Wchodzi Nowak.');
    expect(
      commentaryLine(
        { type: 'FORMATION_CHANGE', payload: { side: 'away', formationCode: '4-3-3' } },
        teams,
      ),
    ).toBe('Orzeł zmienia ustawienie na 4-3-3.');
  });

  it('does not produce a pass sentence', () => {
    expect(
      commentaryLine({ type: 'PASS', payload: { side: 'home', playerId: 'home-9' } }, teams),
    ).toBe('');
  });
});

describe('pickCommentaryUtterance', () => {
  it('prefers a goal and marks every fresh line so the rest is not queued', () => {
    const pick = pickCommentaryUtterance(
      [
        { id: 'a', text: 'Lastovia rusza do ataku.', kind: 'shot' },
        { id: 'b', text: 'Gol! Kowalski strzela dla Lastovia.', kind: 'goal' },
        { id: 'c', text: 'Kowalski oddaje strzał.', kind: 'shot' },
      ],
      new Set(),
    );

    expect(pick).toEqual({
      id: 'b',
      text: 'Gol! Kowalski strzela dla Lastovia.',
      markIds: ['a', 'b', 'c'],
    });
  });

  it('reads only the newest fresh line when nobody scored', () => {
    const spoken = new Set(['a']);
    expect(
      pickCommentaryUtterance(
        [
          { id: 'a', text: 'Faul.', kind: 'info' },
          { id: 'b', text: 'Rzut rożny dla Lastovia.', kind: 'corner' },
          { id: 'c', text: 'Orzeł rusza do ataku.', kind: 'shot' },
        ],
        spoken,
      )?.id,
    ).toBe('c');
  });

  it('returns nothing when every line was already spoken', () => {
    expect(
      pickCommentaryUtterance(
        [{ id: 'a', text: 'Zaczynamy. Piłka w grze.', kind: 'info' }],
        new Set(['a']),
      ),
    ).toBeNull();
  });
});

describe('polishVoice', () => {
  it('picks a Polish voice and ignores the rest', () => {
    expect(polishVoice([{ lang: 'en-US' }, { lang: 'pl-PL' }])?.lang).toBe('pl-PL');
    expect(polishVoice([{ lang: 'pl' }])?.lang).toBe('pl');
    expect(polishVoice([{ lang: 'en-GB' }])).toBeNull();
  });
});
