import type { Metadata } from 'next';

import { LoginForm } from '@/components/auth/LoginForm';
import { env } from '@/config/env';

export const metadata: Metadata = {
  title: 'Zaloguj się',
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith('/') && !params.next.startsWith('//')
      ? params.next
      : undefined;

  let bannerError: string | null = null;
  if (params.error === 'supabase_unconfigured' || !env.isSupabaseConfigured) {
    bannerError = 'Auth wymaga skonfigurowanego Supabase (env).';
  } else if (params.error === 'auth_callback') {
    bannerError = 'Nie udało się potwierdzić sesji. Zaloguj się ponownie.';
  }

  return (
    <div className="lf-landing__gate lf-landing__gate--auth">
      <p className="lf-landing__eyebrow">Powrót do klubu</p>
      <h1>Zaloguj się</h1>
      <p className="lf-landing__gate-lead">Wejdź do swojego świata menedżerskiego.</p>
      <LoginForm nextPath={nextPath} bannerError={bannerError} />
    </div>
  );
}
