import type { Metadata } from 'next';

import { AuthStage } from '@/components/auth/AuthStage';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { env } from '@/config/env';

export const metadata: Metadata = {
  title: 'Załóż klub',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <AuthStage
      tone="register"
      eyebrow="Pierwszy krok kariery"
      title="Rozpocznij jako menedżer"
      lead="Załóż konto — zaraz potem nadasz klubowi imię, barwy i herb. Bez zbędnych pól."
    >
      {!env.isSupabaseConfigured ? (
        <p className="lf-auth-form__error" role="alert">
          Auth wymaga skonfigurowanego Supabase (env).
        </p>
      ) : null}
      <RegisterForm />
    </AuthStage>
  );
}
