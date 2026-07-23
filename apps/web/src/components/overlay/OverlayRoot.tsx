'use client';

import Link from 'next/link';

import { useOverlay } from '@/components/overlay/OverlayProvider';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Oferta transferowa', meta: '2h', href: '/transfers' },
  { id: '2', title: 'Raport skauta', meta: '5h', href: '/scouting' },
  { id: '3', title: 'Wiadomość zarządu', meta: '1d', href: '/messages' },
] as const;

export function OverlayRoot() {
  const { active, close } = useOverlay();

  if (!active) return null;

  return (
    <div className="fixed inset-0" style={{ zIndex: 'var(--lf-z-modal)' }} role="presentation">
      <button
        type="button"
        aria-label="Zamknij overlay"
        className="absolute inset-0 border-0"
        style={{
          background: 'var(--lf-color-overlay-scrim)',
          zIndex: 'var(--lf-z-overlay)',
          cursor: 'pointer',
        }}
        onClick={close}
      />

      {active === 'notifications' ? (
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Powiadomienia"
          className="absolute top-0 right-0 flex h-full flex-col border-l"
          style={{
            width: 'var(--lf-overlay-panel-width)',
            maxWidth: '100%',
            background: 'var(--lf-color-bg-panel)',
            borderColor: 'var(--lf-color-border-subtle)',
            boxShadow: 'var(--lf-shadow-md)',
            zIndex: 'var(--lf-z-modal)',
            borderRadius: 'var(--lf-radius-none)',
          }}
        >
          <header
            className="flex items-center justify-between border-b"
            style={{
              borderColor: 'var(--lf-color-border-subtle)',
              background: 'var(--lf-color-bg-panel-alt)',
              padding: 'var(--lf-space-3)',
              height: 'var(--lf-shell-topbar)',
            }}
          >
            <h2
              className="font-[family-name:var(--font-ui)] font-semibold uppercase"
              style={{
                fontSize: 'var(--lf-type-label)',
                letterSpacing: 'var(--lf-type-tracking-label)',
                color: 'var(--lf-color-text-gold)',
              }}
            >
              Powiadomienia
            </h2>
            <button
              type="button"
              onClick={close}
              className="border bg-transparent"
              style={{
                borderColor: 'var(--lf-color-border-subtle)',
                color: 'var(--lf-color-text-muted)',
                fontSize: 'var(--lf-type-caption)',
                padding: 'var(--lf-space-1) var(--lf-space-2)',
                borderRadius: 'var(--lf-radius-sm)',
              }}
            >
              Zamknij
            </button>
          </header>

          <ul className="flex-1 overflow-y-auto" style={{ padding: 'var(--lf-space-2)' }}>
            {MOCK_NOTIFICATIONS.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href}
                  onClick={close}
                  className="flex items-center justify-between border-b transition-colors"
                  style={{
                    borderColor: 'var(--lf-color-border-subtle)',
                    padding: 'var(--lf-space-2) var(--lf-space-2)',
                    fontSize: 'var(--lf-type-table)',
                    color: 'var(--lf-color-text-secondary)',
                    transitionDuration: 'var(--lf-motion-fast)',
                    transitionTimingFunction: 'var(--lf-motion-easing)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--lf-color-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>{n.title}</span>
                  <span style={{ color: 'var(--lf-color-text-faint)', fontSize: 'var(--lf-type-caption)' }}>
                    {n.meta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <footer
            className="border-t"
            style={{
              borderColor: 'var(--lf-color-border-subtle)',
              padding: 'var(--lf-space-2)',
            }}
          >
            <button
              type="button"
              className="w-full border"
              style={{
                borderColor: 'var(--lf-color-border-gold)',
                background: 'var(--lf-color-gold-soft)',
                color: 'var(--lf-color-gold-base)',
                fontSize: 'var(--lf-type-caption)',
                padding: 'var(--lf-space-2)',
                borderRadius: 'var(--lf-radius-sm)',
              }}
              onClick={close}
            >
              Oznacz wszystkie jako przeczytane
            </button>
          </footer>
        </aside>
      ) : null}
    </div>
  );
}
