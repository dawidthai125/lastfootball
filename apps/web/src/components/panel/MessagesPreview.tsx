import Link from 'next/link';

import { dashboardMock } from '@/data/mock';
import { SectionLink, SectionShell } from '@/components/panel/SectionShell';

export function MessagesPreview() {
  const messages = dashboardMock.messagesPreview;

  return (
    <SectionShell title="Wiadomości" flush action={<SectionLink href="/messages">skrzynka →</SectionLink>}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {messages.map((m) => (
          <li
            key={m.id}
            style={{
              borderBottomWidth: 'var(--lf-border-width-hair)',
              borderBottomStyle: 'solid',
              borderBottomColor: 'var(--lf-color-border-subtle)',
              background: m.unread ? 'var(--lf-color-gold-soft)' : 'transparent',
            }}
          >
            <Link
              href="/messages"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--lf-space-3)',
                padding: 'var(--lf-space-2) var(--lf-space-3)',
                fontSize: 'var(--lf-type-table)',
                color: 'var(--lf-color-text-secondary)',
              }}
            >
              <span style={{ minWidth: 0 }}>
                {m.unread ? (
                  <span
                    className="font-[family-name:var(--font-ui)] font-semibold uppercase"
                    style={{
                      marginRight: 'var(--lf-space-2)',
                      fontSize: 'var(--lf-type-label)',
                      color: 'var(--lf-color-text-gold)',
                      borderWidth: 'var(--lf-border-width-hair)',
                      borderStyle: 'solid',
                      borderColor: 'var(--lf-color-border-gold)',
                      background: 'var(--lf-color-gold-soft)',
                      padding: '0 var(--lf-space-1)',
                      borderRadius: 'var(--lf-radius-xs)',
                    }}
                  >
                    Nowa
                  </span>
                ) : null}
                <span style={{ fontWeight: m.unread ? 600 : 400, color: 'var(--lf-color-text-primary)' }}>
                  {m.subject}
                </span>
                <span
                  style={{
                    display: 'block',
                    marginTop: 'var(--lf-space-1)',
                    fontSize: 'var(--lf-type-caption)',
                    color: 'var(--lf-color-text-muted)',
                  }}
                >
                  od: {m.from}
                </span>
              </span>
              <span
                className="tabular-nums"
                style={{ flexShrink: 0, color: 'var(--lf-color-text-faint)', fontSize: 'var(--lf-type-caption)' }}
              >
                {m.when}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
