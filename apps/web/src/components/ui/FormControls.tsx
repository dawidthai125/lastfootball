import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

type FieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
};

const controlBase =
  'w-full border border-[var(--lf-border)] bg-[var(--lf-inset)] px-2 py-1 text-[12px] text-[var(--lf-text)] placeholder:text-[var(--lf-faint)] focus:border-[var(--lf-gold-dim)] focus:outline-none disabled:opacity-40';

export function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <label className="block space-y-0.5" htmlFor={htmlFor}>
      <span className="block text-[10px] font-semibold tracking-wide text-[var(--lf-muted)] uppercase">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-[10px] text-[var(--lf-faint)]">{hint}</span> : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={[controlBase, props.className ?? ''].join(' ')} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={[controlBase, props.className ?? ''].join(' ')} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[controlBase, 'min-h-[72px] resize-y', props.className ?? ''].join(' ')}
    />
  );
}

export function Checkbox({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="inline-flex items-center gap-1.5 text-[12px] text-[var(--lf-text)]">
      <input type="checkbox" {...props} className="size-3.5 accent-[var(--lf-gold)]" />
      <span>{label}</span>
    </label>
  );
}
