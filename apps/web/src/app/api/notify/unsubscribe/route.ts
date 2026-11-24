import { escapeHtml } from '@/lib/notifications/content';
import { isUnsubscribeToken, unsubscribeByToken } from '@/lib/notifications/unsubscribe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function page(status: number, title: string, body: string): Response {
  const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head><body style="margin:0;background:#0B1118;color:#e8edf2;font-family:Arial,sans-serif"><main style="max-width:32rem;margin:15vh auto 0;padding:0 1.5rem;line-height:1.5"><h1 style="font-size:1.4rem">${title}</h1>${body}</main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex',
    },
  });
}

const BAD_LINK = () =>
  page(400, 'Link nie działa', '<p>Możesz wyłączyć e-maile w ustawieniach gry.</p>');

function tokenFrom(request: Request): string | null {
  return new URL(request.url).searchParams.get('t');
}

/** Only asks. Mail scanners open links, so a GET must not change anything. */
export function GET(request: Request): Response {
  const token = tokenFrom(request);
  if (!isUnsubscribeToken(token)) return BAD_LINK();
  return page(
    200,
    'Wypisać z e-maili?',
    `<p>Nie wyślemy więcej e-maili z powiadomieniami z gry.</p><form method="post" action="/api/notify/unsubscribe?t=${escapeHtml(token)}"><button type="submit" style="padding:.6rem 1rem;font-size:1rem">Wypisz mnie</button></form>`,
  );
}

/** The button above and the mail client's one-click (RFC 8058). */
export async function POST(request: Request): Promise<Response> {
  const result = await unsubscribeByToken(tokenFrom(request)).catch(() => 'unavailable' as const);
  if (result === 'bad') return BAD_LINK();
  if (result === 'unavailable') {
    return page(503, 'Spróbuj później', '<p>Nie udało się teraz zapisać zmiany.</p>');
  }
  return page(200, 'Gotowe', '<p>E-maile z powiadomieniami są wyłączone.</p>');
}
