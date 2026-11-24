import { describe, expect, it } from 'vitest';

import {
  bareAddress,
  buildForward,
  CONTACT,
  forwardContactMail,
  isLoop,
  type ContactDeps,
  type ReceivedLetter,
} from '@/lib/contact/forward';

const NOW = new Date('2026-11-26T12:00:00Z');
const letter = (id: string, over: Partial<ReceivedLetter> = {}): ReceivedLetter => ({
  id,
  from: 'Gracz <gracz@example.test>',
  to: ['Kontakt@LastFootball.pl'],
  created_at: `2026-11-26T10:00:0${id}Z`,
  subject: 'Pytanie',
  text: 'Cześć',
  html: null,
  attachments: [],
  ...over,
});

function setup(letters: ReceivedLetter[], over: Partial<ContactDeps> = {}) {
  const claimed = new Set<string>();
  const sent: string[] = [];
  const deps: ContactDeps = {
    list: async () => letters,
    read: async (id) => letters.find((l) => l.id === id) ?? null,
    files: async () => [],
    sentSince: async () => 0,
    claim: async (id) => !claimed.has(id) && Boolean(claimed.add(id)),
    release: async (id) => void claimed.delete(id),
    send: async (id) => Boolean(sent.push(id)),
    ...over,
  };
  return { deps, sent, claimed };
}

describe('contact mail (D144)', () => {
  it('forwards once, oldest first', async () => {
    const { deps, sent } = setup([letter('2'), letter('1')]);
    expect(await forwardContactMail(deps, 'x@example.test', NOW)).toEqual({
      forwarded: 2,
      failed: 0,
    });
    await forwardContactMail(deps, 'x@example.test', NOW);
    expect(sent).toEqual(['1', '2']);
  });

  it('skips other addresses of the account and its own letters', async () => {
    const { deps, sent } = setup([
      letter('1', { to: ['biuro@inna.test'] }),
      letter('2', { from: 'X <powiadomienia@lastfootball.pl>' }),
      letter('3', { from: 'bounce@send.lastfootball.pl' }),
    ]);
    await forwardContactMail(deps, 'x@example.test', NOW);
    expect(sent).toEqual([]);
    expect(isLoop('a@notlastfootball.pl')).toBe(false);
  });

  it('tries a failed letter again and stops at the daily limit', async () => {
    const failing = setup([letter('1')], { send: async () => false });
    expect(await forwardContactMail(failing.deps, 'x@example.test', NOW)).toEqual({
      forwarded: 0,
      failed: 1,
    });
    expect(failing.claimed.size).toBe(0);
    const full = setup([letter('1')], { sentSince: async () => CONTACT.perDay });
    await forwardContactMail(full.deps, 'x@example.test', NOW);
    expect(full.sent).toEqual([]);
    const broken = setup([], { list: async () => null });
    expect(await forwardContactMail(broken.deps, 'x@example.test', NOW)).toBeNull();
  });

  it('replies go to the sender, text is escaped, headers stay on one line', () => {
    const mail = buildForward(
      letter('1', { subject: 'A\r\nBcc: z@z.test', text: '<b>x</b>' }),
      'x@example.test',
      [],
    );
    expect(mail.reply_to).toEqual(['gracz@example.test']);
    expect(mail.subject).toBe('[Last Football] A Bcc: z@z.test');
    expect(mail.html).not.toContain('<b>x</b>');
    expect(bareAddress('zła wartość')).toBeNull();
  });

  it('attaches files, or says that they are missing', () => {
    const file = { filename: 'a.png', size: 10, download_url: 'https://cdn.test/a' };
    expect(buildForward(letter('1'), 'x@x.test', [file]).attachments).toHaveLength(1);
    const big = buildForward(letter('1'), 'x@x.test', [
      { ...file, size: CONTACT.maxAttachmentBytes + 1 },
    ]);
    expect(big.attachments).toBeUndefined();
    expect(big.text).toContain('Załączniki nie zostały');
    const forged = buildForward(letter('1', { authentication: { dmarc: 'fail' } }), 'x@x.test', []);
    expect(forged.text).toContain('podrobiony');
  });
});
