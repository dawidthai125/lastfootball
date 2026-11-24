/** Copy for both channels. Push carries no names, amounts or ids. */

import { isOverdueRef } from '@/lib/notifications/planner';
import type { NotificationKind } from '@/lib/notifications/types';

type Copy = { readonly title: string; readonly body: string; readonly path: string };

const COPY: Readonly<Record<NotificationKind, Copy>> = {
  matchday: {
    title: 'Mecz ligowy czeka',
    body: 'Dzisiejsza kolejka jest otwarta. Zagraj, kiedy masz chwilę.',
    path: '/matches',
  },
  human_round: {
    title: 'Liga ludzi o 18:00',
    body: 'Dziś wspólny początek kolejki. Możesz jeszcze sprawdzić skład.',
    path: '/league',
  },
  offer: {
    title: 'Oferta transferowa',
    body: 'W Transferach czeka oferta na Twoją decyzję.',
    path: '/transfers',
  },
  challenge: {
    title: 'Rywal zagrał z Twoim klubem',
    body: 'Wynik wyzwania jest już w Rywalizacji.',
    path: '/rivals',
  },
};

const OVERDUE_ROUND: Copy = {
  title: 'Liga ludzi: zaległa kolejka',
  body: 'Masz zaległą kolejkę. Możesz ją rozegrać, kiedy chcesz.',
  path: '/league',
};

function copyFor(kind: NotificationKind, ref: string): Copy {
  return kind === 'human_round' && isOverdueRef(ref) ? OVERDUE_ROUND : COPY[kind];
}

export type PushPayload = {
  readonly title: string;
  readonly body: string;
  readonly path: string;
  readonly tag: string;
};

export function pushPayload(kind: NotificationKind, ref: string): PushPayload {
  return { ...copyFor(kind, ref), tag: `lf-${kind}` };
}

export const TEST_PUSH_PAYLOAD: PushPayload = {
  title: 'Próbne powiadomienie',
  body: 'Działa. Tak będą wyglądać powiadomienia z Last Football.',
  path: '/settings',
  tag: 'lf-test',
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** One printable line: player-typed names must not add lines to a letter. */
function oneLine(value: string): string {
  return value
    .replace(/[\p{C}\p{Zl}\p{Zp}]+/gu, ' ')
    .trim()
    .slice(0, 60);
}

export type EmailLetter = {
  readonly subject: string;
  readonly text: string;
  readonly html: string;
};

export function emailLetter(input: {
  readonly kind: NotificationKind;
  readonly ref: string;
  readonly clubName: string;
  readonly origin: string;
  readonly unsubscribeUrl: string;
}): EmailLetter {
  const copy = copyFor(input.kind, input.ref);
  const club = oneLine(input.clubName) || 'Twój klub';
  const link = `${input.origin}${copy.path}`;
  const settings = `${input.origin}/settings`;
  const text = [
    copy.title,
    '',
    copy.body,
    link,
    '',
    `Klub: ${club}. Ten list przyszedł, bo włączono powiadomienia w ustawieniach gry.`,
    `Ustawienia: ${settings}`,
    `Wypisz się: ${input.unsubscribeUrl}`,
  ].join('\n');
  const html = [
    '<!doctype html><html lang="pl"><body style="font-family:Arial,sans-serif;line-height:1.5">',
    `<h1 style="font-size:18px">${escapeHtml(copy.title)}</h1>`,
    `<p>${escapeHtml(copy.body)}</p>`,
    `<p><a href="${escapeHtml(link)}">Otwórz Last Football</a></p>`,
    `<p style="font-size:12px;color:#666">Klub: ${escapeHtml(club)}. Ten list przyszedł, bo włączono powiadomienia w ustawieniach gry.<br>`,
    `<a href="${escapeHtml(settings)}">Ustawienia</a> · <a href="${escapeHtml(input.unsubscribeUrl)}">Wypisz się</a></p>`,
    '</body></html>',
  ].join('');
  return { subject: `${copy.title} · Last Football`, text, html };
}
