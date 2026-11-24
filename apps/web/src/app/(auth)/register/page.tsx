import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { AuthStage } from '@/components/auth/AuthStage';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { env } from '@/config/env';
import { INVITE_COOKIE } from '@/lib/invites/code';
import { findInviter } from '@/lib/invites/store';

export const metadata: Metadata = {
  title: 'Załóż klub',
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const inviter = await findInviter((await cookies()).get(INVITE_COOKIE)?.value);
  return (
    <AuthStage
      tone="register"
      eyebrow="Pierwszy krok kariery"
      title="Rozpocznij jako menedżer"
      lead="Załóż konto — zaraz potem nadasz klubowi imię, barwy i herb. Bez zbędnych pól."
    >
      {inviter ? (
        <p className="lf-auth-form__info" role="status">
          Zaprasza Cię {inviter.name}. Po założeniu klubu czeka Wasz mecz.
        </p>
      ) : null}
      {!env.isSupabaseConfigured ? (
        <p className="lf-auth-form__error" role="alert">
          Auth wymaga skonfigurowanego Supabase (env).
        </p>
      ) : null}
      <RegisterForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null} />
    </AuthStage>
  );
}
