import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthStage } from '@/components/auth/AuthStage';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { env } from '@/config/env';

export const metadata: Metadata = {
  title: 'Reset hasła',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthStage
      tone="login"
      eyebrow="Konto"
      title="Nie pamiętam hasła"
      lead="Wyślemy link do ustawienia nowego hasła. Działa tylko, gdy konto istnieje."
    >
      {!env.isSupabaseConfigured ? (
        <p className="lf-auth-form__error" role="alert">
          Auth wymaga skonfigurowanego Supabase (env).
        </p>
      ) : (
        <ForgotPasswordForm />
      )}
      <p className="lf-auth-form__switch">
        <Link href="/login" className="lf-auth-form__link">
          Wróć do logowania
        </Link>
      </p>
    </AuthStage>
  );
}
