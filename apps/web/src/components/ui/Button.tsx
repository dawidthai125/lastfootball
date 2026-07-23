import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'primary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

const variants: Record<Variant, string> = {
  default:
    'border-[var(--lf-border-strong)] bg-[var(--lf-panel-alt)] text-[var(--lf-text)] hover:border-[var(--lf-gold-dim)] hover:bg-[var(--lf-panel-hover)]',
  primary:
    'border-[var(--lf-gold-dim)] bg-[var(--lf-gold-soft)] text-[var(--lf-gold)] hover:border-[var(--lf-gold)]',
  ghost: 'border-transparent bg-transparent text-[var(--lf-muted)] hover:text-[var(--lf-text)]',
  danger:
    'border-[var(--lf-danger)]/40 bg-[var(--lf-danger-soft)] text-[var(--lf-danger)] hover:border-[var(--lf-danger)]',
};

const sizes: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-[12px]',
};

export function Button({
  variant = 'default',
  size = 'sm',
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-1 border font-[family-name:var(--font-ui)] font-medium tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      style={{ borderRadius: 'var(--lf-radius)' }}
      {...rest}
    >
      {children}
    </button>
  );
}
