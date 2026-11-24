'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';

export function InvitePanel({ link, used }: { readonly link: string; readonly used: number }) {
  const [note, setNote] = useState<string | null>(null);

  async function share() {
    const text = 'Zagraj ze mną w Last Football. Po założeniu klubu od razu czeka nasz mecz.';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Last Football', text, url: link });
        return;
      }
      await navigator.clipboard.writeText(link);
      setNote('Link skopiowany.');
    } catch (problem) {
      if (problem instanceof DOMException && problem.name === 'AbortError') return;
      setNote('Nie udało się skopiować. Zaznacz link i skopiuj go ręcznie.');
    }
  }

  return (
    <Panel title="Zaproś znajomego" className="mt-3">
      <p style={{ margin: '0 0 var(--lf-space-2)' }}>
        Gdy znajomy założy klub z tego linku, od razu dostanie otwarte wyzwanie z Tobą.
      </p>
      <p
        style={{
          margin: '0 0 var(--lf-space-2)',
          overflowWrap: 'anywhere',
          userSelect: 'all',
          color: 'var(--lf-color-text-gold)',
        }}
      >
        {link}
      </p>
      <Button variant="primary" size="md" onClick={() => void share()}>
        Udostępnij link
      </Button>
      <p role="status" style={{ margin: 'var(--lf-space-2) 0 0' }}>
        {note ?? (used > 0 ? `Z Twojego zaproszenia: ${used}.` : '')}
      </p>
    </Panel>
  );
}
