import type { Metadata } from 'next';

import { RegisterForm } from '@/components/auth/RegisterForm';
import { env } from '@/config/env';

export const metadata: Metadata = {
  title: 'Załóż klub',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="lf-landing__gate lf-landing__gate--auth">
      <p className="lf-landing__eyebrow">Nowy menedżer</p>
      <h1>Utwórz konto</h1>
      <p className="lf-landing__gate-lead">
        Najpierw konto — zaraz potem stworzysz swój klub. Bez zbędnych pól.
      </p>
      {!env.isSupabaseConfigured ? (
        <p className="lf-auth-form__error" role="alert">
          Auth wymaga skonfigurowanego Supabase (env).
        </p>
      ) : null}
      <RegisterForm />
    </div>
  );
}
