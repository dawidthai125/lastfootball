import type { CSSProperties } from 'react';

import { ClubCrest } from '@/components/assets/ClubCrest';
import type { FormResult } from '@/data/fixtures';

/**
 * Crest from Asset Pack (API kept for existing call sites).
 * `initials` = club shortName key (FCL, ORG, …).
 */
export function CrestMonogram({
  initials,
  label,
  size = 'lg',
}: {
  initials: string;
  label?: string;
  size?: 'md' | 'lg';
}) {
  return <ClubCrest shortName={initials} clubName={label} label={label} size={size} />;
}

export function FormPills({ form }: { form: FormResult[] }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--lf-space-1)', justifyContent: 'center', flexWrap: 'wrap' }}>
      {form.map((r, i) => {
        const style = formResultStyle(r);
        return (
          <span
            key={`${r}-${i}`}
            className="font-[family-name:var(--font-ui)] font-semibold uppercase"
            style={{
              ...pillBase,
              borderColor: style.border,
              background: style.bg,
              color: style.text,
            }}
          >
            {r}
          </span>
        );
      })}
    </div>
  );
}

const pillBase: CSSProperties = {
  fontSize: 'var(--lf-type-label)',
  letterSpacing: 'var(--lf-type-tracking-label)',
  padding: '0 var(--lf-space-1)',
  borderWidth: 'var(--lf-border-width-hair)',
  borderStyle: 'solid',
  borderRadius: 'var(--lf-radius-xs)',
  minWidth: 'var(--lf-space-4)',
  textAlign: 'center',
};

function formResultStyle(r: FormResult) {
  if (r === 'W') {
    return {
      border: 'var(--lf-color-status-ok)',
      bg: 'var(--lf-color-status-ok-soft)',
      text: 'var(--lf-color-status-ok)',
    };
  }
  if (r === 'P') {
    return {
      border: 'var(--lf-color-status-danger)',
      bg: 'var(--lf-color-status-danger-soft)',
      text: 'var(--lf-color-status-danger)',
    };
  }
  return {
    border: 'var(--lf-color-status-warn)',
    bg: 'var(--lf-color-status-warn-soft)',
    text: 'var(--lf-color-status-warn)',
  };
}
