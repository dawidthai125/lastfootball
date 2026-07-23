import { dashboardMock, formatMoney } from '@/data/mock';
import { SectionLink, SectionShell } from '@/components/panel/SectionShell';

export function FinanceSummary() {
  const f = dashboardMock.financeSnap;

  const cells = [
    { label: 'Saldo', value: formatMoney(f.balance), tone: 'ok' as const },
    { label: 'Płace / tydz.', value: formatMoney(f.weeklyWage), tone: 'warn' as const },
    { label: 'Ostatnia bramka', value: formatMoney(f.lastMatchGate), tone: 'default' as const },
  ];

  return (
    <SectionShell title="Finanse — skrót" action={<SectionLink href="/finance">więcej →</SectionLink>}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 'var(--lf-space-2)',
        }}
      >
        {cells.map((c) => (
          <div
            key={c.label}
            style={{
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-subtle)',
              background: 'var(--lf-color-bg-inset)',
              padding: 'var(--lf-space-2)',
              borderRadius: 'var(--lf-radius-sm)',
            }}
          >
            <div
              className="font-[family-name:var(--font-ui)] font-semibold uppercase"
              style={{
                fontSize: 'var(--lf-type-label)',
                letterSpacing: 'var(--lf-type-tracking-label)',
                color: 'var(--lf-color-text-faint)',
              }}
            >
              {c.label}
            </div>
            <div
              className="font-[family-name:var(--font-ui)] font-semibold tabular-nums"
              style={{
                marginTop: 'var(--lf-space-1)',
                fontSize: 'var(--lf-type-body)',
                color:
                  c.tone === 'ok'
                    ? 'var(--lf-color-status-ok)'
                    : c.tone === 'warn'
                      ? 'var(--lf-color-status-warn)'
                      : 'var(--lf-color-text-primary)',
              }}
            >
              {c.value}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
