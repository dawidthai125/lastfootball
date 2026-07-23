import type { CSSProperties } from 'react';

import type { FormResult } from '@/data/fixtures';

const sizeMap = {
  md: 'calc(var(--lf-space-8) + var(--lf-space-2))',
  lg: 'calc(var(--lf-space-8) + var(--lf-space-5))',
} as const;

export function CrestMonogram({
  initials,
  label,
  size = 'lg',
}: {
  initials: string;
  label?: string;
  size?: keyof typeof sizeMap;
}) {
  const dim = sizeMap[size];
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        className="font-[family-name:var(--font-ui)] font-bold"
        title={label}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: dim,
          height: dim,
          marginInline: 'auto',
          background: 'var(--lf-color-gold-soft)',
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-gold)',
          color: 'var(--lf-color-gold-base)',
          fontSize: size === 'lg' ? 'var(--lf-type-h1)' : 'var(--lf-type-h2)',
          borderRadius: 'var(--lf-radius-sm)',
        }}
      >
        {initials}
      </div>
      {label ? (
        <div
          style={{
            marginTop: 'var(--lf-space-2)',
            fontSize: 'var(--lf-type-caption)',
            color: 'var(--lf-color-text-muted)',
            maxWidth: 'calc(var(--lf-space-8) * 3)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
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
