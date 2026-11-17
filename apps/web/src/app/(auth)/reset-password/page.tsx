import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthStage } from '@/components/auth/AuthStage';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Nowe hasło',
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  const supabase = env.isSupabaseConfigured ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  return (
    <AuthStage
      tone="login"
      eyebrow="Konto"
      title="Nowe hasło"
      lead="Ustaw hasło po kliknięciu w link z maila."
    >
      {!env.isSupabaseConfigured ? (
        <p className="lf-auth-form__error" role="alert">
          Auth wymaga skonfigurowanego Supabase (env).
        </p>
      ) : !user ? (
        <p className="lf-auth-form__error" role="alert">
          Link wygasł albo sesja resetu nie doszła. Poproś o nowy link.
        </p>
      ) : (
        <ResetPasswordForm />
      )}
      <p className="lf-auth-form__switch">
        <Link href="/login" className="lf-auth-form__link">
          Wróć do logowania
        </Link>
      </p>
    </AuthStage>
  );
}
