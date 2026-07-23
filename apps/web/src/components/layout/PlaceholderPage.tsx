import type { ReactNode } from 'react';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';

type PlaceholderPageProps = {
  title: string;
  subtitle: string;
  children?: ReactNode;
};

/** Dense placeholder for sections without live data yet. */
export function PlaceholderPage({ title, subtitle, children }: PlaceholderPageProps) {
  return (
    <div>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        action={<Badge tone="info">Podgląd UI</Badge>}
      />
      {children ?? (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          <Panel title="Status sekcji">
            <p className="text-[12px] text-[var(--lf-muted)]">
              Layout i nawigacja gotowe. Treść tej sekcji pojawi się wraz z mechanikami z GDD.
            </p>
          </Panel>
          <Panel title="Szybkie akcje">
            <ul className="space-y-1 text-[12px] text-[var(--lf-muted)]">
              <li className="border border-[var(--lf-border)] bg-[var(--lf-inset)] px-2 py-1.5">
                Brak dostępnych akcji
              </li>
            </ul>
          </Panel>
          <Panel title="Notatki">
            <p className="text-[12px] text-[var(--lf-faint)]">
              Dane tymczasowe — nie stanowią reguł gry.
            </p>
          </Panel>
        </div>
      )}
    </div>
  );
}
