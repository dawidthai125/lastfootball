type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  tone?: 'gold' | 'ok' | 'warn' | 'danger' | 'info';
};

const fillTone: Record<NonNullable<ProgressBarProps['tone']>, string> = {
  gold: 'var(--lf-color-gold-base)',
  ok: 'var(--lf-color-status-ok)',
  warn: 'var(--lf-color-status-warn)',
  danger: 'var(--lf-color-status-danger)',
  info: 'var(--lf-color-status-info)',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  tone = 'gold',
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  return (
    <div>
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--lf-space-2)',
            marginBottom: 'var(--lf-space-1)',
            fontSize: 'var(--lf-type-label)',
          }}
        >
          {label ? <span style={{ color: 'var(--lf-color-text-muted)' }}>{label}</span> : <span />}
          {showValue ? (
            <span className="tabular-nums" style={{ color: 'var(--lf-color-text-faint)' }}>
              {value}/{max}
            </span>
          ) : null}
        </div>
      )}
      <div
        style={{
          height: 'var(--lf-space-2)',
          overflow: 'hidden',
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-subtle)',
          background: 'var(--lf-color-bg-inset)',
          borderRadius: 'var(--lf-radius-xs)',
        }}
      >
        <div style={{ height: '100%', width: `${pct}%`, background: fillTone[tone] }} />
      </div>
    </div>
  );
}
