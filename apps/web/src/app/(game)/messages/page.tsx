import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { Badge } from '@/components/ui/Badge';
import { Panel } from '@/components/ui/Panel';

const messages = [
  { id: '1', from: 'Zarząd', subject: 'Oczekiwania na kolejkę 12', when: '1d', unread: true },
  { id: '2', from: 'Skaut', subject: 'Raport: K. Baran', when: '5h', unread: true },
  { id: '3', from: 'System', subject: 'Okno transferowe otwarte', when: '2d', unread: false },
];

export default function MessagesPage() {
  return (
    <PlaceholderPage title="Wiadomości" subtitle="Skrzynka klubowa i systemowa">
      <Panel title="Skrzynka" flush>
        <ul className="divide-y divide-[var(--lf-border)]">
          {messages.map((m) => (
            <li
              key={m.id}
              className={[
                'flex items-center justify-between gap-3 px-2.5 py-2 text-[12px]',
                m.unread ? 'bg-[var(--lf-gold-soft)]/40' : '',
              ].join(' ')}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  {m.unread ? <Badge tone="gold">Nowa</Badge> : null}
                  <span className="font-medium text-[var(--lf-text-strong)]">{m.subject}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-[var(--lf-muted)]">od: {m.from}</div>
              </div>
              <span className="shrink-0 text-[11px] text-[var(--lf-faint)]">{m.when}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </PlaceholderPage>
  );
}
