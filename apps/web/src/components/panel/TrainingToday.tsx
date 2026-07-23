import Link from 'next/link';

import { dashboardMock } from '@/data/mock';
import { SectionShell } from '@/components/panel/SectionShell';

export function TrainingToday() {
  const t = dashboardMock.nextTraining;

  return (
    <SectionShell title="Trening dziś">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--lf-space-3)',
        }}
      >
        <div>
          <div
            className="font-semibold"
            style={{ fontSize: 'var(--lf-type-body)', color: 'var(--lf-color-text-primary)' }}
          >
            {t.focus}
          </div>
          <div
            style={{
              marginTop: 'var(--lf-space-1)',
              fontSize: 'var(--lf-type-caption)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            {t.when} · Intensywność: {t.intensity}
          </div>
        </div>
        <Link
          href="/training"
          style={{
            borderWidth: 'var(--lf-border-width-hair)',
            borderStyle: 'solid',
            borderColor: 'var(--lf-color-border-gold)',
            background: 'var(--lf-color-gold-soft)',
            color: 'var(--lf-color-gold-base)',
            fontSize: 'var(--lf-type-caption)',
            fontWeight: 600,
            padding: 'var(--lf-space-2) var(--lf-space-3)',
            borderRadius: 'var(--lf-radius-sm)',
            flexShrink: 0,
          }}
        >
          Otwórz
        </Link>
      </div>
    </SectionShell>
  );
}
